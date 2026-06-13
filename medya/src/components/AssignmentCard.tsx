import { Assignment } from '../types';

interface AssignmentCardProps {
  assignment: Assignment;
  fontFamily?: string;
  signatureName?: string;
  signatureTitle?: string;
}

export default function AssignmentCard({
  assignment,
  fontFamily = 'Cairo',
  signatureName = 'عبدالرحيم أحمد شيتة',
  signatureTitle = 'رئيس قسم الإعلام',
}: AssignmentCardProps) {
  if (!assignment) return null;

  const coText =
    assignment.coEmployees && assignment.coEmployees.length > 0
      ? ` (بمشاركة: ${assignment.coEmployees.join('، ')})`
      : '';

  const employeeDisplay = assignment.primaryEmployee + coText;

  return (
    <div
      className="w-full max-w-[210mm] bg-white"
      dir="rtl"
      style={{
        fontFamily: `'${fontFamily}', 'Cairo', sans-serif`,
        color: '#111827',
      }}
    >
      <div
        className="relative min-h-[1122px]"
        style={{ padding: '160px 60px 80px' }}
      >
        {/* Addressee */}
        <div className="font-extrabold mb-10 text-right" style={{ fontSize: '24px' }}>
          السيد/ مدير مكتب أوقاف القره بوللي
        </div>

        {/* Greeting */}
        <div className="font-bold mb-8" style={{ fontSize: '20px' }}>
          السلام عليكم ورحمة الله وبركاته،
        </div>

        {/* Body Paragraph 1 */}
        <div
          className="mb-6 leading-[2.1]"
          style={{
            fontSize: '20px',
            textAlign: 'justify',
            textJustify: 'inter-word',
          }}
        >
          في الوقت الذي نثمن فيه جهودكم المبذولة في خدمة الصالح العام، نعلمكم
          بأنه قد تم تكليف السيد <strong>{employeeDisplay}</strong> بـ{' '}
          <strong>({assignment.taskType})</strong> في{' '}
          <strong>({assignment.location})</strong> بتاريخ{' '}
          <strong>{assignment.targetDate}</strong>.
        </div>

        {/* Body Paragraph 2 */}
        <div
          className="mb-6 leading-[2.1]"
          style={{
            fontSize: '20px',
            textAlign: 'justify',
            textJustify: 'inter-word',
          }}
        >
          وعليه، نأمل منكم تفريغه خلال وقت الدوام الرسمي ليتسنى له أداء العمل
          المكلف به على أكمل وجه وبأفضل طريقة ممكنة.
        </div>

        {/* Details Section */}
        {assignment.notes && (
          <div
            className="my-10 py-5 px-6 rounded-lg text-right"
            style={{
              border: '1px solid #e5e7eb',
              borderRight: '4px solid #1e3a8a',
              backgroundColor: '#f9fafb',
            }}
          >
            <div className="font-bold mb-2" style={{ color: '#1e3a8a', fontSize: '18px' }}>
              تفاصيل المهمة:
            </div>
            <div
              className="leading-relaxed"
              style={{
                fontSize: '18px',
                color: '#374151',
                textAlign: 'justify',
                textJustify: 'inter-word',
              }}
            >
              {assignment.notes}
            </div>
          </div>
        )}

        {/* Closing */}
        <div className="mt-10 font-bold" style={{ fontSize: '20px' }}>
          والسلام عليكم ورحمة الله وبركاته.
        </div>

        {/* Signature */}
        <div
          className="mt-20 text-center"
          style={{ width: '300px', marginRight: 'auto', marginLeft: '0' }}
        >
          <div className="font-extrabold mb-1" style={{ fontSize: '22px' }}>
            {signatureName}
          </div>
          <div className="font-semibold" style={{ fontSize: '18px' }}>
            {signatureTitle}
          </div>
        </div>

        {/* CC Section */}
        <div
          className="absolute font-bold leading-relaxed"
          style={{
            bottom: '40px',
            right: '60px',
            fontSize: '9pt',
            color: '#4b5563',
          }}
        >
          صورة الي قسم الإعلام
          <br />
          دورى العام
          <br />
          قسم المتابعة
        </div>
      </div>
    </div>
  );
}
