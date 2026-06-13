import { useState } from 'react';
import { FileText, Eye, Trash2, RefreshCw, ShieldCheck, Search, CalendarDays, MapPin, Users, BarChart3, FileSpreadsheet, ListFilter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AchievementReport } from '../types';
import { dbService } from '../lib/supabase';
import PDFPreviewModal from './PDFPreviewModal';

interface ManagerDashboardProps {
  reports: AchievementReport[];
  loading: boolean;
  isAuthenticated: boolean;
  onRefresh: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

type FilterStatus = 'all' | 'معتمد' | 'تحت المراجعة';

const DAYS_MAP: Record<string, string> = {
  'Sunday': 'الأحد', 'Monday': 'الإثنين', 'Tuesday': 'الثلاثاء',
  'Wednesday': 'الأربعاء', 'Thursday': 'الخميس'
};

export default function ManagerDashboard({ reports, loading, isAuthenticated, onRefresh, addToast }: ManagerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');
  const [previewReport, setPreviewReport] = useState<(Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    if (!r) return false;
    const matchesSearch = !searchQuery || r.employeeName?.includes(searchQuery) || r.taskType?.includes(searchQuery) || r.location?.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) return;
    setDeleting(id);
    await dbService.deleteReport(id);
    setDeleting(null);
    onRefresh();
    addToast('info', 'تم حذف التقرير');
  };

  const handleAuthorize = async (report: AchievementReport) => {
    const updated = await dbService.updateReport(report.id, { status: 'معتمد' });
    if (updated) {
      onRefresh();
      setPreviewReport(null);
      addToast('success', 'تم اعتماد وأرشفة التقرير');
    }
  };

  const stats = {
    total: reports.filter(Boolean).length,
    approved: reports.filter(r => r && r.status === 'معتمد').length,
    pending: reports.filter(r => r && r.status === 'تحت المراجعة').length,
    employees: [...new Set(reports.filter(Boolean).map(r => r.employeeName))].length
  };

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <div className="backdrop-blur-xl bg-amber-600/10 border border-amber-500/20 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">مشاهدة محدودة</h3>
              <p className="text-xs text-amber-300/70">يرجى تسجيل الدخول بكلمة مرور المدير للتمكن من اعتماد وحذف التقارير.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-1.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex gap-1">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex-1 justify-center ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
          <BarChart3 className="w-4 h-4" />
          <span>نظرة عامة</span>
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex-1 justify-center ${activeTab === 'reports' ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
          <FileSpreadsheet className="w-4 h-4" />
          <span>التقارير ({filteredReports.length})</span>
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'إجمالي التقارير', value: stats.total, icon: FileText, color: 'from-blue-600/20 to-blue-700/10', iconColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
              { label: 'معتمد ومؤرشف', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-600/20 to-emerald-700/10', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
              { label: 'تحت المراجعة', value: stats.pending, icon: Clock, color: 'from-amber-600/20 to-amber-700/10', iconColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
              { label: 'الموظفين', value: stats.employees, icon: Users, color: 'from-indigo-600/20 to-indigo-700/10', iconColor: 'text-indigo-400', borderColor: 'border-indigo-500/20' }
            ].map((stat, idx) => (
              <div key={idx} className={`backdrop-blur-xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${stat.iconColor}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Reports Preview */}
          <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                آخر التقارير المضافة
              </h3>
              <button onClick={() => setActiveTab('reports')} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">عرض الكل ←</button>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />))}</div>
            ) : reports.filter(Boolean).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">لا توجد تقارير بعد</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.filter(Boolean).slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${report.status === 'معتمد' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{report.employeeName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{report.taskType}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${report.status === 'معتمد' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/15 text-amber-300 border border-amber-500/20'}`}>{report.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث في التقارير..." className="bg-[#0B0F19]/60 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-48 transition-colors" />
                </div>
                <div className="flex bg-[#0B0F19]/60 p-0.5 rounded-lg border border-white/5">
                  {(['all', 'تحت المراجعة', 'معتمد'] as FilterStatus[]).map(status => (
                    <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filterStatus === status ? 'bg-blue-600/30 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                      {status === 'all' ? 'الكل' : status}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 bg-[#0B0F19]/40 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          {/* Reports Table */}
          <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />))}</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">لا توجد تقارير مطابقة</p>
                <p className="text-xs mt-1">حاول تغيير معايير البحث أو إضافة تقارير جديدة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0B0F19]/80">
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap">#</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap">الموظف</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap">التاريخ</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap hidden md:table-cell">نوع العمل</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap hidden lg:table-cell">الموقع</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap">الحالة</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 whitespace-nowrap">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report, idx) => (
                      <tr key={report?.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-[11px] font-bold text-blue-300 shrink-0">
                              {report?.employeeName?.charAt(0) || '?'}
                            </div>
                            <span className="text-xs font-bold text-white">{report?.employeeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-emerald-400" style={{ textShadow: '0 0 8px rgba(52,211,153,0.3)' }}>
                            {report?.date || '—'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{report?.day || ''}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-slate-300 line-clamp-1 max-w-[200px] block">{report?.taskType}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-slate-400 line-clamp-1 max-w-[150px] block">{report?.location}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${report?.status === 'معتمد' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/15 text-amber-300 border border-amber-500/20'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${report?.status === 'معتمد' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {report?.status || 'تحت المراجعة'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setPreviewReport(report ? { ...report } : null)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-all" title="معاينة">
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAuthenticated && report?.status !== 'معتمد' && (
                              <button onClick={() => handleAuthorize(report)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-600/10 rounded-lg transition-all" title="اعتماد">
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            )}
                            {isAuthenticated && (
                              <button onClick={() => handleDelete(report?.id)} disabled={deleting === report?.id} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-600/10 rounded-lg transition-all" title="حذف">
                                <Trash2 className={`w-4 h-4 ${deleting === report?.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewReport && (
        <PDFPreviewModal
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          onAuthorizeAndSave={previewReport.id ? () => handleAuthorize(previewReport as AchievementReport) : undefined}
          isViewOnly={!isAuthenticated}
        />
      )}
    </div>
  );
}
