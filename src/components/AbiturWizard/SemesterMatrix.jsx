import SubjectTag from '../ui/SubjectTag';

/**
 * SemesterMatrix - 5-column grid showing S1, S2, S3, S4, and Abiturprüfung
 * KRITISCH: Muss horizontal mit grid-cols-5 sein, nicht vertikal gestapelt!
 */
export default function SemesterMatrix({
  profile,
  coreSubjects,
  examSubjects,
  additionalSubjects = []
}) {
  // Build the subject lists for each semester (S1-S4 have same subjects)
  const getSemesterSubjects = () => {
    const subjects = [];

    // Add profile subjects (profilgebend) - appear in all 4 semesters
    if (profile) {
      profile.profilgebend.forEach(fach => {
        subjects.push({
          name: fach.name,
          level: fach.level,
          type: 'profilgebend'
        });
      });

      // Add profilbegleitend - also in all 4 semesters
      profile.profilbegleitend.forEach(fach => {
        subjects.push({
          name: fach.name,
          level: fach.level,
          type: 'profilbegleitend'
        });
      });
    }

    // Add core subjects - in all 4 semesters
    if (coreSubjects) {
      if (coreSubjects.coreEA1) {
        subjects.push({
          name: coreSubjects.coreEA1,
          level: 'eA',
          type: 'kernfach'
        });
      }
      if (coreSubjects.coreEA2) {
        subjects.push({
          name: coreSubjects.coreEA2,
          level: 'eA',
          type: 'kernfach'
        });
      }
      if (coreSubjects.coreGA) {
        subjects.push({
          name: coreSubjects.coreGA,
          level: 'gA',
          type: 'kernfach'
        });
      }
    }

    // Add additional subjects
    additionalSubjects.forEach(subject => {
      subjects.push({
        name: subject.name,
        level: subject.level,
        type: 'zusatzfach'
      });
    });

    // Remove duplicates
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

  const SemesterCard = ({ title, subjects, isExam = false }) => (
    <div className={`
      notion-card p-4 min-h-[240px] flex-shrink-0
      ${isExam ? 'border-2 border-dashed' : ''}
    `}>
      <h3 className="text-sm font-semibold text-notion-text mb-3 pb-2 border-b border-notion-border">
        {title}
      </h3>

      {subjects.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-notion-text-secondary italic">
            {isExam ? 'Wähle Prüfungsfächer' : 'Noch keine Fächer'}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subject, idx) => (
            <SubjectTag
              key={`${subject.name}-${idx}`}
              name={subject.name}
              level={subject.level}
            />
          ))}
        </div>
      )}

      {isExam && abiturSubjects.length > 0 && (
        <div className="mt-4 pt-3 border-t border-notion-border">
          <p className="text-xs text-notion-text-secondary mb-2">Aufschlüsselung:</p>
          <div className="space-y-1">
            {abiturSubjects.map((subject, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="text-notion-text-tertiary w-20 flex-shrink-0">
                  {subject.position}. Prüfung
                </span>
                <span className="text-notion-text-secondary">
                  {subject.examType === 'schriftlich' ? 'S' : 'M'}
                </span>
                <SubjectTag name={subject.name} level={subject.level} className="text-[0.65rem]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="sticky top-0 z-20 bg-notion-bg border-b border-notion-border shadow-sm mb-8">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-notion-text">
              Deine Fächerwahl
            </h2>
            {profile && (
              <span className="text-sm text-notion-text-secondary">
                Profil: <span className="font-medium text-notion-text">{profile.name}</span>
              </span>
            )}
          </div>
          <p className="notion-section-header">
            Übersicht über alle 4 Semester + Abiturprüfung
          </p>
        </div>

        {/* KRITISCH: 5 Spalten horizontal!
            Mobile: horizontal scroll, Desktop: grid */}
        <div className="
          flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory
          md:grid md:grid-cols-5 md:overflow-visible md:pb-0
        ">
          <SemesterCard title="Semester 1" subjects={semesterSubjects} />
          <SemesterCard title="Semester 2" subjects={semesterSubjects} />
          <SemesterCard title="Semester 3" subjects={semesterSubjects} />
          <SemesterCard title="Semester 4" subjects={semesterSubjects} />
          <SemesterCard title="Abiturprüfung" subjects={abiturSubjects} isExam />
        </div>
      </div>
    </div>
  );
}
