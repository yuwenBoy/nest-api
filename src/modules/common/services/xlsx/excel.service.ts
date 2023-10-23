import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
@Injectable()
export class ExcelService {
  async exportExcel(data: any[], fileName: string): Promise<Buffer> {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
    return buffer;
  }
}
