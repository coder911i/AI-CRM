import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private geminiKey = process.env.GEMINI_API_KEY;

  async generateJSON<T>(prompt: string): Promise<T> {
    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(res.choices[0].message.content!) as T;
  }

  async generateText(prompt: string): Promise<string> {
    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return res.choices[0].message.content!;
  }
}
