import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

/**
 * Exports a hidden report template to PDF.
 */
export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const originalStyle = element.style.display;
  element.style.display = 'block';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } finally {
    element.style.display = originalStyle;
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
  }
};

/**
 * Exports comprehensive customer data to a boardroom-ready Excel dashboard.
 */
export const exportToExcel = async (data: any, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const { intelligence, journey, customerName, tickets } = data;
  const ai = intelligence?.ai_summary;

  // --- SHEET 1: EXECUTIVE SUMMARY ---
  const summarySheet = workbook.addWorksheet('Executive Summary', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 1 }]
  });

  // Column Widths
  summarySheet.columns = [
    { width: 25 }, // A
    { width: 25 }, // B
    { width: 25 }, // C
    { width: 25 }, // D
    { width: 15 }, // E (KPI Strip)
    { width: 15 }, // F (KPI Strip)
  ];

  // 1. HEADER BLOCK
  summarySheet.mergeCells('A1:D1');
  const headerCell = summarySheet.getCell('A1');
  headerCell.value = `EXECUTIVE SUMMARY — ${customerName.toUpperCase()}`;
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  headerCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 16 };
  headerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 32;

  // 2. CUSTOMER OVERVIEW BLOCK
  summarySheet.getRow(2).height = 10; // Spacing

  summarySheet.mergeCells('A3:D3');
  const overviewHeader = summarySheet.getCell('A3');
  overviewHeader.value = 'CUSTOMER OVERVIEW';
  overviewHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  overviewHeader.font = { bold: true };
  overviewHeader.alignment = { vertical: 'middle', horizontal: 'left' };

  const overviewRows = [
    ['Customer', customerName],
    ['Health Score', intelligence?.health_score || 0],
    ['Status', `${intelligence?.health_score < 50 ? '🔴' : intelligence?.health_score < 75 ? '🟡' : '🟢'} ${intelligence?.status || 'N/A'}`],
    ['Open Tickets', intelligence?.open_tickets || 0],
    ['SLA Risk', intelligence?.sla_risk || 'N/A'],
  ];

  overviewRows.forEach((row, i) => {
    const rowIndex = 4 + i;
    summarySheet.getCell(`A${rowIndex}`).value = row[0];
    summarySheet.getCell(`A${rowIndex}`).font = { bold: true };
    
    const valueCell = summarySheet.getCell(`B${rowIndex}`);
    valueCell.value = row[1];
    valueCell.alignment = { horizontal: 'right' };

    // Conditional Formatting for Health Score
    if (row[0] === 'Health Score') {
      const score = Number(row[1]);
      valueCell.font = { 
        bold: true, 
        color: { argb: score < 50 ? 'FFFF0000' : score < 75 ? 'FFB45309' : 'FF15803D' } 
      };
    }
    
    // Conditional Formatting for SLA Risk
    if (row[0] === 'SLA Risk' && row[1] === 'High') {
      valueCell.font = { bold: true, color: { argb: 'FFF97316' } };
    }

    // Add borders to the table
    ['A', 'B'].forEach(col => {
      summarySheet.getCell(`${col}${rowIndex}`).border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });

  // 3. MINI KPI STRIP (Top Right)
  summarySheet.getCell('E1').value = `Health: ${intelligence?.health_score} ${intelligence?.health_score < 50 ? '🔴' : '🟢'}`;
  summarySheet.getCell('E2').value = `SLA: ${intelligence?.health_score_components?.sla_adherence?.score}% ${intelligence?.sla_risk === 'High' ? '⚠️' : '✅'}`;
  summarySheet.getCell('E3').value = `Tickets: ${intelligence?.open_tickets}`;
  ['E1', 'E2', 'E3'].forEach(cell => {
    summarySheet.getCell(cell).font = { size: 9, bold: true, color: { argb: 'FF475569' } };
    summarySheet.getCell(cell).alignment = { horizontal: 'right' };
  });

  // 4. AI SUMMARY SECTION
  summarySheet.mergeCells('A10:D10');
  const aiHeader = summarySheet.getCell('A10');
  aiHeader.value = 'AI EXECUTIVE SUMMARY';
  aiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
  aiHeader.font = { bold: true };

  // WHAT'S GOOD
  summarySheet.mergeCells('A12:D12');
  const goodHeader = summarySheet.getCell('A12');
  goodHeader.value = "WHAT'S GOING WELL";
  goodHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
  goodHeader.font = { bold: true, color: { argb: 'FF15803D' } };
  goodHeader.border = { left: { style: 'thick', color: { argb: 'FF15803D' } } };

  (ai?.good || []).forEach((item: string, i: number) => {
    summarySheet.getCell(`A${13 + i}`).value = `• ${item}`;
    summarySheet.getRow(13 + i).height = 20;
  });

  // WHAT'S BAD
  summarySheet.mergeCells('A16:D16');
  const badHeader = summarySheet.getCell('A16');
  badHeader.value = "WHAT'S GOING WRONG";
  badHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
  badHeader.font = { bold: true, color: { argb: 'FFB91C1C' } };
  badHeader.border = { left: { style: 'thick', color: { argb: 'FFB91C1C' } } };

  (ai?.bad || []).forEach((item: string, i: number) => {
    const cell = summarySheet.getCell(`A${17 + i}`);
    cell.value = `• ${item}`;
    summarySheet.getRow(17 + i).height = 20;
    // Highlight numbers in red (simplified check)
    if (/\d+/.test(item)) {
      cell.font = { color: { argb: 'FFB91C1C' }, bold: true };
    }
  });

  // TOP ISSUES
  summarySheet.mergeCells('A22:D22');
  const issuesHeader = summarySheet.getCell('A22');
  issuesHeader.value = "TOP ISSUES (ROOT CAUSES)";
  issuesHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
  issuesHeader.font = { bold: true, color: { argb: 'FFC2410C' } };

  (ai?.issues || []).forEach((item: string, i: number) => {
    summarySheet.getCell(`A${23 + i}`).value = `• ${item}`;
    summarySheet.getRow(23 + i).height = 20;
  });

  // RECOMMENDED ACTIONS
  summarySheet.mergeCells('A28:D28');
  const actionsHeader = summarySheet.getCell('A28');
  actionsHeader.value = "RECOMMENDED ACTIONS";
  actionsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  actionsHeader.font = { bold: true, color: { argb: 'FF1E40AF' } };

  const actionIcons = ['🔥', '⚠️', '💡'];
  (ai?.actions || []).forEach((item: string, i: number) => {
    summarySheet.getCell(`A${29 + i}`).value = `${actionIcons[i % 3]} ${item}`;
    summarySheet.getRow(29 + i).height = 20;
  });

  // 5. DOMINANT ISSUE HIGHLIGHT
  if (ai?.dominant_issue) {
    summarySheet.mergeCells('A34:D36');
    const highlightCell = summarySheet.getCell('A34');
    highlightCell.value = `🚨 ${ai.dominant_issue.module.toUpperCase()} MODULE = ${ai.dominant_issue.contribution}% OF TOTAL TICKETS\nPrimary driver of customer issues`;
    highlightCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFECACA' } };
    highlightCell.font = { bold: true, size: 12, color: { argb: 'FFB91C1C' } };
    highlightCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  }

  // --- OTHER SHEETS (Standard Data Views) ---

  // KPI Metrics
  const kpiSheet = workbook.addWorksheet('KPI Metrics');
  kpiSheet.columns = [{ header: 'Metric', key: 'm', width: 20 }, { header: 'Value', key: 'v', width: 15 }, { header: 'Trend', key: 't', width: 10 }, { header: 'Status', key: 's', width: 15 }];
  kpiSheet.getRow(1).font = { bold: true };
  kpiSheet.addRows([
    { m: 'Health Score', v: intelligence?.health_score, t: intelligence?.ticket_growth, s: intelligence?.status },
    { m: 'Open Tickets', v: intelligence?.open_tickets, t: 'N/A', s: intelligence?.open_tickets > 20 ? 'High' : 'Normal' },
    { m: 'SLA Adherence', v: `${intelligence?.health_score_components?.sla_adherence?.score}%`, t: 'N/A', s: intelligence?.sla_risk },
  ]);

  // Tickets Data
  const ticketSheet = workbook.addWorksheet('Tickets Data');
  const ticketHeaders = ['Ticket ID', 'Subject', 'Status', 'Priority', 'Module', 'Created Date', 'SLA Status'];
  ticketSheet.addRow(ticketHeaders);
  ticketSheet.getRow(1).font = { bold: true };
  ticketSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  (tickets || []).forEach((t: any) => {
    ticketSheet.addRow([
      t.id, t.subject, t.status, t.priority, t.cf_module || 'N/A', 
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
      t.due_by ? (new Date(t.updated_at) <= new Date(t.due_by) ? 'Met' : 'Breached') : 'N/A'
    ]);
  });
  ticketSheet.autoFilter = 'A1:G1';

  // Module Breakdown
  const moduleSheet = workbook.addWorksheet('Module Breakdown');
  moduleSheet.addRow(['Module', 'Tickets', '% Contribution']);
  moduleSheet.getRow(1).font = { bold: true };
  (journey?.moduleStats || []).forEach((m: any) => {
    moduleSheet.addRow([m.name, m.total, `${Math.round((m.total / (tickets?.length || 1)) * 100)}%`]);
  });

  // Heatmap Data
  const heatmapSheet = workbook.addWorksheet('Heatmap Data');
  heatmapSheet.addRow(['Module', 'Month', 'Tickets', 'Impact']);
  heatmapSheet.getRow(1).font = { bold: true };
  (journey?.timeline || []).forEach((m: any) => {
    Object.entries(m.modules).forEach(([module, count]) => {
      heatmapSheet.addRow([module, m.label, count, (count as number) > 5 ? 'High' : 'Normal']);
    });
  });

  // Metadata
  const metaSheet = workbook.addWorksheet('Metadata');
  metaSheet.addRows([
    ['Generated At', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ['Data Range', 'Last 6 Months'],
    ['Confidence', `${intelligence?.confidence || 0}%`],
    ['Source', 'Aerchain AI Intelligence Engine'],
  ]);
  metaSheet.getColumn(1).font = { bold: true };

  // --- GENERATE AND DOWNLOAD ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};