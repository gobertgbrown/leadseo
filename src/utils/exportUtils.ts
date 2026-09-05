import { Lead, ScrapingJob } from '../types.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Cleans and sanitizes extracted strings, removing common button text or scraping noise
 */
export function cleanField(val?: string | null): string {
  if (!val || val === 'Not Found' || val === 'undefined') return '';
  let cleaned = String(val).trim();
  cleaned = cleaned.replace(
    /\s*(?:Send Us Email|Send Us A Message|Send Email|Contact Us|Contact Info|Get in touch|Submit|Directions|View on map|View map)\b.*$/i,
    ''
  );
  return cleaned.trim();
}

/**
 * Checks if a contact person name is genuine or an accidental button/navigation label
 */
export function sanitizeContactPerson(val?: string | null): string {
  const cleaned = cleanField(val);
  if (!cleaned) return 'Not Discovered';
  if (/^(contact info|contact us|send us email|get in touch|support|our team|about us|home|menu|navigation|search|login|sign up)$/i.test(cleaned)) {
    return 'Not Discovered';
  }
  return cleaned;
}

/**
 * Escapes a field for standard RFC 4180 CSV
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Escapes a field for TSV (Excel friendly)
 */
function escapeTsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
}

/**
 * Generates CSV string from an array of Leads with UTF-8 BOM
 * Includes all A to Z fields thoroughly
 */
export function generateLeadsCsv(leads: Lead[]): string {
  const headers = [
    'Business Name',
    'Category',
    'Description',
    'Website',
    'Email (Primary)',
    'Email Status',
    'Email Confidence (%)',
    'Email Source',
    'Phone (Primary)',
    'Phone Status',
    'Phone Confidence (%)',
    'Phone Source',
    'Alt Phone',
    'Street Address',
    'City',
    'State / Province',
    'Country',
    'Postal Code',
    'Key Contact Person',
    'Executive Role / Title',
    'Contact Person Source',
    'LinkedIn',
    'X (Twitter)',
    'Facebook',
    'Instagram',
    'YouTube',
    'TikTok',
    'GitHub',
    'Verification Status',
    'Overall Confidence Score (%)',
    'Pages Crawled',
    'Crawl Depth',
    'Discovered Pages Count',
    'Last Checked Date',
    'Created At',
  ];

  const rows = leads.map((l) => {
    const contact = sanitizeContactPerson(l.contact_person);
    const address = cleanField(l.address);

    return [
      escapeCsvValue(l.business_name || ''),
      escapeCsvValue(l.category || ''),
      escapeCsvValue(l.description || ''),
      escapeCsvValue(l.website || ''),
      escapeCsvValue(l.email && l.email !== 'Not Found' ? l.email : ''),
      escapeCsvValue(l.email_status || 'Not Found'),
      l.email_confidence ?? '',
      escapeCsvValue(l.email_source || ''),
      escapeCsvValue(l.phone && l.phone !== 'Not Found' ? l.phone : ''),
      escapeCsvValue(l.phone_status || 'Not Found'),
      l.phone_confidence ?? '',
      escapeCsvValue(l.phone_source || ''),
      escapeCsvValue(l.alt_phone || ''),
      escapeCsvValue(address),
      escapeCsvValue(cleanField(l.city)),
      escapeCsvValue(cleanField(l.state)),
      escapeCsvValue(cleanField(l.country)),
      escapeCsvValue(cleanField(l.postal_code)),
      escapeCsvValue(contact === 'Not Discovered' ? '' : contact),
      escapeCsvValue(cleanField(l.contact_person_role)),
      escapeCsvValue(l.contact_person_source || ''),
      escapeCsvValue(l.linkedin && l.linkedin !== 'Not Found' ? l.linkedin : ''),
      escapeCsvValue(l.twitter && l.twitter !== 'Not Found' ? l.twitter : ''),
      escapeCsvValue(l.facebook && l.facebook !== 'Not Found' ? l.facebook : ''),
      escapeCsvValue(l.instagram && l.instagram !== 'Not Found' ? l.instagram : ''),
      escapeCsvValue(l.youtube && l.youtube !== 'Not Found' ? l.youtube : ''),
      escapeCsvValue(l.tiktok && l.tiktok !== 'Not Found' ? l.tiktok : ''),
      escapeCsvValue(l.github && l.github !== 'Not Found' ? l.github : ''),
      escapeCsvValue(l.verification_status || 'Unverified'),
      l.confidence_score ?? 0,
      l.pages_crawled ?? 0,
      l.crawl_depth ?? 2,
      l.source_pages?.length ?? 0,
      escapeCsvValue(l.last_checked || ''),
      escapeCsvValue(l.created_at || ''),
    ];
  });

  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generates TSV (Excel format) with UTF-8 BOM
 * Perfect for direct opening in Microsoft Excel without character corruption
 */
export function generateLeadsTsv(leads: Lead[]): string {
  const headers = [
    'Business Name',
    'Category',
    'Description',
    'Website',
    'Primary Email',
    'Email Status',
    'Email Confidence',
    'Primary Phone',
    'Phone Status',
    'Alt Phone',
    'Street Address',
    'City',
    'State',
    'Country',
    'Postal Code',
    'Contact Person',
    'Executive Role',
    'LinkedIn',
    'X (Twitter)',
    'Facebook',
    'Instagram',
    'YouTube',
    'GitHub',
    'Verification Status',
    'Confidence Score (%)',
    'Pages Crawled',
    'Last Checked',
  ];

  const rows = leads.map((l) => {
    const contact = sanitizeContactPerson(l.contact_person);
    const address = cleanField(l.address);

    return [
      escapeTsvValue(l.business_name || ''),
      escapeTsvValue(l.category || ''),
      escapeTsvValue(l.description || ''),
      escapeTsvValue(l.website || ''),
      escapeTsvValue(l.email && l.email !== 'Not Found' ? l.email : ''),
      escapeTsvValue(l.email_status || 'Not Found'),
      escapeTsvValue(l.email_confidence ? `${l.email_confidence}%` : ''),
      escapeTsvValue(l.phone && l.phone !== 'Not Found' ? l.phone : ''),
      escapeTsvValue(l.phone_status || 'Not Found'),
      escapeTsvValue(l.alt_phone || ''),
      escapeTsvValue(address),
      escapeTsvValue(cleanField(l.city)),
      escapeTsvValue(cleanField(l.state)),
      escapeTsvValue(cleanField(l.country)),
      escapeTsvValue(cleanField(l.postal_code)),
      escapeTsvValue(contact === 'Not Discovered' ? '' : contact),
      escapeTsvValue(cleanField(l.contact_person_role)),
      escapeTsvValue(l.linkedin && l.linkedin !== 'Not Found' ? l.linkedin : ''),
      escapeTsvValue(l.twitter && l.twitter !== 'Not Found' ? l.twitter : ''),
      escapeTsvValue(l.facebook && l.facebook !== 'Not Found' ? l.facebook : ''),
      escapeTsvValue(l.instagram && l.instagram !== 'Not Found' ? l.instagram : ''),
      escapeTsvValue(l.youtube && l.youtube !== 'Not Found' ? l.youtube : ''),
      escapeTsvValue(l.github && l.github !== 'Not Found' ? l.github : ''),
      escapeTsvValue(l.verification_status || 'Unverified'),
      escapeTsvValue(l.confidence_score ?? 0),
      escapeTsvValue(l.pages_crawled ?? 0),
      escapeTsvValue(l.last_checked || ''),
    ];
  });

  return '\uFEFF' + [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\r\n');
}

/**
 * Generates formatted JSON representation of leads
 */
export function generateLeadsJson(leads: Lead[]): string {
  return JSON.stringify(leads, null, 2);
}

/**
 * Generates Audit Log CSV for Scraping Jobs
 */
export function generateAuditLogCsv(jobs: ScrapingJob[]): string {
  const headers = [
    'Job ID',
    'Domain',
    'Target URL',
    'Status',
    'Pages Crawled',
    'Max Pages',
    'Crawl Depth',
    'Duration (Seconds)',
    'Emails Discovered',
    'Phones Discovered',
    'Socials Discovered',
    'Started At',
    'Completed At',
    'Error / Compliance Note',
  ];

  const rows = jobs.map((j) => [
    escapeCsvValue(j.id),
    escapeCsvValue(j.domain),
    escapeCsvValue(j.url),
    escapeCsvValue(j.status),
    j.pages_crawled,
    j.max_pages,
    j.crawl_depth,
    j.duration_seconds,
    j.discovered_counts?.emails ?? 0,
    j.discovered_counts?.phones ?? 0,
    j.discovered_counts?.socials ?? 0,
    escapeCsvValue(j.started_at || ''),
    escapeCsvValue(j.completed_at || ''),
    escapeCsvValue(j.error_message || j.compliance_note || ''),
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generates a clean, executive PDF Dossier for a Single Lead
 */
export function exportSingleLeadPdf(lead: Lead): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    // Header Background Accent Bar
    doc.setFillColor(53, 37, 205); // #3525cd brand indigo
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Title / Brand Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(19, 27, 46); // #131b2e
    doc.text('LEADPULSE AI // BUSINESS INTELLIGENCE DOSSIER', margin, (y += 24));

    // Subheader metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(119, 117, 135); // #777587
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Generated on ${dateStr} • Verification Engine v2.4 • Confidential`, margin, (y += 14));

    // Divider
    doc.setDrawColor(234, 237, 255);
    doc.setLineWidth(1);
    doc.line(margin, (y += 10), pageWidth - margin, y);

    // Business Name & Category Card
    y += 18;
    doc.setFillColor(248, 249, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 60, 6, 6, 'F');
    doc.setDrawColor(218, 222, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 60, 6, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(19, 27, 46);
    doc.text(lead.business_name || 'Target Business', margin + 16, y + 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 69, 85);
    doc.text(lead.category || 'Technology & Business Services', margin + 16, y + 42);

    // Status pill on right of card
    const isVerified = lead.verification_status === 'Verified';
    doc.setFillColor(isVerified ? 0 : 70, isVerified ? 110 : 69, isVerified ? 75 : 85); // Emerald vs slate
    doc.roundedRect(pageWidth - margin - 110, y + 16, 95, 24, 12, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${lead.verification_status || 'Unverified'} (${lead.confidence_score || 0}%)`,
      pageWidth - margin - 105 + 8,
      y + 31
    );

    y += 76;

    // Executive Summary / Description
    if (lead.description) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(19, 27, 46);
      doc.text('EXECUTIVE PROFILE & SUMMARY', margin, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(70, 69, 85);
      const splitDesc = doc.splitTextToSize(lead.description, pageWidth - margin * 2);
      doc.text(splitDesc, margin, y);
      y += splitDesc.length * 13 + 12;
    }

    // Section 1: Verified Inbound Routes (Email & Phone)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(53, 37, 205);
    doc.text('VERIFIED INBOUND CONTACT CHANNELS', margin, y);
    y += 8;

    const contactData = [
      ['Website Target', lead.website || 'N/A', 'Root index crawl target'],
      [
        'Primary Email',
        lead.email && lead.email !== 'Not Found' ? lead.email : 'Not Detected',
        `Status: ${lead.email_status || 'N/A'} • Confidence: ${lead.email_confidence ?? 0}%`,
      ],
      [
        'Primary Phone',
        lead.phone && lead.phone !== 'Not Found' ? lead.phone : 'Not Detected',
        `Status: ${lead.phone_status || 'N/A'} • Confidence: ${lead.phone_confidence ?? 0}%`,
      ],
      [
        'Alternate Phone',
        lead.alt_phone || 'None recorded',
        lead.alt_phone ? 'Secondary line discovered' : 'N/A',
      ],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Channel', 'Value', 'Verification Notes']],
      body: contactData,
      theme: 'grid',
      headStyles: {
        fillColor: [53, 37, 205],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [19, 27, 46],
        cellPadding: 6,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 255],
      },
      columnStyles: {
        0: { cellWidth: 105, fontStyle: 'bold' },
        1: { cellWidth: 210 },
        2: { textColor: [119, 117, 135] },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 16;

    // Section 2: Location & Executive Leadership
    const contactPerson = sanitizeContactPerson(lead.contact_person);
    const address = cleanField(lead.address);
    const locationStr = [cleanField(lead.city), cleanField(lead.state), cleanField(lead.country)]
      .filter(Boolean)
      .join(', ');

    const entityData = [
      ['Physical Address', address || 'Not Discovered on Public Footnotes', lead.address_source || 'Footer / contact markup'],
      ['City, State, Country', locationStr || 'Not Discovered', lead.postal_code ? `Postal Code: ${lead.postal_code}` : 'N/A'],
      ['Key Contact Person', contactPerson, lead.contact_person_role ? `Title: ${lead.contact_person_role}` : 'N/A'],
      ['Executive Source', lead.contact_person_source || 'Team / Bio cards', 'Discovered via semantic markup'],
    ];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(53, 37, 205);
    doc.text('GEOLOCATION & EXECUTIVE LEADERSHIP', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Entity Field', 'Extracted Value', 'Source Reference']],
      body: entityData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [19, 27, 46],
        cellPadding: 6,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 110, fontStyle: 'bold' },
        1: { cellWidth: 210 },
        2: { textColor: [119, 117, 135] },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 16;

    // Section 3: Social Media Channels
    const socials = [
      ['LinkedIn', lead.linkedin && lead.linkedin !== 'Not Found' ? lead.linkedin : 'Not Found'],
      ['X (Twitter)', lead.twitter && lead.twitter !== 'Not Found' ? lead.twitter : 'Not Found'],
      ['Facebook', lead.facebook && lead.facebook !== 'Not Found' ? lead.facebook : 'Not Found'],
      ['Instagram', lead.instagram && lead.instagram !== 'Not Found' ? lead.instagram : 'Not Found'],
      ['YouTube', lead.youtube && lead.youtube !== 'Not Found' ? lead.youtube : 'Not Found'],
      ['GitHub', lead.github && lead.github !== 'Not Found' ? lead.github : 'Not Found'],
    ];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(53, 37, 205);
    doc.text('SOCIAL & DIGITAL PROFILES', margin, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Platform', 'Direct URL / Handle']],
      body: socials,
      theme: 'grid',
      headStyles: {
        fillColor: [53, 37, 205],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [19, 27, 46],
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 255],
      },
      columnStyles: {
        0: { cellWidth: 110, fontStyle: 'bold' },
        1: { textColor: [53, 37, 205] },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 16;

    // Footer on page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(119, 117, 135);
    doc.text(
      `Pages Crawled: ${lead.pages_crawled || 1} • Depth: ${lead.crawl_depth || 2} • Last Audited: ${lead.last_checked || 'N/A'}`,
      margin,
      pageHeight - 20
    );
    doc.text('LeadPulse AI Intelligence Report', pageWidth - margin - 130, pageHeight - 20);

    const safeName = (lead.business_name || 'Lead')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    doc.save(`LeadDossier_${safeName}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Generation failed:', err);
    return false;
  }
}

/**
 * Generates a Multi-lead Executive PDF Table Report
 */
export function exportLeadsTablePdf(leads: Lead[], title = 'Executive Business Leads Report'): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 32;
    let y = margin;

    // Top Accent line
    doc.setFillColor(53, 37, 205);
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(19, 27, 46);
    doc.text(title.toUpperCase(), margin, (y += 20));

    // Stats Bar
    const verifiedCount = leads.filter((l) => l.verification_status === 'Verified').length;
    const emailsCount = leads.filter((l) => l.email && l.email !== 'Not Found').length;
    const phonesCount = leads.filter((l) => l.phone && l.phone !== 'Not Found').length;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(119, 117, 135);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.text(
      `Report Date: ${dateStr}  |  Total Leads: ${leads.length}  |  Verified: ${verifiedCount}  |  With Email: ${emailsCount}  |  With Phone: ${phonesCount}`,
      margin,
      (y += 14)
    );

    y += 10;

    // Prepare table rows
    const tableData = leads.map((l) => {
      const contact = sanitizeContactPerson(l.contact_person);
      const loc = [cleanField(l.city), cleanField(l.state || l.country)]
        .filter(Boolean)
        .join(', ');

      return [
        l.business_name || '',
        l.category || '',
        l.email && l.email !== 'Not Found' ? l.email : 'Not Found',
        l.phone && l.phone !== 'Not Found' ? l.phone : 'Not Found',
        loc || cleanField(l.address) || 'Not Discovered',
        contact === 'Not Discovered' ? 'N/A' : contact,
        l.verification_status || 'Unverified',
        `${l.confidence_score ?? 0}%`,
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [
        [
          'Business Name',
          'Industry / Category',
          'Email',
          'Phone',
          'Location',
          'Contact Person',
          'Status',
          'Confidence',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [53, 37, 205],
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [19, 27, 46],
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 255],
      },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 110 },
        2: { cellWidth: 140 },
        3: { cellWidth: 95 },
        4: { cellWidth: 100 },
        5: { cellWidth: 95 },
        6: { cellWidth: 60, halign: 'center' },
        7: { cellWidth: 55, halign: 'center' },
      },
      didDrawPage: (data) => {
        // Page numbering
        const pageNum = doc.internal.pages.length - 1;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(119, 117, 135);
        doc.text(
          `LeadPulse AI - Page ${pageNum}`,
          pageWidth - margin - 70,
          pageHeight - 12
        );
      },
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`LeadPulse_Leads_Report_${timestamp}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Report generation failed:', err);
    return false;
  }
}

/**
 * Safely downloads a file in the browser using a temporary anchor element
 */
export function downloadFile(content: string, filename: string, mimeType: string): boolean {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
    return true;
  } catch (err) {
    console.error('Download trigger failed:', err);
    return false;
  }
}

/**
 * Copies text content to clipboard with fallback for iframes
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (e) {
    console.error('Clipboard copy failed:', e);
    return false;
  }
}
