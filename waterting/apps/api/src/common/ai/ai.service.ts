import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private gemini: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  private async callOpenAI(endpoint: string, body: any) {
    const res = await fetch(`https://api.openai.com/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      this.logger.error(`OpenAI error: ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('AI Service Error');
    }
    return res.json();
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    if (process.env.GEMINI_API_KEY) {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt + '\nReturn ONLY a valid JSON object.');
      const text = result.response.text();
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(jsonStr) as T;
    }

    const data = await this.callOpenAI('chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(data.choices[0].message.content) as T;
  }

  async generateText(prompt: string): Promise<string> {
    if (process.env.GEMINI_API_KEY) {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }

    const data = await this.callOpenAI('chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return data.choices[0].message.content;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const data = await this.callOpenAI('embeddings', {
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });
    return data.data[0].embedding;
  }

  async upsertVector(id: string, tenantId: string, values: number[], metadata: any, leadId?: string, unitId?: string) {
    try {
      const vector = `[${values.join(',')}]`;
      // Check if it exists
      const existing = await this.prisma.embedding.findFirst({
        where: { id },
      });

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
      this.logger.error(`pgvector upsert failed for tenant ${tenantId}`, error);
      throw new InternalServerErrorException('Vector storage failed');
    }
  }

  async queryVector(tenantId: string, values: number[], topK = 5) {
    try {
      const vector = `[${values.join(',')}]`;
      // Use pgvector cosine similarity (<=> is distance, so lower is closer)
      const results = await this.prisma.$queryRaw<any[]>`
        SELECT "id", "leadId", "unitId", "metadata", "embedding" <=> ${vector}::vector AS distance
        FROM "Embedding"
        WHERE "tenantId" = ${tenantId}
        ORDER BY distance ASC
        LIMIT ${topK}
      `;
      return results;
    } catch (error) {
      this.logger.error(`pgvector query failed for tenant ${tenantId}`, error);
      throw new InternalServerErrorException('Vector search failed');
    }
  }
}
