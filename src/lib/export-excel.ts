/**
 * LIKEFOOD - Excel Export Utility
 * Uses xlsx library to generate .xlsx files for download in the browser
 */

import * as XLSX from "xlsx";

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName: string = "Báo cáo"
) {
  if (!data || data.length === 0) {
    throw new Error("Không có dữ liệu để xuất");
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths based on longest string in each column
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger browser download
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

