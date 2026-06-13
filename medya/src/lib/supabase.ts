import { createClient } from '@supabase/supabase-js';
import { AchievementReport, Assignment } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const FALLBACK_REPORTS: AchievementReport[] = [
  {
    id: "REP-FB32",
    employeeName: "عبد الرحيم أحمد",
    date: "2026-06-11",
    taskType: "تغطية إعلامية مرئية للأنشطة والندوات",
    day: "الأحد",
    location: "صالة المحاضرات الكبرى - مكتب أوقاف القره بوللي",
    details: "تمت بنجاح التغطية المرئية والفوتوغرافية المتكاملة لفعاليات دورة الأئمة والوعاظ السادسة بحضور مدير المكتب وعدد من الشيوخ الأفاضل. تم إرسال مخرجات الفعالية مدعمة بـ 15 صورة عالية الجودة فوراً لمحرري المنصة العامة لنشرها رقمياً.",
    notes: "حضور مميز وتغطية حظيت بصدى وتفاعل واسع.",
    colleagues: ["علي شيتا", "عياد النفاتي"],
    status: "معتمد",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "REP-FA84",
    employeeName: "منذر علي عياد",
    date: "2026-06-12",
    taskType: "توثيق خطبة وصلاة الجمعة بالمساجد",
    day: "الإثنين",
    location: "الجامع الكبير - القره بوللي المركز",
    details: "متابعة ورصد فوتوغرافي متكامل لليوم الثاني على التوالي لأعمال تهيئة وتجهيز المسجد لاستقبال المصلين. قمنا بتسجيل لقاءات حية ومسجلة مع مجموعة من الأخصائيين واللجنة المشرفة، وتجهيز تقرير نهائي متكامل لتسليمه للمكتب.",
    notes: "المعدات الإضافية والبطاريات الاحتياطية كانت ممتازة لإنجاز المهمة بكفاءة.",
    colleagues: ["أحمد صالح الوحيشي", "عبد المالك بن مالك"],
    status: "تحت المراجعة",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

const FALLBACK_ASSIGNMENTS: Assignment[] = [
  {
    id: "TSK-A71B",
    primaryEmployee: "عبد الرحيم أحمد",
    coEmployees: ["علي شيتا", "عياد النفاتي"],
    taskType: "تغطية إعلامية مرئية للأنشطة والندوات",
    location: "صالة المحاضرات الكبرى - مكتب أوقاف القره بوللي",
    targetDate: "2026-06-15",
    referenceReportId: "REP-FB32",
    status: "قيد التنفيذ",
    notes: "تكليف متبوع تلقائياً بناء على تقرير الإنجاز رقم REP-FB32 والزملاء كداعمين",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SQL_SCHEMA_INSTRUCTIONS = `-- 📝 انسخ هذا الكود لتجهيز قاعدة البيانات في Supabase SQL Editor:

-- 1. جدول تقارير الإنجاز (achievement_reports)
CREATE TABLE IF NOT EXISTS achievement_reports (
  id TEXT PRIMARY KEY,
  employee_name TEXT NOT NULL,
  date TEXT NOT NULL,
  task_type TEXT NOT NULL,
  day TEXT NOT NULL,
  location TEXT NOT NULL,
  details TEXT NOT NULL,
  notes TEXT,
  colleagues TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'تحت المراجعة',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. جدول التكليفات (assignments)
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  primary_employee TEXT NOT NULL,
  co_employees TEXT[] DEFAULT '{}',
  task_type TEXT NOT NULL,
  location TEXT NOT NULL,
  target_date TEXT NOT NULL,
  reference_report_id TEXT REFERENCES achievement_reports(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('قيد الانتظار', 'قيد التنفيذ', 'مكتمل')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- تمكين الصلاحيات العامة (RLS policies):
ALTER TABLE achievement_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON achievement_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON achievement_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON achievement_reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON achievement_reports FOR DELETE USING (true);

CREATE POLICY "Allow public assignments select" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow public assignments insert" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public assignments update" ON assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public assignments delete" ON assignments FOR DELETE USING (true);
`;

export const dbService = {
  getConnectionMode(): 'SUPABASE' | 'LOCAL' {
    return isSupabaseConfigured ? 'SUPABASE' : 'LOCAL';
  },

  async getReports(): Promise<AchievementReport[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('achievement_reports')
          .select('*')
          .order('date', { ascending: false });
        if (error) throw error;
        if (data) {
          return data.filter(Boolean).map((item: any) => ({
            id: item.id || '',
            employeeName: item.employee_name || '',
            date: item.date || '',
            taskType: item.task_type || '',
            day: item.day || 'الأحد',
            location: item.location || '',
            details: item.details || '',
            notes: item.notes || '',
            colleagues: item.colleagues || [],
            status: item.status || 'تحت المراجعة',
            createdAt: item.created_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.error("Supabase reports query issue, using local storage fallback:", err);
      }
    }
    await delay(500);
    try {
      const local = localStorage.getItem('db_achievement_reports');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      }
    } catch (e) {
      console.error("Failed to parse db_achievement_reports from localStorage:", e);
    }
    localStorage.setItem('db_achievement_reports', JSON.stringify(FALLBACK_REPORTS));
    return FALLBACK_REPORTS;
  },

  async saveReport(reportData: Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string }): Promise<AchievementReport> {
    const finalId = reportData.id || 'REP-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const createdAt = new Date().toISOString();
    const reportRecord: AchievementReport = { ...reportData, id: finalId, createdAt };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('achievement_reports').insert([{
          id: reportRecord.id,
          employee_name: reportRecord.employeeName,
          date: reportRecord.date,
          task_type: reportRecord.taskType,
          day: reportRecord.day,
          location: reportRecord.location,
          details: reportRecord.details,
          notes: reportRecord.notes,
          colleagues: reportRecord.colleagues,
          status: reportRecord.status || 'تحت المراجعة',
          created_at: reportRecord.createdAt
        }]);
        if (error) throw error;
        return reportRecord;
      } catch (err) {
        console.error("Supabase insert report error, failing over to local storage:", err);
      }
    }

    await delay(700);
    const list = (await this.getReports()) || [];
    const updated = [reportRecord, ...list.filter(r => r && r.id && r.id !== finalId)];
    localStorage.setItem('db_achievement_reports', JSON.stringify(updated));
    return reportRecord;
  },

  async updateReport(id: string, reportData: Partial<AchievementReport>): Promise<AchievementReport> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updates: any = {};
        if (reportData.employeeName !== undefined) updates.employee_name = reportData.employeeName;
        if (reportData.date !== undefined) updates.date = reportData.date;
        if (reportData.taskType !== undefined) updates.task_type = reportData.taskType;
        if (reportData.day !== undefined) updates.day = reportData.day;
        if (reportData.location !== undefined) updates.location = reportData.location;
        if (reportData.details !== undefined) updates.details = reportData.details;
        if (reportData.notes !== undefined) updates.notes = reportData.notes;
        if (reportData.colleagues !== undefined) updates.colleagues = reportData.colleagues;
        if (reportData.status !== undefined) updates.status = reportData.status;

        const { error } = await supabase.from('achievement_reports').update(updates).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Supabase update report error, using local storage:", err);
      }
    }

    await delay(600);
    const list = (await this.getReports()) || [];
    const target = list.find(r => r && r.id === id) || {
      id,
      employeeName: reportData.employeeName || '',
      date: reportData.date || new Date().toISOString().split('T')[0],
      taskType: reportData.taskType || '',
      day: reportData.day || 'الأحد',
      location: reportData.location || '',
      details: reportData.details || '',
      notes: reportData.notes || '',
      colleagues: reportData.colleagues || [],
      createdAt: new Date().toISOString(),
      status: reportData.status || 'تحت المراجعة'
    };

    const updatedRecord: AchievementReport = { ...target, ...reportData, id };
    const updatedList = list.map(r => r && r.id === id ? updatedRecord : r);
    localStorage.setItem('db_achievement_reports', JSON.stringify(updatedList));
    return updatedRecord;
  },

  async deleteReport(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('achievement_reports').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Supabase delete report error, using local storage fallback:", err);
      }
    }
    await delay(500);
    const list = (await this.getReports()) || [];
    const filtered = list.filter(r => r && r.id && r.id !== id);
    localStorage.setItem('db_achievement_reports', JSON.stringify(filtered));
    return true;
  },

  async getAssignments(): Promise<Assignment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .order('target_date', { ascending: false });
        if (error) throw error;
        if (data) {
          return data.filter(Boolean).map((item: any) => ({
            id: item.id || '',
            primaryEmployee: item.primary_employee || '',
            coEmployees: item.co_employees || [],
            taskType: item.task_type || '',
            location: item.location || '',
            targetDate: item.target_date || '',
            referenceReportId: item.reference_report_id || null,
            status: item.status || 'قيد الانتظار',
            notes: item.notes || '',
            createdAt: item.created_at || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.error("Supabase query assignments error, using fallback storage:", err);
      }
    }

    await delay(450);
    try {
      const local = localStorage.getItem('db_assignments');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      }
    } catch (e) {
      console.error("Failed to parse db_assignments from localStorage:", e);
    }
    localStorage.setItem('db_assignments', JSON.stringify(FALLBACK_ASSIGNMENTS));
    return FALLBACK_ASSIGNMENTS;
  },

  async saveAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt'> & { id?: string }): Promise<Assignment> {
    const finalId = assignmentData.id || 'TSK-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const createdAt = new Date().toISOString();
    const assignmentRecord: Assignment = { ...assignmentData, id: finalId, createdAt };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('assignments').insert([{
          id: assignmentRecord.id,
          primary_employee: assignmentRecord.primaryEmployee,
          co_employees: assignmentRecord.coEmployees,
          task_type: assignmentRecord.taskType,
          location: assignmentRecord.location,
          target_date: assignmentRecord.targetDate,
          reference_report_id: assignmentRecord.referenceReportId,
          status: assignmentRecord.status,
          notes: assignmentRecord.notes,
          created_at: assignmentRecord.createdAt
        }]);
        if (error) throw error;
        return assignmentRecord;
      } catch (err) {
        console.error("Supabase save assignment failed, writing locally:", err);
      }
    }

    await delay(600);
    const list = (await this.getAssignments()) || [];
    const updated = [assignmentRecord, ...list.filter(a => a && a.id && a.id !== finalId)];
    localStorage.setItem('db_assignments', JSON.stringify(updated));
    return assignmentRecord;
  },

  async updateAssignment(id: string, assignmentData: Partial<Assignment>): Promise<Assignment> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updates: any = {};
        if (assignmentData.primaryEmployee !== undefined) updates.primary_employee = assignmentData.primaryEmployee;
        if (assignmentData.coEmployees !== undefined) updates.co_employees = assignmentData.coEmployees;
        if (assignmentData.taskType !== undefined) updates.task_type = assignmentData.taskType;
        if (assignmentData.location !== undefined) updates.location = assignmentData.location;
        if (assignmentData.targetDate !== undefined) updates.target_date = assignmentData.targetDate;
        if (assignmentData.referenceReportId !== undefined) updates.reference_report_id = assignmentData.referenceReportId;
        if (assignmentData.status !== undefined) updates.status = assignmentData.status;
        if (assignmentData.notes !== undefined) updates.notes = assignmentData.notes;

        const { error } = await supabase.from('assignments').update(updates).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Supabase update assignment error, using local storage:", err);
      }
    }

    await delay(500);
    const list = (await this.getAssignments()) || [];
    const target = list.find(a => a && a.id === id) || {
      id,
      primaryEmployee: assignmentData.primaryEmployee || '',
      coEmployees: assignmentData.coEmployees || [],
      taskType: assignmentData.taskType || '',
      location: assignmentData.location || '',
      targetDate: assignmentData.targetDate || new Date().toISOString().split('T')[0],
      referenceReportId: assignmentData.referenceReportId || null,
      status: assignmentData.status || 'قيد الانتظار',
      notes: assignmentData.notes || '',
      createdAt: new Date().toISOString()
    };

    const updatedRecord: Assignment = { ...target, ...assignmentData, id };
    const updatedList = list.map(a => a && a.id === id ? updatedRecord : a);
    localStorage.setItem('db_assignments', JSON.stringify(updatedList));
    return updatedRecord;
  },

  async deleteAssignment(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('assignments').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Supabase delete assignment error, local delete fallback:", err);
      }
    }
    await delay(400);
    const list = (await this.getAssignments()) || [];
    const filtered = list.filter(a => a && a.id && a.id !== id);
    localStorage.setItem('db_assignments', JSON.stringify(filtered));
    return true;
  }
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function uploadReportPDF(
  reportId: string,
  pdfBlob: Blob
): Promise<{ url: string | null; storage: 'supabase' | 'local' | 'none' }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileName = `report_${reportId}_${Date.now()}.pdf`;
      const { error } = await supabase.storage
        .from('report-pdfs')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
          cacheControl: '3600',
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('report-pdfs')
        .getPublicUrl(fileName);
      return { url: urlData?.publicUrl || null, storage: 'supabase' };
    } catch (err) {
      console.error('Supabase PDF upload failed, saving locally:', err);
    }
  }
  try {
    const base64 = await blobToBase64(pdfBlob);
    localStorage.setItem(`pdf_${reportId}`, base64);
    return { url: `local_${reportId}`, storage: 'local' };
  } catch (err) {
    console.error('Local PDF save failed:', err);
    return { url: null, storage: 'none' };
  }
}
