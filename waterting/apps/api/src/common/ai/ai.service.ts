import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly groqBase = 'https://api.groq.com/openai/v1';
  private readonly groqKey = process.env.GROQ_API_KEY;
  private readonly openaiKey = process.env.OPENAI_API_KEY;

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
    if (!this.openaiKey) {
      this.logger.warn('OPENAI_API_KEY not set. Returning zero vector.');
      return new Array(1536).fill(0);
    }

    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.logger.error(`OpenAI embedding error: ${JSON.stringify(err)}`);
        return new Array(1536).fill(0);
      }

      const data = await res.json();
      return data.data[0].embedding;
    } catch (err) {
      this.logger.error('OpenAI embedding fetch failed', err);
      return new Array(1536).fill(0);
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
}
