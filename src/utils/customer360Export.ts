import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Exports a DOM element to PDF by capturing it as an image.
 * This ensures the PDF looks exactly like the UI.
 */
export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    logging: false,
    backgroundColor: window.getComputedStyle(document.body).backgroundColor,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Exports customer data to a multi-sheet Excel workbook.
 */
export const exportToExcel = (data: any, filename: string) => {
  const wb = XLSX.utils.book_new();

  // 1. Intelligence Summary Sheet
  if (data.intelligence) {
    const intel = data.intelligence;
    const summaryData = [
      ["Metric", "Value"],
      ["Customer", intel.customer],
      ["Health Score", intel.health_score],
      ["Status", intel.status],
      ["Open Tickets", intel.open_tickets],
      ["SLA Risk", intel.sla_risk],
      ["", ""],
      ["AI Summary Status", intel.ai_summary?.status || ""],
    ];
    const wsIntel = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsIntel, "Intelligence Summary");
  }

  // 2. Journey Timeline Sheet
  if (data.journey?.timeline) {
    const timeline = data.journey.timeline.map((m: any) => ({
      Month: m.label,
      Tickets: m.tickets,
      Resolved: m.resolved,
      Escalated: m.escalated,
      Unresolved: m.unresolved,
      'Avg Res Hours': m.totalResHours / (m.resolved || 1)
    }));
    const wsJourney = XLSX.utils.json_to_sheet(timeline);
    XLSX.utils.book_append_sheet(wb, wsJourney, "Journey Timeline");
  }

  // 3. Recurring Issues Sheet
  if (data.radar?.clusters) {
    const clusters = data.radar.clusters.map((c: any) => ({
      Title: c.title,
      Occurrences: c.occurrences,
      Modules: c.modules.join(', '),
      Trend: c.trend,
      Impact: c.impact,
      'Root Cause': c.rootCause,
      'Suggested Fix': c.suggestedFix,
      'Requires Escalation': c.requiresEscalation ? 'Yes' : 'No'
    }));
    const wsRadar = XLSX.utils.json_to_sheet(clusters);
    XLSX.utils.book_append_sheet(wb, wsRadar, "Recurring Issues");
  }

  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};