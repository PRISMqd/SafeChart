import jsPDF from 'jspdf';

const DISCLOSURE = `SafeChart is a professional documentation support tool. It does not constitute legal advice. Use of this tool does not guarantee protection from employment consequences. Nurses should consult their Nurse Practice Act, union representative if applicable, and personal legal counsel regarding specific situations. All submissions are the nurse's own professional documentation. PRISMqd does not submit anything on your behalf without your explicit, confirmed authorization.`;

export function exportPDF(nurseText: string, translatedText: string, timestamp: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setFillColor(26, 43, 71);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeChart Professional Documentation Record', margin, 30);

  doc.setTextColor(59, 138, 140);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PRISMqd | ' + timestamp, margin, 48);

  const bodyTop = 80;
  const colWidth = (pageWidth - margin * 2 - 20) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + 20;

  doc.setTextColor(26, 43, 71);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Account', leftColX, bodyTop);
  doc.text('Translated Record', rightColX, bodyTop);

  doc.setDrawColor(59, 138, 140);
  doc.line(margin + colWidth + 10, bodyTop - 10, margin + colWidth + 10, pageHeight - 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);

  const leftLines = doc.splitTextToSize(nurseText, colWidth - 10);
  const rightLines = doc.splitTextToSize(translatedText, colWidth - 10);

  let yLeft = bodyTop + 16;
  let yRight = bodyTop + 16;
  const lineHeight = 13;
  const maxY = pageHeight - 100;

  let leftIdx = 0;
  let rightIdx = 0;

  while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
    if (yLeft > maxY || yRight > maxY) {
      doc.addPage();
      doc.setDrawColor(59, 138, 140);
      doc.line(margin + colWidth + 10, 40, margin + colWidth + 10, pageHeight - 80);
      yLeft = 50;
      yRight = 50;
    }

    if (leftIdx < leftLines.length) {
      doc.setTextColor(55, 65, 81);
      doc.text(leftLines[leftIdx], leftColX, yLeft);
      leftIdx++;
      yLeft += lineHeight;
    }

    if (rightIdx < rightLines.length) {
      doc.setTextColor(55, 65, 81);
      doc.text(rightLines[rightIdx], rightColX, yRight);
      rightIdx++;
      yRight += lineHeight;
    }
  }

  const footerY = pageHeight - 60;
  doc.setFillColor(245, 240, 232);
  doc.rect(0, footerY - 10, pageWidth, 70, 'F');
  doc.setTextColor(26, 43, 71);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  const disclosureLines = doc.splitTextToSize(DISCLOSURE, pageWidth - margin * 2);
  doc.text(disclosureLines, margin, footerY + 4);

  doc.save(`SafeChart-Report-${Date.now()}.pdf`);
}
