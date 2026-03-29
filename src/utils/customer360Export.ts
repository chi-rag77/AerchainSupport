import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Exports a hidden report template to PDF.
 */
export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Temporarily show the element if it's hidden
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
      windowWidth: 1200, // Fixed width for consistent report layout
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

    // Handle multi-page PDF if content is long
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
 * Exports comprehensive customer data to a multi-sheet Excel workbook.
 */
export const exportToExcel = (data: any, filename: string) => {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = [
    ["EXECUTIVE SUMMARY - " + data.customerName.toUpperCase()],
    [""],
    ["Customer", data.customerName],
    ["Health Score", data.intelligence?.health_score || "N/A"],
    ["Status", data.intelligence?.status || "N/A"],
    ["Open Tickets", data.intelligence?.open_tickets || 0],
    ["SLA Risk", data.intelligence?.sla_risk || "N/A"],
    [""],
    ["--- AI SUMMARY ---"],
    ["WHAT'S GOOD"],
    ...(data.intelligence?.ai_summary?.good || []).map((item: string) => ["• " + item]),
    [""],
    ["WHAT'S BAD"],
    ...(data.intelligence?.ai_summary?.bad || []).map((item: string) => ["• " + item]),
    [""],
    ["TOP ISSUES"],
    ...(data.intelligence?.ai_summary?.issues || []).map((item: string) => ["• " + item]),
    [""],
    ["RECOMMENDED ACTIONS"],
    ...(data.intelligence?.ai_summary?.actions || []).map((item: string) => ["• " + item]),
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // 2. KPI Metrics
  const kpiData = [
    ["Metric", "Value", "Trend", "Status"],
    ["Health Score", data.intelligence?.health_score || 0, data.intelligence?.ticket_growth || "0%", data.intelligence?.status || "N/A"],
    ["Open Tickets", data.intelligence?.open_tickets || 0, "N/A", data.intelligence?.open_tickets > 20 ? "High" : "Normal"],
    ["SLA Adherence", (data.intelligence?.health_score_components?.sla_adherence?.score || 0) + "%", "N/A", data.intelligence?.sla_risk || "N/A"],
  ];
  const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKpi, "KPI Metrics");

  // 3. AI Insights (Structured)
  const insightsData = [
    ["Category", "Insight"],
    ...(data.intelligence?.ai_summary?.good || []).map((item: string) => ["Good", item]),
    ...(data.intelligence?.ai_summary?.bad || []).map((item: string) => ["Bad", item]),
    ...(data.intelligence?.ai_summary?.issues || []).map((item: string) => ["Issue", item]),
    ...(data.intelligence?.ai_summary?.actions || []).map((item: string) => ["Action", item]),
  ];
  const wsInsights = XLSX.utils.aoa_to_sheet(insightsData);
  XLSX.utils.book_append_sheet(wb, wsInsights, "AI Insights");

  // 4. Tickets Data (Raw)
  if (data.tickets && data.tickets.length > 0) {
    const ticketsData = data.tickets.map((t: any) => ({
      'Ticket ID': t.id,
      'Subject': t.subject,
      'Status': t.status,
      'Priority': t.priority,
      'Module': t.cf_module || 'N/A',
      'Created Date': format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
      'SLA Status': t.due_by ? (new Date(t.updated_at) <= new Date(t.due_by) ? 'Met' : 'Breached') : 'N/A'
    }));
    const wsTickets = XLSX.utils.json_to_sheet(ticketsData);
    XLSX.utils.book_append_sheet(wb, wsTickets, "Tickets Data");
  }

  // 5. Module Breakdown
  if (data.journey?.moduleStats) {
    const moduleData = data.journey.moduleStats.map((m: any) => ({
      'Module': m.name,
      'Tickets': m.total,
      '% Contribution': Math.round((m.total / (data.tickets?.length || 1)) * 100) + "%"
    }));
    const wsModules = XLSX.utils.json_to_sheet(moduleData);
    XLSX.utils.book_append_sheet(wb, wsModules, "Module Breakdown");
  }

  // 6. Severity Analysis
  if (data.journey?.severityCounts) {
    const sev = data.journey.severityCounts;
    const total = Object.values(sev).reduce((a: any, b: any) => a + b, 0) as number;
    const severityData = Object.entries(sev).map(([name, count]) => ({
      'Severity': name,
      'Count': count,
      '%': Math.round(((count as number) / (total || 1)) * 100) + "%"
    }));
    const wsSeverity = XLSX.utils.json_to_sheet(severityData);
    XLSX.utils.book_append_sheet(wb, wsSeverity, "Severity Analysis");
  }

  // 7. Heatmap Data
  if (data.journey?.timeline) {
    const heatmapData: any[] = [];
    data.journey.timeline.forEach((m: any) => {
      Object.entries(m.modules).forEach(([module, count]) => {
        heatmapData.push({
          'Module': module,
          'Month': m.label,
          'Tickets': count,
          'Impact': (count as number) > 5 ? 'High' : 'Normal'
        });
      });
    });
    const wsHeatmap = XLSX.utils.json_to_sheet(heatmapData);
    XLSX.utils.book_append_sheet(wb, wsHeatmap, "Heatmap Data");
  }

  // 8. Metadata
  const metadataData = [
    ["Generated At", format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ["Data Range", "Last 6 Months"],
    ["Confidence", (data.intelligence?.confidence || 0) + "%"],
    ["Source", "Aerchain AI Intelligence Engine"],
  ];
  const wsMeta = XLSX.utils.aoa_to_sheet(metadataData);
  XLSX.utils.book_append_sheet(wb, wsMeta, "Metadata");

  XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};