import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from './ai.service';

@Injectable()
export class PropertyRecService {
  private readonly logger = new Logger(PropertyRecService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AIService,
  ) {}

  async recommendUnits(tenantId: string, leadId: string, topK = 3) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { project: true },
    });

    if (!lead) throw new Error('Lead not found');

    // 1. Create a preference string for embedding
    const prefString = `
      Budget: ${lead.budgetMin || 0} - ${lead.budgetMax || 'Any'}
      BHK: ${lead.preferredBHK || 'Any'}
      Project: ${lead.project?.name || 'Any'}
      Notes: ${lead.notes || ''}
      Timeline: ${lead.timeline || ''}
    `.trim();

    // 2. Generate embedding for preferences
    const embedding = await this.ai.generateEmbedding(prefString);

    // 3. Query pgvector for matching units
    // We only want AVAILABLE units
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT e."unitId", u."unitNumber", u."type", u."totalPrice", u."floor", t."name" as "towerName", p."name" as "projectName",
             e."embedding" <=> ${`[${embedding.join(',')}]`}::vector AS distance
      FROM "Embedding" e
      JOIN "Unit" u ON e."unitId" = u.id
      JOIN "Tower" t ON u."towerId" = t.id
      JOIN "Project" p ON t."projectId" = p.id
      WHERE e."tenantId" = ${tenantId} AND u.status = 'AVAILABLE' AND e."unitId" IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${topK}
    `;

    // 4. Generate AI explanation for the top match
    if (results.length > 0) {
      const topMatch = results[0];
      const explanation = await this.ai.generateText(`
        Explain why this unit is a good match for this lead.
        Lead Preferences: ${prefString}
        Matched Unit: ${topMatch.type} in ${topMatch.projectName}, ${topMatch.towerName} Floor ${topMatch.floor}. Price: ${topMatch.totalPrice}.
        Keep it professional and concise (2 sentences).
      `);
      topMatch.explanation = explanation;
    }

    return results;
  }

  // Helper to sync unit embeddings
  async syncUnitEmbedding(unitId: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      include: { tower: { include: { project: true } } },
    });

    if (!unit) return;

    const unitString = `
      Project: ${unit.tower.project.name}
      Type: ${unit.type}
      Price: ${unit.totalPrice}
      Area: ${unit.carpetArea} sqft
      Floor: ${unit.floor}
      Facing: ${unit.facing || 'Unknown'}
      Amenities: ${unit.tower.project.amenities.join(', ')}
    `.trim();

    const embedding = await this.ai.generateEmbedding(unitString);
    await this.ai.upsertVector(
      `unit-${unit.id}`,
      unit.tower.project.tenantId,
      embedding,
      { unitId: unit.id, type: unit.type },
      undefined,
      unit.id
    );
  }
}
