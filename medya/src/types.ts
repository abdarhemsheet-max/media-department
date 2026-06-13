export interface AchievementReport {
  id: string;
  employeeName: string;
  date: string;
  taskType: string;
  day: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  location: string;
  details: string;
  notes: string;
  colleagues: string[];
  createdAt: string;
  status?: 'معتمد' | 'تحت المراجعة';
}

export interface Assignment {
  id: string;
  primaryEmployee: string;
  coEmployees: string[];
  taskType: string;
  location: string;
  targetDate: string;
  referenceReportId: string | null;
  status: 'قيد الانتظار' | 'قيد التنفيذ' | 'مكتمل';
  notes: string;
  createdAt: string;
}

export const PRESET_EMPLOYEES = [
  "عبد الرحيم أحمد",
  "علي شيتا",
  "عياد النفاتي",
  "محمد فرج بحير",
  "منذر علي عياد",
  "أحمد صالح الوحيشي",
  "عبد المالك بن مالك"
];

export const PRESET_TASK_TYPES = [
  "تغطية إعلامية مرئية للأنشطة والندوات",
  "توثيق خطبة وصلاة الجمعة بالمساجد",
  "مواكبة وتغطية مسابقات حفظ وتجويد القرآن الكريم",
  "منشورات وبطاقات الوعظ والإرشاد الرقمية",
  "توثيق المشاريع وصيانة المساجد ببلدية القره بوللي",
  "حوار صحفي وتغطية اجتماع مكتب الأوقاف",
  "إدارة صفحات التواصل والردود والتوثيق الفوتوغرافي"
];
