import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly groqBase = 'https://api.groq.com/openai/v1';
  private readonly groqKey = process.env.GROQ_API_KEY;
  private readonly mxbKey = process.env.MXB_API_KEY; // MixedBread.ai for embeddings

  constructor(private prisma: PrismaService) {}

  private async callGroq(messages: any[], jsonMode = false, model = 'llama3-70b-8192'): Promise<string> {
    if (!this.groqKey) {
      throw new InternalServerErrorException('GROQ_API_KEY not set');
    }

    const body: any = {
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    };

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    let lastError: any;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${this.groqBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqKey}`,
          },
          body: JSON.stringify(body),
        });

        if (res.status === 429) {
          // Rate limited — wait and retry
          await new Promise(r => setTimeout(r, attempt * 1000));
          continue;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          this.logger.error(`Groq API error (attempt ${attempt}): ${JSON.stringify(err)}`);
          lastError = err;
          continue;
        }

        const data = await res.json();
        return data.choices[0]?.message?.content ?? '';
      } catch (err) {
        this.logger.error(`Groq fetch error (attempt ${attempt})`, err);
        lastError = err;
        await new Promise(r => setTimeout(r, attempt * 500));
      }
    }

    this.logger.error('All Groq attempts failed', lastError);
    throw new InternalServerErrorException('AI service temporarily unavailable. Please try again.');
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const content = await this.callGroq(
      [{ role: 'user', content: prompt + '\n\nIMPORTANT: Return ONLY a valid JSON object. No markdown, no explanation, no backticks.' }],
      true,
      'llama3-70b-8192',
    );

    // Strip any accidental markdown fences
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      // Find the JSON object in the response
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON object found');
      return JSON.parse(cleaned.substring(start, end + 1)) as T;
    } catch (parseErr) {
      this.logger.error(`JSON parse failed. Raw content: ${content}`);
      throw new InternalServerErrorException('AI returned invalid JSON. Please retry.');
    }
  }

  async generateText(prompt: string): Promise<string> {
    return this.callGroq(
      [{ role: 'user', content: prompt }],
      false,
      'llama3-8b-8192', // Faster model for text
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.mxbKey) {
      // Fallback handled in matchProperties via GroqSearch
      return [];
    }

    try {
      const res = await fetch('https://api.mixedbread.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.mxbKey}`,
        },
        body: JSON.stringify({
          model: 'mxbai-embed-large-v1',
          input: text,
          normalized: true,
          encoding_format: 'float',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.logger.error(`MixedBread embedding error: ${JSON.stringify(err)}`);
        return [];
      }

      const data = await res.json();
      return data.data[0].embedding;
    } catch (err) {
      this.logger.error('MixedBread embedding fetch failed', err);
      return [];
    }
  }

  async upsertVector(id: string, tenantId: string, values: number[], metadata: any, leadId?: string, unitId?: string) {
    try {
      const vector = `[${values.join(',')}]`;
      const existing = await this.prisma.embedding.findFirst({ where: { id } });
      if (existing) {
        await this.prisma.$executeRaw`
          UPDATE "Embedding"
          SET "embedding" = ${vector}::vector, "metadata" = ${metadata}::jsonb, "updatedAt" = NOW()
          WHERE "id" = ${id}
        `;
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO "Embedding" ("id", "tenantId", "leadId", "unitId", "embedding", "metadata", "createdAt")
          VALUES (${id}, ${tenantId}, ${leadId}, ${unitId}, ${vector}::vector, ${metadata}::jsonb, NOW())
        `;
      }
    } catch (error) {
      this.logger.error(`pgvector upsert failed`, error);
      // Non-fatal — embeddings are optional enhancement
    }
  }

  async queryVector(tenantId: string, values: number[], topK = 5) {
    try {
      const vector = `[${values.join(',')}]`;
      return await this.prisma.$queryRaw<any[]>`
        SELECT "id", "leadId", "unitId", "metadata", "embedding" <=> ${vector}::vector AS distance
        FROM "Embedding"
        WHERE "tenantId" = ${tenantId}
        ORDER BY distance ASC
        LIMIT ${topK}
      `;
    } catch (error) {
      this.logger.error(`pgvector query failed`, error);
      return [];
    }
  }
  async matchProperties(buyerPref: any, tenantId: string) {
    // 1. Fetch active properties
    const properties = await this.prisma.property.findMany({
      where: { tenantId, status: 'AVAILABLE' },
    });

    if (properties.length === 0) return [];

    // Mode A: Semantic Matching (if MixedBread/Embedding key present)
    if (this.mxbKey) {
      const prefText = `Seeking ${buyerPref.bhk} BHK in ${buyerPref.locationPref || 'area'}, budget around ${buyerPref.budgetMin}-${buyerPref.budgetMax}, purpose: ${buyerPref.purpose}. Amenities needed: ${buyerPref.amenities?.join(', ')}.`;
      const queryVector = await this.generateEmbedding(prefText);

      if (queryVector.length > 0) {
        const matches = await Promise.all(properties.map(async (p) => {
          let pVector: number[];
          if (p.embedding) {
            pVector = JSON.parse(p.embedding);
          } else {
            const pText = `${p.title}. ${p.type} at ${p.location}. Price: ${p.price}. Area: ${p.areaSqft} sqft. BHK: ${p.bhk}. Amenities: ${p.amenities.join(', ')}.`;
            pVector = await this.generateEmbedding(pText);
            if (pVector.length > 0) {
              await this.prisma.property.update({ where: { id: p.id }, data: { embedding: JSON.stringify(pVector) } });
            }
          }

          const score = pVector.length > 0 ? this.cosineSimilarity(queryVector, pVector) : 0;
          return { 
            ...p, 
            matchScore: Math.round(score * 100),
            matchReasons: this.getMatchReasons(buyerPref, p)
          };
        }));
        return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
      }
    }

    // Mode B: GroqSearch (Keyword Extraction + weighted intersection)
    const prompt = `Convert these buyer preferences into 10 comma-separated searching keywords:
    Budget: ${buyerPref.budgetMin}-${buyerPref.budgetMax}, Location: ${buyerPref.locationPref}, BHK: ${buyerPref.bhk}, Amenities: ${buyerPref.amenities}.
    Return ONLY keywords.`;
    
    const keywordsRaw = await this.generateText(prompt);
    const keywords = keywordsRaw.split(',').map(k => k.trim().toLowerCase());

    const matches = properties.map(p => {
      const pText = `${p.title} ${p.location} ${p.type} ${p.amenities.join(' ')}`.toLowerCase();
      let matchCount = 0;
      keywords.forEach(k => { if (pText.includes(k)) matchCount++; });
      
      const score = (matchCount / keywords.length);
      return {
        ...p,
        matchScore: Math.round(score * 100),
        matchReasons: this.getMatchReasons(buyerPref, p)
      };
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private getMatchReasons(pref: any, p: any): string[] {
    const reasons = [];
    if (pref.bhk && p.bhk && String(p.bhk).includes(String(pref.bhk).replace(/\D/g, ''))) reasons.push('Matching BHK configuration');
    if (p.price >= pref.budgetMin && p.price <= pref.budgetMax) reasons.push('Fits within your budget');
    if (pref.locationPref && p.location.toLowerCase().includes(pref.locationPref.toLowerCase())) reasons.push('Located in your preferred area');
    return reasons;
  }
}
