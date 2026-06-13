import { useState } from 'react';
import { FileText, Eye, Trash2, RefreshCw, ShieldCheck, Search, Users, BarChart3, Archive, CheckCircle2, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
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

type TabKey = 'dashboard' | 'reports' | 'archive';
type FilterStatus = 'all' | 'معتمد' | 'تحت المراجعة';

export default function ManagerDashboard({ reports, loading, isAuthenticated, onRefresh, addToast }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [previewReport, setPreviewReport] = useState<(Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string }) | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const validReports = reports.filter(Boolean);

  const filteredReports = validReports.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || r.employeeName?.toLowerCase().includes(q) || r.taskType?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q);
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
    total: validReports.length,
    approved: validReports.filter(r => r.status === 'معتمد').length,
    pending: validReports.filter(r => r.status === 'تحت المراجعة').length,
    employees: [...new Set(validReports.map(r => r.employeeName))].length
  };

  const tabs: { key: TabKey; label: string; icon: typeof BarChart3; count?: number }[] = [
    { key: 'dashboard', label: 'الرئيسية', icon: BarChart3 },
    { key: 'reports', label: 'التقارير', icon: FileText, count: filteredReports.length },
    { key: 'archive', label: 'الأرشيف', icon: Archive, count: validReports.length },
  ];

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
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex-1 justify-center ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===================== DASHBOARD TAB ===================== */}
      {activeTab === 'dashboard' && (
        <>
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

          <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                آخر التقارير المضافة
              </h3>
              <button onClick={() => setActiveTab('archive')} className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                <span>الأرشيف</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />))}</div>
            ) : validReports.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">لا توجد تقارير بعد</p>
              </div>
            ) : (
              <div className="space-y-2">
                {validReports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-all border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${report.status === 'معتمد' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{report.employeeName}</p>
                        <p className="text-[11px] text-slate-400">{report.taskType}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${report.status === 'معتمد' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/15 text-amber-300 border border-amber-500/20'}`}>{report.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================== REPORTS TAB ===================== */}
      {activeTab === 'reports' && (
        <>
          <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث..." className="bg-[#0B0F19]/60 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-40 sm:w-48 transition-colors" />
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

          {/* Desktop Table */}
          <div className="hidden md:block backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />))}</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">لا توجد تقارير</p>
                <p className="text-xs mt-1">حاول تغيير معايير البحث</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0B0F19]/80">
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 w-10">#</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400">الموظف</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 w-28">التاريخ</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400">نوع العمل</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 hidden lg:table-cell">الموقع</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 w-24">الحالة</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-slate-400 w-24">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report, idx) => (
                      <tr key={report.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono align-top pt-4">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                              {report.employeeName?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm font-bold text-white">{report.employeeName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          <span className="text-sm font-bold text-emerald-400" style={{ textShadow: '0 0 8px rgba(52,211,153,0.3)' }}>
                            {report.date || '—'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{report.day || ''}</span>
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          <span className="text-sm text-slate-300">{report.taskType}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell align-top pt-4">
                          <span className="text-sm text-slate-400">{report.location}</span>
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${report.status === 'معتمد' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/15 text-amber-300 border border-amber-500/20'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${report.status === 'معتمد' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top pt-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setPreviewReport({ ...report })} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-600/10 rounded-lg transition-all" title="معاينة">
                              <Eye className="w-4 h-4" />
                            </button>
                            {isAuthenticated && (
                              <button onClick={() => handleDelete(report.id)} disabled={deleting === report.id} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-600/10 rounded-lg transition-all" title="حذف">
                                <Trash2 className={`w-4 h-4 ${deleting === report.id ? 'animate-spin' : ''}`} />
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />))}</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">لا توجد تقارير</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <div key={report.id} className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-sm font-bold text-blue-300 shrink-0">
                        {report.employeeName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{report.employeeName}</p>
                        <span className="text-[10px] text-emerald-400 font-bold">{report.date} <span className="text-slate-500">({report.day})</span></span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${report.status === 'معتمد' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/15 text-amber-300 border border-amber-500/20'}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{report.taskType}</p>
                  <p className="text-xs text-slate-500 mb-3 truncate">{report.location}</p>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button onClick={() => setPreviewReport({ ...report })} className="flex-1 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-300 text-xs font-bold rounded-xl transition-all">معاينة</button>
                    {isAuthenticated && (
                      <button onClick={() => handleDelete(report.id)} disabled={deleting === report.id} className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-300 text-xs font-bold rounded-xl transition-all">حذف</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ===================== ARCHIVE TAB ===================== */}
      {activeTab === 'archive' && (
        <>
          <div className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="بحث في الأرشيف..." className="bg-[#0B0F19]/60 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 w-40 sm:w-48 transition-colors" />
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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Archive className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-base font-bold">الأرشيف فارغ</p>
              <p className="text-sm mt-1">سيتم عرض التقارير هنا فور تقديمها من الموظفين</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map(report => (
                <div key={report.id} className="backdrop-blur-xl bg-[#0B0F19]/50 border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${report.status === 'معتمد' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/20 text-amber-300 border border-amber-500/20'}`}>
                      {report.employeeName?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">{report.employeeName}</p>
                      <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                        {report.date}
                        <span className="text-slate-500 font-normal"> — {report.day}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${report.status === 'معتمد' ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/20' : 'bg-amber-600/15 text-amber-300 border border-amber-500/20'}`}>
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2 line-clamp-2">{report.taskType}</p>
                  <p className="text-[11px] text-slate-500 mb-3">{report.location}</p>

                  {report.colleagues && report.colleagues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.colleagues.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded-full">{c}</span>
                      ))}
                      {report.colleagues.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{report.colleagues.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-white/5 flex gap-2">
                    <button onClick={() => setPreviewReport({ ...report })} className="flex-[2] px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض واعتماد</span>
                    </button>
                    {isAuthenticated && (
                      <button onClick={() => handleDelete(report.id)} disabled={deleting === report.id} className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-300 text-xs font-bold rounded-xl transition-all">
                        <Trash2 className={`w-3.5 h-3.5 ${deleting === report.id ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
