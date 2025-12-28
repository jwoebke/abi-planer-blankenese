import { Check, AlertCircle } from 'lucide-react';

/**
 * SemesterMatrix - The 5-column overview showing S1, S2, S3, S4, and Abiturprüfung
 * This component displays the progressive selection of subjects across all semesters
 */
export default function SemesterMatrix({
  profile,
  coreSubjects,
  examSubjects,
  additionalSubjects = []
}) {
  // Build the subject lists for each semester
  const getSemesterSubjects = (semester) => {
    const subjects = [];

    // Add profile subjects (profilgebend) - appear in all 4 semesters
    if (profile) {
      profile.profilgebend.forEach(fach => {
        subjects.push({
          name: fach.name,
          level: fach.level,
          type: 'profilgebend',
          required: true
        });
      });

      // Add profilbegleitend - also in all 4 semesters
      profile.profilbegleitend.forEach(fach => {
        subjects.push({
          name: fach.name,
          level: fach.level,
          type: 'profilbegleitend',
          required: true
        });
      });
    }

    // Add core subjects - in all 4 semesters
    if (coreSubjects) {
      if (coreSubjects.coreEA1) {
        subjects.push({
          name: coreSubjects.coreEA1,
          level: 'eA',
          type: 'kernfach',
          required: true
        });
      }
      if (coreSubjects.coreEA2) {
        subjects.push({
          name: coreSubjects.coreEA2,
          level: 'eA',
          type: 'kernfach',
          required: true
        });
      }
      if (coreSubjects.coreGA) {
        subjects.push({
          name: coreSubjects.coreGA,
          level: 'gA',
          type: 'kernfach',
          required: true
        });
      }
    }

    // Add additional subjects (user-selected extras)
    additionalSubjects.forEach(subject => {
      subjects.push({
        name: subject.name,
        level: subject.level,
        type: 'zusatzfach',
        required: false
      });
    });

    // Remove duplicates (in case a subject appears multiple times)
    const uniqueSubjects = subjects.filter((subject, index, self) =>
      index === self.findIndex(s => s.name === subject.name)
    );

    return uniqueSubjects;
  };

  // Get exam subjects for Abiturprüfung column
  const getExamSubjects = () => {
    if (!examSubjects) return [];

    return examSubjects.map(exam => ({
      name: exam.name,
      level: exam.level,
      examType: exam.examType,
      position: exam.position
    }));
  };

  const semesterSubjects = getSemesterSubjects();
  const abiturSubjects = getExamSubjects();

  // Helper to get chip color based on subject type
  const getChipStyle = (type, required) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors";

    if (type === 'profilgebend') {
      return `${baseClasses} bg-notion-blue-bg text-notion-blue border border-notion-blue`;
    }
    if (type === 'kernfach') {
      return `${baseClasses} bg-notion-green-bg text-notion-green border border-notion-green`;
    }
    if (type === 'profilbegleitend') {
      return `${baseClasses} bg-notion-yellow-bg text-notion-yellow border border-notion-yellow`;
    }
    return `${baseClasses} bg-notion-gray-50 text-notion-gray-700 border border-notion-gray-100`;
  };

  const getLevelBadge = (level) => {
    return (
      <span className="ml-1 text-[10px] font-semibold opacity-70">
        {level}
      </span>
    );
  };

  const Column = ({ title, subjects, isExam = false }) => (
    <div className="flex-1 min-w-0">
      <div className="notion-card h-full p-4">
        <h3 className="text-sm font-semibold text-notion-gray-900 mb-3 pb-2 border-b border-notion-gray-100">
          {title}
        </h3>

        {subjects.length === 0 ? (
          <div className="text-center py-8 text-notion-gray-400 text-xs">
            {isExam ? 'Wähle Prüfungsfächer' : 'Noch keine Fächer'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {subjects.map((subject, idx) => (
              <div key={idx} className={getChipStyle(subject.type, subject.required)}>
                {subject.required && (
                  <Check className="w-3 h-3 mr-1" strokeWidth={2.5} />
                )}
                <span>{subject.name}</span>
                {subject.level && getLevelBadge(subject.level)}
                {subject.examType && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    ({subject.examType === 'schriftlich' ? 'S' : 'M'})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-notion-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-notion-gray-900 mb-1">
            Deine Fächerwahl
          </h2>
          {profile && (
            <p className="text-sm text-notion-gray-400">
              Profil: <span className="font-medium text-notion-gray-700">{profile.name}</span>
            </p>
          )}
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Column title="Semester 1" subjects={semesterSubjects} />
          <Column title="Semester 2" subjects={semesterSubjects} />
          <Column title="Semester 3" subjects={semesterSubjects} />
          <Column title="Semester 4" subjects={semesterSubjects} />
          <Column title="Abiturprüfung" subjects={abiturSubjects} isExam />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-notion-blue-bg border border-notion-blue"></div>
            <span className="text-notion-gray-600">Profilgebend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-notion-green-bg border border-notion-green"></div>
            <span className="text-notion-gray-600">Kernfach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-notion-yellow-bg border border-notion-yellow"></div>
            <span className="text-notion-gray-600">Profilbegleitend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-notion-gray-50 border border-notion-gray-100"></div>
            <span className="text-notion-gray-600">Zusatzfach</span>
          </div>
        </div>
      </div>
    </div>
  );
}
