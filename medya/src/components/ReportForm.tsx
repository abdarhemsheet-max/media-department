import { useState, FormEvent } from 'react';
import { Send, Plus, Users, CalendarDays, MapPin, FileText, AlignRight, StickyNote, UserCircle, ListChecks, Eye, CheckCircle2, PlusCircle } from 'lucide-react';
import { AchievementReport, PRESET_EMPLOYEES, PRESET_TASK_TYPES } from '../types';
import ColleaguesModal from './ColleaguesModal';
import ReportCard from './ReportCard';

interface ReportFormProps {
  onSave: (report: Omit<AchievementReport, 'id' | 'createdAt'>) => void;
}

const DAYS_MAP: Record<string, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
  'Sunday': 'الأحد', 'Monday': 'الإثنين', 'Tuesday': 'الثلاثاء',
  'Wednesday': 'الأربعاء', 'Thursday': 'الخميس'
};

const getDayFromDate = (dateStr: string): 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' => {
  if (!dateStr) return 'الأحد';
  const d = new Date(dateStr + 'T12:00:00');
  const enDay = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  return DAYS_MAP[enDay] || 'الأحد';
};

const todayStr = () => new Date().toLocaleDateString('en-CA');

export default function ReportForm({ onSave }: ReportFormProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [date, setDate] = useState(todayStr());
  const [taskType, setTaskType] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [colleagues, setColleagues] = useState<string[]>([]);
  const [showColleaguesModal, setShowColleaguesModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Omit<AchievementReport, 'id' | 'createdAt'> | null>(null);

  const day = getDayFromDate(date);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeName || !taskType || !location || !details) return;

    setSubmitting(true);
    const reportData: Omit<AchievementReport, 'id' | 'createdAt'> = {
      employeeName, date, taskType, day, location, details, notes, colleagues, status: 'تحت المراجعة'
    };
    try {
      await onSave(reportData);
      setSubmittedReport(reportData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReport = () => {
    setSubmittedReport(null);
    setEmployeeName('');
    setDate(todayStr());
    setTaskType('');
    setLocation('');
    setDetails('');
    setNotes('');
    setColleagues([]);
  };

  const isFormValid = employeeName && taskType && location && details;

  if (submittedReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="backdrop-blur-xl bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-emerald-200">تم تقديم التقرير بنجاح</h2>
              <p className="text-xs text-emerald-300/70">التقرير قيد المراجعة من قبل مدير القسم</p>
            </div>
            <button onClick={handleNewReport} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 border border-blue-500/30">
              <PlusCircle className="w-4 h-4" />
              <span>تقرير جديد</span>
            </button>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">معاينة التقرير المُرسَل</span>
          </div>
          <div className="flex justify-center">
            <ReportCard report={submittedReport} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-5 sm:p-7">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="p-2.5 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-xl border border-white/10">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">تقديم تقرير إنجاز إعلامي</h2>
            <p className="text-[11px] text-slate-400">قسم الإعلام والاتصال بمكتب أوقاف القره بوللي</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                <UserCircle className="w-3.5 h-3.5 text-blue-400" />
                اسم الموظف المكلّف
              </label>
              <select value={employeeName} onChange={e => setEmployeeName(e.target.value)} className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none">
                <option value="" className="bg-[#0B0F19]">— اختر الاسم —</option>
                {PRESET_EMPLOYEES.map(name => (
                  <option key={name} value={name} className="bg-[#0B0F19]">{name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                تاريخ الإنجاز
              </label>
              <div className="relative">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold bg-[#0B0F19]/80 px-1.5 py-0.5 rounded">{day}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
                نوع العمل / النشاط
              </label>
              <select value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none">
                <option value="" className="bg-[#0B0F19]">— اختر نوع النشاط —</option>
                {PRESET_TASK_TYPES.map(t => (
                  <option key={t} value={t} className="bg-[#0B0F19]">{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                مكان العمل / التنفيذ
              </label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="صالة المحاضرات - مكتب الأوقاف" className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <AlignRight className="w-3.5 h-3.5 text-sky-400" />
              تفاصيل وعناصر الإنجاز
            </label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={5} placeholder="صف تفاصيل الإنجاز الذي قمت به اليوم بدقة..." className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              الزملاء المشاركون
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => setShowColleaguesModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#0B0F19]/40 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all">
                <Plus className="w-3.5 h-3.5" />
                <span>اختيار الزملاء</span>
              </button>
              {colleagues.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {colleagues.map(name => (
                    <span key={name} className="flex items-center gap-1 bg-blue-600/15 text-blue-300 border border-blue-500/20 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              ملاحظات إضافية (اختياري)
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="أي ملاحظات إضافية تود إرفاقها..." className="w-full bg-[#0B0F19]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
          </div>

          <button type="submit" disabled={!isFormValid || submitting} className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isFormValid && !submitting ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 border border-blue-500/30' : 'bg-[#0B0F19]/60 text-slate-500 border border-white/5 cursor-not-allowed'}`}>
            {submitting ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>جاري حفظ التقرير...</span></>
            ) : (
              <><Send className="w-4 h-4" /><span>تقديم التقرير ورفعه للاعتماد</span></>
            )}
          </button>
        </form>
      </div>

      {showColleaguesModal && (
        <ColleaguesModal
          selectedColleagues={colleagues}
          onChange={setColleagues}
          onClose={() => setShowColleaguesModal(false)}
        />
      )}
    </div>
  );
}
