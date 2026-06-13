import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface GeneratePDFOptions {
  scale?: number;
  quality?: number;
  backgroundColor?: string;
  filename?: string;
  onProgress?: (currentPage: number, totalPages: number) => void;
}

export async function generateReportPDF(
  elementId: string,
  options?: GeneratePDFOptions
): Promise<Blob> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);

  const scale = options?.scale ?? 2;
  const quality = options?.quality ?? 0.95;
  const bgColor = options?.backgroundColor ?? '#ffffff';

  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 150));

  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: bgColor,
    width: el.scrollWidth,
    height: el.scrollHeight,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    onclone: (doc) => {
      const cloned = doc.getElementById(elementId);
      if (cloned) {
        cloned.style.setProperty('transform', 'none');
      }
    },
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/jpeg', quality);
  const totalPages = Math.ceil(imgHeight / pageHeight);

  let posY = 0;
  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, posY, imgWidth, imgHeight);
    posY -= pageHeight;
    options?.onProgress?.(i + 1, totalPages);
  }

  return pdf.output('blob');
}

export async function downloadReportPDF(
  elementId: string,
  filename?: string,
  options?: GeneratePDFOptions
): Promise<void> {
  const blob = await generateReportPDF(elementId, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'report.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
