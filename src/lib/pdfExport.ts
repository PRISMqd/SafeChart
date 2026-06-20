import { jsPDF } from 'jspdf';
import type { ShiftRecord } from '../types';
import { buildTranslatedReport, REQUIRED_DISCLOSURE } from './reportTranslator';

const NAVY = [26, 43, 71] as const;
const TEAL = [59, 138, 140] as const;
const SAGE = [127, 181, 176] as const;
const CREAM = [245, 240, 232] as const;

export function exportToPDF(record: ShiftRecord): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  function addPage() {
    doc.addPage();
    y = margin;
    drawHeader();
  }

  function checkPage(needed: number) {
    if (y + needed > pageHeight - margin - 15) addPage();
  }

  function drawHeader() {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SafeChart', margin, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SAGE);
    doc.text('by PRISMqd — Professional Nurse Documentation', margin, 16);
    doc.setTextColor(180, 180, 180);
    doc.text('safechart.prismqd.com', pageWidth - margin, 10, { align: 'right' });
    y = 28;
  }

  function drawFooter(pageNum: number, totalPages: number) {
    doc.setFillColor(...CREAM);
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(REQUIRED_DISCLOSURE, margin, pageHeight - 9, {
      maxWidth: contentWidth - 20,
    });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  }

  function sectionTitle(text: string) {
    checkPage(12);
    doc.setFillColor(...TEAL);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(text.toUpperCase(), margin + 3, y + 5);
    y += 10;
    doc.setTextColor(50, 50, 50);
  }

  function bodyText(text: string, indent = 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, margin + indent, y);
      y += 5;
    }
  }

  function labelValue(label: string, value: string) {
    checkPage(6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text(label + ': ', margin, y);
    const lw = doc.getTextWidth(label + ': ');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(value, contentWidth - lw);
    doc.text(lines[0], margin + lw, y);
    y += 5;
    for (let i = 1; i < lines.length; i++) {
      checkPage(5);
      doc.text(lines[i], margin + lw, y);
      y += 5;
    }
  }

  // Start building
  drawHeader();

  // Title block
  doc.setFillColor(...CREAM);
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeChart Professional Documentation Record', margin + 4, y + 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date(record.timestamp).toLocaleString()}`, margin + 4, y + 15);
  y += 24;

  // Context
  sectionTitle('Documentation Context');
  if (record.nurseRole) labelValue('Role', record.nurseRole);
  if (record.shiftType) labelValue('Shift Type', record.shiftType);
  if (record.unitType) labelValue('Unit Type', record.unitType);
  if (record.state) labelValue('State', record.state);
  if (record.classification) {
    labelValue('Severity Classification', record.classification.severityTier.toUpperCase());
  }
  y += 4;

  // Nurse's account
  sectionTitle("Nurse's Account — Verbatim");
  if (record.freeText) {
    bodyText(record.freeText);
  } else {
    bodyText('(No free text narrative entered.)');
  }
  y += 4;

  // Classification
  if (record.classification && record.classification.matches.length > 0) {
    sectionTitle('Clinical Signal Classification');
    bodyText('Source: CRF doi:10.5281/zenodo.18237155; CMDS doi:10.5281/zenodo.18985075');
    y += 2;
    for (const match of record.classification.matches) {
      checkPage(20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEAL);
      doc.text(match.category.name, margin, y);
      y += 5;
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      bodyText(`CRF Stages: ${match.category.crfStages.join(', ')}`, 4);
      bodyText(`CMDS Mechanisms: ${match.category.cmdsMechanisms.join(', ')}`, 4);
      bodyText(`Risk Category: ${match.category.riskCategory}`, 4);
      if (match.category.autoHighRisk) {
        doc.setTextColor(180, 0, 0);
        bodyText('AUTOMATIC HIGH-RISK FLAG — Non-removable.', 4);
        doc.setTextColor(50, 50, 50);
      }
      y += 2;
    }
  }

  // Translated record
  sectionTitle('Translated Professional Record');
  const translated = record.editedTranslation || buildTranslatedReport(record);
  // Extract just the translated section
  const lines = translated.split('\n');
  let inSection = false;
  for (const line of lines) {
    if (line.startsWith('TRANSLATED PROFESSIONAL RECORD')) { inSection = true; continue; }
    if (inSection && line.startsWith('ESCALATION TIMELINE')) break;
    if (inSection && line.trim()) bodyText(line);
  }
  y += 4;

  // Escalations
  if (record.escalations && record.escalations.length > 0) {
    sectionTitle('Escalation Timeline');
    for (const esc of record.escalations) {
      checkPage(20);
      labelValue('Time', esc.attemptTime);
      labelValue('Reported To', esc.reportedTo);
      labelValue('Response', esc.response === 'no_response' ? 'No Response Received' : esc.response.charAt(0).toUpperCase() + esc.response.slice(1));
      if (esc.details) bodyText(esc.details, 4);
      if (esc.response === 'denied' || esc.response === 'no_response') {
        doc.setTextColor(180, 0, 0);
        bodyText('CMDS M6 Flag: Escalation Suppression confirmed. Source: doi:10.5281/zenodo.18985075', 4);
        doc.setTextColor(50, 50, 50);
      }
      y += 3;
    }
  }

  // Citations
  sectionTitle('Applicable Authorities');
  const tier = record.classification?.severityTier ?? 'low';
  const tierCitations: Record<string, string[]> = {
    low: ['ANA Code of Ethics, Provisions 3 and 6 (2015)'],
    moderate: ['CRF doi:10.5281/zenodo.18237155', 'ANA Code of Ethics, Provisions 3 and 6 (2015)'],
    high: ['CMDS doi:10.5281/zenodo.18985075', 'CMS Conditions of Participation, 42 CFR § 482', 'OSHA General Duty Clause, 29 U.S.C. § 654(a)(1)', 'OSHA Whistleblower Protection, 29 CFR Part 1977'],
    critical: ['EMTALA, 42 U.S.C. § 1395dd', 'CMS Conditions of Participation, 42 CFR § 482', 'OSHA General Duty Clause, 29 U.S.C. § 654(a)(1)', 'AHRQ Patient Safety Primer: Failure to Rescue (2023)'],
  };
  for (const cite of (tierCitations[tier] ?? tierCitations.low)) {
    bodyText(`• ${cite}`, 4);
  }
  y += 4;

  // Disclosure
  sectionTitle('Required Disclosure');
  bodyText(REQUIRED_DISCLOSURE);

  // Add footers to all pages
  const totalPages = (doc.internal as unknown as { pages: unknown[] }).pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`SafeChart_Record_${dateStr}.pdf`);
}
