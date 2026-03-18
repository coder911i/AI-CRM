import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../common/prisma/prisma.service';

@Processor('pdf')
@Injectable()
export class PdfGeneratorWorker {
  private r2: S3Client;
  constructor(private prisma: PrismaService) {
    this.r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  @Process('booking-confirmation')
  async generateBookingConfirmation(job: Job<{ bookingId: string }>) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: job.data.bookingId },
      include: {
        unit: { include: { tower: { include: { project: true } } } },
        payments: { take: 1 },
      },
    });
    if (!booking) return;

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('BOOKING CONFIRMATION', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Buyer: ${booking.buyerName}`);
      doc.text(`Project: ${booking.unit?.tower?.project?.name || 'N/A'}`);
      doc.text(`Unit: ${booking.unit?.unitNumber} — Floor ${booking.unit?.floor}`);
      doc.text(`BHK: ${booking.unit?.type}`);
      doc.text(`Area: ${booking.unit?.carpetArea} sq ft`);
      doc.text(`Booking Amount: ₹${booking.bookingAmount?.toLocaleString('en-IN')}`);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
      doc.end();
    });

    const key = `${booking.unit?.tower?.project?.tenantId}/bookings/${booking.id}/confirmation.pdf`;
    await this.r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    }));

    const signedUrl = await getSignedUrl(
      this.r2,
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }),
      { expiresIn: 3600 }
    );

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { documents: { push: key } },
    });

    return { url: signedUrl };
  }
}
