import { AchievementReport } from '../types';

interface ReportCardProps {
  report: Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string };
  fontFamily?: string;
}

function getSerialNumber(report: Omit<AchievementReport, 'id' | 'createdAt'> & { id?: string }) {
  if (!report) return 'REP-20260613-NEW';
  const dateStr = report.date ? report.date.replace(/-/g, '') : '20260613';
  const cleanId = report.id ? report.id.substring(0, 4).toUpperCase() : 'NEW';
  return `REP-${dateStr}-${cleanId}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${y}/${parseInt(m)}/${parseInt(d)}`;
}

export default function ReportCard({ report, fontFamily = 'Cairo' }: ReportCardProps) {
  if (!report) return null;

  const colleaguesText =
    report.colleagues && report.colleagues.length > 0
      ? ` (بمشاركة: ${report.colleagues.join('، ')})`
      : '';

  return (
    <div
      className="w-full max-w-[210mm] bg-white"
      dir="rtl"
      style={{ fontFamily: `'${fontFamily}', sans-serif`, color: '#1a1a1a' }}
    >
      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="text-right font-bold text-base leading-relaxed">
            <div>مكتب أوقاف القره بوللي</div>
            <div>قسم الإعلام</div>
          </div>
          <div className="text-center flex-1">
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ letterSpacing: '-0.5px' }}
            >
              تقرير إنجاز
            </h1>
          </div>
          <div className="text-left shrink-0">
            <table
              className="border-collapse text-xs w-[150px]"
              style={{ borderCollapse: 'collapse' }}
            >
              <tbody>
                <tr>
                  <th
                    className="font-bold px-2 py-1 text-center w-[50px]"
                    style={{
                      border: '1px solid #333',
                      backgroundColor: '#fdfdfd',
                    }}
                  >
                    اليوم
                  </th>
                  <td
                    className="font-semibold px-2 py-1 text-center"
                    style={{ border: '1px solid #333' }}
                  >
                    {report.day || '—'}
                  </td>
                </tr>
                <tr>
                  <th
                    className="font-bold px-2 py-1 text-center"
                    style={{
                      border: '1px solid #333',
                      backgroundColor: '#fdfdfd',
                    }}
                  >
                    التاريخ
                  </th>
                  <td
                    className="font-semibold px-2 py-1 text-center"
                    style={{ border: '1px solid #333' }}
                  >
                    {report.date ? formatDate(report.date) : '—'}
                  </td>
                </tr>
                <tr>
                  <th
                    className="font-bold px-2 py-1 text-center"
                    style={{
                      border: '1px solid #333',
                      backgroundColor: '#fdfdfd',
                    }}
                  >
                    الرقم
                  </th>
                  <td
                    className="font-semibold px-2 py-1 text-center font-mono"
                    style={{
                      border: '1px solid #333',
                      fontSize: '11px',
                    }}
                  >
                    {getSerialNumber(report)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr
          className="border-none my-5"
          style={{ borderTop: '2px solid #333', margin: '20px 0 30px' }}
        />

        {/* Main Table */}
        <table
          className="w-full mb-10"
          style={{ borderCollapse: 'collapse', fontSize: '15px' }}
        >
          <tbody>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  width: '25%',
                  fontSize: '16px',
                }}
              >
                اسم الموظف
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle"
                style={{ border: '1px solid #333', width: '75%' }}
              >
                {report.employeeName || 'غير مدرج'}
                {colleaguesText}
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                تاريخ الإنجاز
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle"
                style={{ border: '1px solid #333' }}
              >
                {report.date || '—'}
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                اليوم
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle"
                style={{ border: '1px solid #333' }}
              >
                {report.day || '—'}
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                مكان العمل
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle"
                style={{ border: '1px solid #333' }}
              >
                {report.location || '—'}
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                نوع العمل
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle"
                style={{ border: '1px solid #333' }}
              >
                {report.taskType || '—'}
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                نسبة الإنجاز
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle font-extrabold"
                style={{
                  border: '1px solid #333',
                  color: '#059669',
                }}
              >
                100%
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                تفاصيل الإنجاز
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle whitespace-pre-wrap leading-relaxed"
                style={{
                  border: '1px solid #333',
                  textAlign: 'justify',
                  textJustify: 'inter-word',
                }}
              >
                {report.details || 'لا توجد تفاصيل'}
              </td>
            </tr>
            <tr>
              <th
                className="font-bold px-4 py-3 text-center align-middle"
                style={{
                  border: '1px solid #333',
                  backgroundColor: '#fdfdfd',
                  fontSize: '16px',
                }}
              >
                ملاحظات
              </th>
              <td
                className="font-semibold px-4 py-3 text-center align-middle"
                style={{ border: '1px solid #333' }}
              >
                {report.notes || 'لا يوجد'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div
          className="flex justify-between mt-12 px-5"
          style={{ marginTop: '50px' }}
        >
          <div className="font-bold text-lg text-center">
            توقيع رئيس القسم
          </div>
          <div className="font-bold text-lg text-center">
            توقيع الموظف
          </div>
        </div>
      </div>
    </div>
  );
}
