import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  private index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);

  async generateJSON<T>(prompt: string, retries = 3): Promise<T> {
    for (let i = 1; i <= retries; i++) {
      try {
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1024 },
        });
        return JSON.parse(result.response.text()) as T;
      } catch (err: any) {
        this.logger.error(`Gemini attempt ${i} failed: ${err.message}`);
        if (i < retries) {
          // Retry logic for 503 or other errors
          await new Promise(r => setTimeout(r, 11000 * i));
        } else {
          throw new InternalServerErrorException('Gemini service failed after retries');
        }
      }
    }
    throw new Error('Gemini failed');
  }

  async generateText(prompt: string, retries = 3): Promise<string> {
    for (let i = 1; i <= retries; i++) {
      try {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        this.logger.error(`Gemini text attempt ${i} failed: ${err.message}`);
        if (i < retries) await new Promise(r => setTimeout(r, 11000 * i));
        else throw new InternalServerErrorException('Gemini service failed');
      }
    }
    throw new Error('Gemini failed');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const res = await fetch(`${process.env.NVIDIA_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` 
        },
        body: JSON.stringify({ 
          model: process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/llama-3.2-nv-embedqc-24k-v1', 
          input: [text], 
          input_type: 'query' 
        }),
      });
      const data = await res.json();
      if (!data.data || !data.data[0]) {
        throw new Error('NVIDIA embedding failed: ' + JSON.stringify(data));
      }
      return data.data[0].embedding;
    } catch (error) {
      this.logger.error('NVIDIA embedding failed', error);
      throw new InternalServerErrorException('Embedding service unavailable');
    }
  }

  async upsertVector(id: string, tenantId: string, values: number[], metadata: any) {
    try {
      const namespace = this.index.namespace(tenantId);
      await namespace.upsert({
        records: [{ id, values, metadata }]
      });
    } catch (error) {
      this.logger.error(`Pinecone upsert failed for tenant ${tenantId}`, error);
      throw new InternalServerErrorException('Vector storage failed');
    }
  }

  async queryVector(tenantId: string, values: number[], topK = 5) {
    try {
      const namespace = this.index.namespace(tenantId);
      return await namespace.query({ vector: values, topK, includeMetadata: true });
    } catch (error) {
      this.logger.error(`Pinecone query failed for tenant ${tenantId}`, error);
      throw new InternalServerErrorException('Vector search failed');
    }
  }
}
