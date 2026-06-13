import { useRef, useState } from 'react';
import { X, Printer, FileText, FileDown, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { AchievementReport } from '../types';
import { uploadReportPDF } from '../lib/supabase';
import { generateReportPDF, downloadReportPDF } from '../utils/generateReportPDF';
import ReportCard from './ReportCard';

interface PDFPreviewModalProps {
  report: Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string };
  onClose: () => void;
  onAuthorizeAndSave?: () => void;
  isViewOnly?: boolean;
}

const REPORT_CAPTURE_ID = 'report-preview-content';

export default function PDFPreviewModal({ report, onClose, onAuthorizeAndSave, isViewOnly = false }: PDFPreviewModalProps) {
  const [previewFont, setPreviewFont] = useState<'Cairo' | 'Amiri'>('Cairo');
  const [generating, setGenerating] = useState<'download' | 'authorize' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!report) return null;

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>تقرير إنجاز إعلامي - ${report?.employeeName || 'غير مدرج'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>body{font-family:'Cairo',sans-serif;direction:rtl;padding:40px;background:white;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{body{padding:0}.no-print{display:none!important}}</style>
        </head><body onload="setTimeout(function(){window.print();window.close();},500);"><div class="p-4">${printContent}</div></body></html>`);
      printWindow.document.close();
    }
  };

  const handleDownloadWYSIWYG = async () => {
    setGenerating('download');
    setError(null);
    try {
      await downloadReportPDF(REPORT_CAPTURE_ID, `تقرير_إعلامي_${report.id || 'جديد'}.pdf`, {
        scale: 2,
        quality: 0.95,
      });
    } catch {
      setError('فشل تصدير PDF - يرجى المحاولة مرة أخرى');
    } finally {
      setGenerating(null);
    }
  };

  const handleAuthorizeWithPDF = async () => {
    if (!onAuthorizeAndSave) return;
    setGenerating('authorize');
    setError(null);
    try {
      const pdfBlob = await generateReportPDF(REPORT_CAPTURE_ID, {
        scale: 2,
        quality: 0.95,
      });
      const { storage } = await uploadReportPDF(report.id || 'unknown', pdfBlob);
      if (storage === 'none') {
        console.warn('PDF could not be saved to any storage');
      }
      onAuthorizeAndSave();
    } catch {
      setError('فشل إنشاء PDF المعتمد - يرجى المحاولة مرة أخرى');
    } finally {
      setGenerating(null);
    }
  };

  const isBusy = generating !== null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0B0F19]/90 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#0B0F19]/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FileText className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-white">معاينة المستند الرسمي للتقرير</h2>
          </div>
          <button onClick={onClose} disabled={isBusy} className="p-1 px-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"><X className="w-6 h-6" /></button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-rose-600/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-200 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="mr-auto text-rose-400 hover:text-rose-200"><X className="w-4 h-4" /></button>
          </div>
        )}

        {isBusy && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0F19]/70 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-sm font-bold text-white">
                {generating === 'download' ? 'جاري تصدير PDF بنسخة مطابقة...' : 'جاري إنشاء PDF المعتمد والأرشفة...'}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 bg-[#0B0F19]/40 flex justify-center">
          <div id={REPORT_CAPTURE_ID} ref={printAreaRef}>
            <ReportCard report={report} fontFamily={previewFont} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#0B0F19]/50 backdrop-blur-xl flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-[#0B0F19]/50 p-1.5 rounded-xl border border-white/5">
            <span className="text-[11px] font-bold text-slate-300 px-1">نوع الخط:</span>
            <div className="flex bg-[#0B0F19]/60 p-0.5 rounded-lg border border-white/5 gap-0.5">
              <button type="button" onClick={() => setPreviewFont('Cairo')} disabled={isBusy} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-200 cursor-pointer disabled:opacity-40 ${previewFont === 'Cairo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Cairo</button>
              <button type="button" onClick={() => setPreviewFont('Amiri')} disabled={isBusy} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-200 cursor-pointer disabled:opacity-40 ${previewFont === 'Amiri' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>Amiri</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-end w-full lg:w-auto">
            <button onClick={onClose} disabled={isBusy} className="px-5 py-2.5 bg-[#0B0F19]/50 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-slate-300 transition-all duration-300 cursor-pointer disabled:opacity-40">إلغاء المعاينة</button>
            <button onClick={handlePrint} disabled={isBusy} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition-all duration-300 cursor-pointer disabled:opacity-40"><Printer className="w-4 h-4 text-slate-300" /><span>طباعة ورقية سريعة</span></button>
            <button onClick={handleDownloadWYSIWYG} disabled={isBusy} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-indigo-600/25 cursor-pointer border border-indigo-500/30 disabled:opacity-50">
              {generating === 'download' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              <span>{generating === 'download' ? 'جاري التصدير...' : 'تحميل PDF مطابق'}</span>
            </button>
            {!isViewOnly && onAuthorizeAndSave && (
              <button onClick={handleAuthorizeWithPDF} disabled={isBusy} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-emerald-600/15 cursor-pointer disabled:opacity-50">
                {generating === 'authorize' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{generating === 'authorize' ? 'جاري الاعتماد والأرشفة...' : 'اعتماد وأرشفة التقرير'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
