import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { S140PdfService } from './s140-pdf.service';

@Controller()
export class S140PdfController {
  constructor(private readonly s140PdfService: S140PdfService) {}

  @Get('schedule/months/:yearMonth/s140.pdf')
  async download(
    @Param('yearMonth') yearMonth: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename, contentType } =
      await this.s140PdfService.renderMonth(yearMonth);

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}
