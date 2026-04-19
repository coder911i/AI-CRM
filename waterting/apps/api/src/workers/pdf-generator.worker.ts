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

      // Header
      doc.fontSize(22).fillColor('#1E293B').text('BOOKING CONFIRMATION CERTIFICATE', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#64748B').text(`Certificate ID: ${booking.id.toUpperCase()}`, { align: 'center' });
      doc.moveDown(2);

      // Main Info
      doc.fontSize(12).fillColor('#1E293B').text('CUSTOMER DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Name: ${booking.buyerName}`);
      doc.text(`Phone: ${booking.buyerPhone}`);
      doc.text(`Email: ${booking.buyerEmail || 'N/A'}`);
      doc.moveDown(1.5);

      doc.fontSize(12).text('UNIT ALLOTMENT', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Project: ${booking.unit?.tower?.project?.name || 'N/A'}`);
      doc.text(`Tower/Block: ${booking.unit?.tower?.name || 'N/A'}`);
      doc.text(`Unit Number: ${booking.unit?.unitNumber} — Level ${booking.unit?.floor}`);
      doc.text(`Accommodation Type: ${booking.unit?.type.replace('_', ' ')}`);
      doc.text(`Carpet Area: ${booking.unit?.carpetArea} sq ft`);
      doc.moveDown(1.5);

      // Payment Schedule Table
      doc.fontSize(12).text('PAYMENT SCHEDULE & STATUS', { underline: true });
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      doc.fontSize(9).fillColor('#64748B');
      doc.text('MILESTONE', 50, tableTop);
      doc.text('DUE DATE', 250, tableTop);
      doc.text('AMOUNT', 350, tableTop);
      doc.text('STATUS', 450, tableTop);
      
      doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke('#E2E8F0');
      
      let rowY = tableTop + 20;
      doc.fillColor('#1E293B');
      doc.text('Booking Amount', 50, rowY);
      doc.text(new Date(booking.createdAt).toLocaleDateString('en-IN'), 250, rowY);
      doc.text(`₹${booking.bookingAmount?.toLocaleString('en-IN')}`, 350, rowY);
      doc.text(booking.status, 450, rowY);

      doc.moveDown(4);
      
      // Terms
      doc.fontSize(10).text('TERMS & CONDITIONS', { underline: true });
      doc.fontSize(8).fillColor('#64748B').text(
        '1. This is a computer-generated confirmation and does not require a physical signature.\n' +
        '2. All allotments are subject to verification of documents and clearance of payment.\n' +
        '3. RERA rules and project-specific guidelines apply to this booking.',
        { width: 500, align: 'justify' }
      );

      doc.moveDown(3);
      doc.fontSize(10).fillColor('#1E293B').text('Authorised Signatory', 400, doc.y, { align: 'center' });
      doc.text('______________________', 400, doc.y + 12, { align: 'center' });
      
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
