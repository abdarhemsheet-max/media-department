import { AchievementReport } from '../types';

interface ReportCardProps {
  report: Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string };
  fontFamily?: string;
}

function getSerialNumber(report: Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string }) {
  if (!report) return 'م-إ/20260613/NEW';
  const dateStr = report.date ? report.date.replace(/-/g, '') : '20260613';
  const cleanId = report.id ? report.id.substring(0, 4).toUpperCase() : 'NEW';
  return `م-إ/${dateStr}/${cleanId}`;
}

export default function ReportCard({ report, fontFamily = 'Cairo' }: ReportCardProps) {
  if (!report) return null;

  return (
    <div
      className="w-full max-w-[210mm] bg-white text-slate-800 p-8 md:p-12 shadow-2xl border-t-8 border-indigo-600 relative rounded-2xl"
      dir="rtl"
      style={{ fontFamily: `'${fontFamily}', sans-serif`, color: '#1e293b' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-slate-200 pb-6 mb-6 gap-4">
        <div className="text-right space-y-1">
          <h3 className="font-extrabold text-base text-slate-900">مكتب أوقاف القره بوللي</h3>
          <h4 className="font-bold text-sm text-slate-500">قسم الإعلام والاتصال</h4>
        </div>
        <div className="text-center self-center py-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] border-b-4 border-indigo-600 pb-1.5 px-4 rounded-md">تقرير إنجاز</h1>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5 min-w-[210px] text-right">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-400">اليوم:</span>
            <span className="font-bold text-slate-800">{report.day || 'الأحد'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-400">التاريخ:</span>
            <span className="font-bold text-slate-800">{report.date || '2026-06-13'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-400">الرقم الإشاري:</span>
            <span className="font-mono font-bold text-indigo-700 text-[11px]">{getSerialNumber(report)}</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
          <div className="text-xs font-bold text-sky-600 mb-1">اسم الموظف المكلّف</div>
          <div className="text-base font-bold text-slate-800">{report.employeeName || 'غير مدرج'}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-bold text-sky-600 mb-1">تاريخ الإنجاز</div>
          <div className="text-sm font-semibold text-slate-700">
            {report.date || '2026-06-13'}
            <span className="text-xs text-slate-400 font-normal"> ({report.day || 'الأحد'})</span>
          </div>
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
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-extrabold text-emerald-600">100%</span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {report.status === 'معتمد' ? 'معتمد ومؤرشف' : 'تحت المراجعة'}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
          <div className="text-xs font-bold text-sky-600 mb-1">تفاصيل وعناصر الإنجاز</div>
          <div className="text-sm font-medium text-slate-700 leading-relaxed text-justify whitespace-pre-wrap min-h-[100px] pt-1">
            {report.details || 'لا توجد تفاصيل مدرجة.'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
          <div className="text-xs font-bold text-sky-600 mb-1">الزملاء المشاركون</div>
          {report.colleagues && report.colleagues.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {report.colleagues.map((colleague, idx) => (
                <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black px-3 py-1 rounded-full">
                  ✓ {colleague}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic pt-1">تم إنجاز العمل بشكل فردي.</p>
          )}
        </div>
        {report.notes && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:col-span-2">
            <div className="text-xs font-bold text-slate-500 mb-1">ملاحظات</div>
            <p className="text-xs text-slate-600 bg-amber-50/50 border border-amber-200 p-3 rounded-lg whitespace-pre-wrap">
              {report.notes}
            </p>
          </div>
        )}
      </div>

      {/* Signature + Stamp */}
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

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 flex justify-between items-center">
        <span>قسم الإعلام والاتصال بمكتب أوقاف القره بوللي</span>
        <span className="font-mono">الصفحة 1 من 1</span>
        <span>تاريخ الطباعة الرقمية: {new Date().toLocaleDateString('ar-LY')}</span>
      </div>
    </div>
  );
}
