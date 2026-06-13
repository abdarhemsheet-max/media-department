import { useRef, useState } from 'react';
import { X, Printer, FileText, FileDown, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { AchievementReport } from '../types';
import { dbService, uploadReportPDF } from '../lib/supabase';
import { generateReportPDF, downloadReportPDF } from '../utils/generateReportPDF';

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
    } catch (err) {
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
      const { url, storage } = await uploadReportPDF(report.id || 'unknown', pdfBlob);
      if (storage === 'none') {
        console.warn('PDF could not be saved to any storage');
      }
      onAuthorizeAndSave();
    } catch (err) {
      setError('فشل إنشاء PDF المعتمد - يرجى المحاولة مرة أخرى');
    } finally {
      setGenerating(null);
    }
  };

  const getSerialNumber = () => {
    if (!report) return 'م-إ/20260613/NEW';
    const dateStr = report.date ? report.date.replace(/-/g, '') : '20260613';
    const cleanId = report.id ? report.id.substring(0, 4).toUpperCase() : 'NEW';
    return `م-إ/${dateStr}/${cleanId}`;
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

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-rose-600/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-200 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="mr-auto text-rose-400 hover:text-rose-200"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Loading overlay */}
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
          <div
            id={REPORT_CAPTURE_ID}
            ref={printAreaRef}
            className="w-full max-w-[210mm] bg-white text-slate-800 p-8 md:p-12 shadow-2xl border-t-8 border-indigo-600 relative rounded-2xl"
            dir="rtl"
            style={{ fontFamily: `'${previewFont}', sans-serif`, color: '#1e293b' }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-slate-200 pb-6 mb-6 gap-4">
              <div className="text-right space-y-1">
                <h3 className="font-extrabold text-base text-slate-900">مكتب أوقاف القره بوللي</h3>
                <h4 className="font-bold text-sm text-slate-500">قسم الإعلام والاتصال</h4>
              </div>
              <div className="text-center self-center py-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] border-b-4 border-indigo-600 pb-1.5 px-4 rounded-md">تقرير إنجاز</h1>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 min-w-[210px] text-right">
                <div className="flex justify-between text-xs"><span className="font-bold text-slate-400">اليوم:</span><span className="font-bold text-slate-800">{report.day || 'الأحد'}</span></div>
                <div className="flex justify-between text-xs"><span className="font-bold text-slate-400">التاريخ:</span><span className="font-bold text-slate-800">{report.date || '2026-06-13'}</span></div>
                <div className="flex justify-between text-xs"><span className="font-bold text-slate-400">الرقم الإشاري:</span><span className="font-mono font-bold text-indigo-700 text-[11px]">{getSerialNumber()}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
                <div className="text-xs font-bold text-sky-600 mb-1">اسم الموظف المكلّف</div>
                <div className="text-base font-bold text-slate-800">{report.employeeName || 'غير مدرج'}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-sky-600 mb-1">تاريخ الإنجاز</div>
                <div className="text-sm font-semibold text-slate-700">{report.date || '2026-06-13'} <span className="text-xs text-slate-400 font-normal">({report.day || 'الأحد'})</span></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-sky-600 mb-1">مكان العمل / التنفيذ</div>
                <div className="text-sm font-semibold text-slate-700">{report.location || 'غير محدد'}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-sky-600 mb-1">نوع العمل / النشاط</div>
                <div className="text-sm font-semibold text-slate-700">{report.taskType || 'مهمة عمل'}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-sky-600 mb-1">حالة الإنجاز المعتمد</div>
                <div className="flex items-center gap-2 mt-1"><span className="text-lg font-extrabold text-emerald-600">100%</span><span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">مكتمل ومؤرشف</span></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
                <div className="text-xs font-bold text-sky-600 mb-1">تفاصيل وعناصر الإنجاز</div>
                <div className="text-sm font-medium text-slate-700 leading-relaxed text-justify whitespace-pre-wrap min-h-[100px] pt-1">{report.details || 'لا توجد تفاصيل تفصيلية مدرجة لهذا التقرير.'}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
                <div className="text-xs font-bold text-sky-600 mb-1">الزملاء المشاركون من كادر قسم الإعلام والاتصال</div>
                {report.colleagues && report.colleagues.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">{report.colleagues.map((colleague, idx) => (<span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full">✓ {colleague}</span>))}</div>
                ) : (<p className="text-xs text-slate-400 italic pt-1">تم إنجاز العمل بشكل فردي دون زملاء داعمين مدونين.</p>)}
              </div>
              {report.notes && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
                  <div className="text-xs font-bold text-slate-500 mb-1">ملاحظات المكتب الإضافية والمطالبات</div>
                  <p className="text-xs text-slate-600 bg-amber-50/50 border border-amber-200 p-3 rounded-lg whitespace-pre-wrap">{report.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 relative">
              <div className="absolute top-0 left-1/3 p-1 select-none pointer-events-none opacity-90">
                <div className="w-28 h-28 rounded-full border-4 border-dashed border-indigo-700/80 p-1 flex items-center justify-center rotate-[-12deg]">
                  <div className="w-full h-full rounded-full border-2 border-indigo-700/80 flex flex-col items-center justify-center text-center text-indigo-700/80 p-1 font-bold">
                    <span className="text-[5px] uppercase tracking-tighter">Awqaf Al-Garabulli</span>
                    <span className="text-[7px] font-extrabold my-0.5">مكتب أوقاف القره بوللي</span>
                    <span className="text-[8px] tracking-wide font-extrabold text-indigo-900/90 bg-white px-1">مُعــتـمَـد</span>
                    <span className="text-[6px] tracking-tight mt-0.5">قسم الإعلام والاتصال</span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-xs text-slate-400 block font-bold">توقيع ومقدم التقرير المكلّف:</span>
                <span className="font-bold text-slate-800 text-sm block">{report.employeeName}</span>
                <span className="text-[11px] text-slate-400 italic block">توقيع رقمي مأذون</span>
              </div>
              <div className="text-left space-y-1">
                <span className="text-xs text-slate-400 block font-bold text-left">اعتماد رئيس القسم والمدير:</span>
                <span className="font-bold text-slate-800 text-sm block text-left">قسم الإعلام والتوثيق</span>
                <span className="text-[11px] text-slate-400 italic block text-left">مؤرشف وموثق رقمياً</span>
              </div>
            </div>

            <div className="mt-10 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 flex justify-between items-center">
              <span>قسم الإعلام والاتصال بمكتب أوقاف القره بوللي</span>
              <span className="font-mono">الصفحة 1 من 1</span>
              <span>تاريخ الطباعة الرقمية: {new Date().toLocaleDateString('ar-LY')}</span>
            </div>
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
