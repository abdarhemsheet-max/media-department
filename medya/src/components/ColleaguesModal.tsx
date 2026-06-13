import React, { useState } from 'react';
import { X, Search, Plus, UserCheck, Users } from 'lucide-react';
import { PRESET_EMPLOYEES } from '../types';

interface ColleaguesModalProps {
  selectedColleagues: string[];
  onChange: (colleagues: string[]) => void;
  onClose: () => void;
}

export default function ColleaguesModal({ selectedColleagues, onChange, onClose }: ColleaguesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customName, setCustomName] = useState('');

  const toggleColleague = (name: string) => {
    if (selectedColleagues.includes(name)) {
      onChange(selectedColleagues.filter((c) => c !== name));
    } else {
      onChange([...selectedColleagues, name]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customName.trim();
    if (trimmed && !selectedColleagues.includes(trimmed)) {
      onChange([...selectedColleagues, trimmed]);
      setCustomName('');
    }
  };

  const filteredPresets = PRESET_EMPLOYEES.filter((name) =>
    name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/85 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col space-y-4 text-right" dir="rtl">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">إضافة وتحديد الزملاء المشاركين</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-400 mb-2">المشاركون المختارون ({selectedColleagues.length}):</span>
          {selectedColleagues.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#0B0F19]/50 rounded-lg border border-white/5">
              {selectedColleagues.map((name) => (
                <span key={name} onClick={() => toggleColleague(name)} className="bg-blue-500/20 hover:bg-rose-500/20 border border-blue-500/30 text-blue-300 hover:text-rose-300 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1" title="اضغط للحذف">
                  <X className="w-3.5 h-3.5" />
                  <span>{name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">لا يوجد مشاركون محددون حالياً لهذا التقرير.</p>
          )}
        </div>

        <form onSubmit={handleAddCustom} className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">إضافة زميل جديد غير موجود في القائمة:</label>
          <div className="flex gap-2">
            <input type="text" placeholder="اكتب اسم الزميل ثلاثياً..." value={customName} onChange={(e) => setCustomName(e.target.value)} className="flex-1 bg-[#0B0F19]/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>
        </form>

        <hr className="border-white/5" />

        <div className="space-y-2 flex-1 flex flex-col min-h-[160px] max-h-[220px]">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-bold text-slate-300">اختر من کادر قسم الإعلام المعتمد:</span>
            <div className="relative">
              <input type="text" placeholder="بحث سريع..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-32 bg-[#0B0F19]/50 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500" />
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 flex-1">
            {filteredPresets.map((name) => {
              const isSelected = selectedColleagues.includes(name);
              return (
                <button key={name} onClick={() => toggleColleague(name)} className={`flex items-center justify-between p-2.5 rounded-xl border text-right transition-all duration-200 ${isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-200' : 'bg-[#0B0F19]/40 border-white/5 hover:border-white/10 text-slate-300 hover:bg-[#0B0F19]/70'}`}>
                  <span className="text-xs font-medium">{name}</span>
                  {isSelected ? <UserCheck className="w-4 h-4 text-blue-400" /> : <div className="w-4 h-4 rounded-full border border-white/20" />}
                </button>
              );
            })}
            {filteredPresets.length === 0 && (
              <div className="col-span-2 text-center py-6 text-xs text-slate-500">لم يتم العثور على نتائج للبحث. يمكنك كتابة الاسم أعلاه وإضافته!</div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/15">حفظ وإغلاق القائمة</button>
        </div>
      </div>
    </div>
  );
}
