import { useState, useEffect, useCallback } from 'react';
import { FileText, LayoutDashboard, Users, LogOut, LogIn, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Building2, BarChart3 } from 'lucide-react';
import { AchievementReport } from './types';
import { dbService } from './lib/supabase';
import ManagerDashboard from './components/ManagerDashboard';
import ReportForm from './components/ReportForm';

type View = 'employee' | 'manager';

type Toast = {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
};

let toastId = 0;

export default function App() {
  const [view, setView] = useState<View>('employee');
  const [isManagerAuth, setIsManagerAuth] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [reports, setReports] = useState<AchievementReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbService.getReports();
      setReports(data.filter(Boolean));
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleManagerLogin = () => {
    if (password === 'admin123') {
      setIsManagerAuth(true);
      setShowPasswordInput(false);
      setPassword('');
      setPasswordError(false);
      addToast('success', 'تم تسجيل الدخول بنجاح');
    } else {
      setPasswordError(true);
      addToast('error', 'كلمة المرور غير صحيحة');
    }
  };

  const handleManagerLogout = () => {
    setIsManagerAuth(false);
    setView('employee');
    addToast('info', 'تم تسجيل الخروج');
  };

  const handleSaveReport = async (reportData: Omit<AchievementReport, 'id' | 'createdAt'>) => {
    await dbService.saveReport(reportData);
    await loadReports();
    addToast('success', 'تم حفظ التقرير بنجاح');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#1A1B2F] text-white" dir="rtl">
      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F19]/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-xl border border-white/10">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-white">قسم الإعلام والاتصال</h1>
                <p className="text-[10px] text-slate-400 -mt-0.5">مكتب أوقاف القره بوللي</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-[#0B0F19]/60 p-0.5 rounded-xl border border-white/5">
                <button onClick={() => setView('employee')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${view === 'employee' ? 'bg-blue-600/40 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تقرير</span>
                </button>
                <button onClick={() => setView('manager')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${view === 'manager' ? 'bg-blue-600/40 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">لوحة البيانات</span>
                </button>
              </div>

              {/* Manager Auth */}
              {view === 'manager' && !isManagerAuth && (
                <div className="flex items-center gap-2">
                  {showPasswordInput ? (
                    <div className="flex items-center gap-1 bg-[#0B0F19]/60 border border-white/10 rounded-xl px-2 py-1">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setPasswordError(false); }} onKeyDown={e => e.key === 'Enter' && handleManagerLogin()} placeholder="كلمة المرور" className="w-24 bg-transparent text-xs text-white placeholder-slate-500 border-none outline-none" />
                      <button onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300"><EyeOff className="w-3.5 h-3.5" /></button>
                      <button onClick={handleManagerLogin} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"><LogIn className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setShowPasswordInput(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0F19]/40 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all">
                      <LogIn className="w-3.5 h-3.5" />
                      <span>دخول المدير</span>
                    </button>
                  )}
                </div>
              )}
              {view === 'manager' && isManagerAuth && (
                <button onClick={handleManagerLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-300 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              )}
              {view === 'employee' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-300">موظف</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'employee' ? (
          <ReportForm onSave={handleSaveReport} />
        ) : (
          <ManagerDashboard
            reports={reports}
            loading={loading}
            isAuthenticated={isManagerAuth}
            onRefresh={loadReports}
            addToast={addToast}
          />
        )}
      </main>

      {/* Toasts */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-lg transition-all duration-500 animate-[slideUp_0.3s_ease-out] ${toast.type === 'success' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-200' : toast.type === 'error' ? 'bg-rose-600/20 border-rose-500/30 text-rose-200' : 'bg-blue-600/20 border-blue-500/30 text-blue-200'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Global Loader */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#0B0F19] z-50">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" style={{ width: '30%' }} />
        </div>
      )}
    </div>
  );
}
