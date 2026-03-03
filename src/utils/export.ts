export const exportToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value); // Stringify objects like custom_fields
      }
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportCsvTemplate = (headers: string[], filename: string) => {
  const csvString = headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadTicketTemplate = () => {
  const headers = [
    'freshdesk_id',
    'subject',
    'priority',
    'status',
    'type',
    'requester_email',
    'created_at',
    'updated_at',
    'due_by',
    'fr_due_by',
    'description_text',
    'assignee',
    'cf_company',
    'cf_country',
    'cf_module',
    'cf_dependency',
    'cf_recurrence'
  ];
  exportCsvTemplate(headers, 'ticket_import_template');
};