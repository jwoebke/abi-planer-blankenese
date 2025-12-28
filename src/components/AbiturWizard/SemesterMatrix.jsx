import { useMemo } from 'react';
import SubjectTag from '../ui/SubjectTag';

const SEMESTERS = [
  { key: 'S1', label: 'Semester 1' },
  { key: 'S2', label: 'Semester 2' },
  { key: 'S3', label: 'Semester 3' },
  { key: 'S4', label: 'Semester 4' },
];

const getAdditionalSubjects = (additionalSubjects) => {
  if (Array.isArray(additionalSubjects)) {
    return additionalSubjects;
  }
  if (additionalSubjects && typeof additionalSubjects === 'object') {
    const merged = Object.values(additionalSubjects).flat();
    const unique = new Map();
    merged.forEach((subject) => {
      if (subject?.name && !unique.has(subject.name)) {
        unique.set(subject.name, subject);
      }
    });
    return Array.from(unique.values());
  }
  return [];
};

const ExamCard = ({
  subjects,
  examResults = {},
  onExamNoteChange,
  abiturSubjects = []
}) => (
  <div className="notion-card p-0 min-h-[240px] flex-shrink-0 overflow-hidden">
    <div className="px-3 py-2 bg-notion-bg-secondary text-xs uppercase tracking-wide text-notion-text-tertiary border-b border-notion-border">
      Abiturprüfung
    </div>
    <div className="p-4">
      {subjects.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-notion-text-secondary italic">
            Wähle Prüfungsfächer
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 items-start w-full">
          {subjects.map((subject, idx) => (
            <div
              key={`${subject.name}-${idx}`}
              className="w-full grid grid-cols-[minmax(0,1fr)_3.25rem] items-center gap-2"
            >
              <SubjectTag
                name={subject.name}
                level={subject.level}
                truncateName={true}
                className="w-full min-w-0"
              />
              {onExamNoteChange && (
                <input
                  type="number"
                  min="0"
                  max="15"
                  inputMode="numeric"
                  placeholder="P"
                  value={examResults?.[subject.name]?.points ?? ''}
                  onChange={(e) => onExamNoteChange(subject.name, e.target.value)}
                  className="w-full notion-input text-right h-7 px-2 py-1 text-xs"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {abiturSubjects.length > 0 && (
        <div className="mt-4 pt-3 border-t border-notion-border">
          <p className="text-xs text-notion-text-secondary mb-2">Aufschlüsselung:</p>
          <div className="space-y-0.5">
            {abiturSubjects.map((subject, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
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
  </div>
);

const ResultCard = ({ result, onCalculate, onShowDetails, canCalculate }) => {
  const hasResult = !!result;
  const blockI = result?.blockI;
  const blockII = result?.blockII;

  return (
    <div className="notion-card p-0 min-h-[240px] flex-shrink-0 overflow-hidden">
      <div className="px-3 py-2 bg-notion-bg-secondary text-xs uppercase tracking-wide text-notion-text-tertiary border-b border-notion-border">
        Abiturnote
      </div>
      <div className="p-4 flex flex-col gap-3">
        {hasResult ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-notion-text-tertiary uppercase tracking-wide">
                Gesamtpunktzahl
              </span>
              <span className="text-lg font-semibold text-notion-text">
                {result.totalPoints}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-notion-text-tertiary uppercase tracking-wide">
                Abiturnote
              </span>
              <span className="text-lg font-semibold text-notion-text">
                {result.finalGrade !== null ? result.finalGrade.toFixed(1) : '—'}
              </span>
            </div>
            <div className="pt-2 border-t border-notion-border space-y-1 text-xs text-notion-text-secondary">
              <div className="flex items-center justify-between">
                <span>Block I</span>
                <span>{blockI?.totalE ?? '—'} / 600</span>
              </div>
              {blockI && (
                <div className="flex items-center justify-between">
                  <span>Noten (P/S)</span>
                  <span>
                    {blockI.totalP} / {blockI.totalS}
                  </span>
                </div>
              )}
              {blockI && (
                <div className="flex items-center justify-between">
                  <span>Einbringung</span>
                  <span>{blockI.gradeCount} Noten</span>
                </div>
              )}
              {blockI && (
                <div className="flex items-center justify-between">
                  <span>Unter 5</span>
                  <span>{blockI.gradesUnder5}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Block II</span>
                <span>{blockII?.totalE ?? '—'} / 300</span>
              </div>
              {blockII && (
                <div className="flex items-center justify-between">
                  <span>Prüfungen</span>
                  <span>{blockII.examDetails?.length ?? 0}</span>
                </div>
              )}
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onCalculate}
            disabled={!canCalculate}
            className={`notion-btn ${canCalculate ? 'notion-btn-primary' : 'notion-btn-secondary opacity-50 cursor-not-allowed'}`}
          >
            {hasResult ? 'Neu berechnen' : 'Berechnen'}
          </button>
          {onShowDetails && (
            <button
              type="button"
              onClick={onShowDetails}
              disabled={!canCalculate}
              className={`notion-btn notion-btn-secondary ${canCalculate ? '' : 'opacity-50 cursor-not-allowed'}`}
            >
              Detailansicht
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * SemesterMatrix - Table for semester grades plus Abitur card
 */
export default function SemesterMatrix({
  profile,
  coreSubjects,
  examSubjects,
  additionalSubjects = {},
  grades = {},
  onGradesChange,
  examResults = {},
  onExamResultsChange,
  calculationResult,
  onCalculate,
  onShowDetails,
  canCalculate
}) {
  const handleNoteChange = (semesterKey, subjectName, value) => {
    if (onGradesChange) {
      onGradesChange(semesterKey, subjectName, value);
    }
  };

  const handleExamNoteChange = (subjectName, value) => {
    if (onExamResultsChange) {
      onExamResultsChange(subjectName, value);
    }
  };

  const getSemesterSubjects = () => {
    const subjects = [];

    if (profile) {
      profile.profilgebend.forEach((fach) => {
        subjects.push({
          name: fach.name,
          level: fach.level,
          type: 'profilgebend'
        });
      });

      profile.profilbegleitend.forEach((fach) => {
        subjects.push({
          name: fach.name,
          level: fach.level,
          type: 'profilbegleitend'
        });
      });
    }

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

    getAdditionalSubjects(additionalSubjects).forEach((subject) => {
      subjects.push({
        name: subject.name,
        level: subject.level,
        type: 'zusatzfach'
      });
    });

    const uniqueSubjects = subjects.filter(
      (subject, index, self) => index === self.findIndex((s) => s.name === subject.name)
    );

    return uniqueSubjects;
  };

  const getExamSubjects = () => {
    if (!examSubjects) return [];
    return examSubjects.map((exam) => ({
      name: exam.name,
      level: exam.level,
      examType: exam.examType,
      position: exam.position
    }));
  };

  const semesterSubjects = getSemesterSubjects();
  const abiturSubjects = getExamSubjects();
  const highlightedGrades = useMemo(() => {
    const selected = calculationResult?.blockI?.selectedGrades || [];
    return new Set(selected.map((grade) => `${grade.subject}::${grade.semester}`));
  }, [calculationResult]);

  return (
    <div className="sticky top-0 z-20 bg-notion-bg border-b border-notion-border shadow-sm mb-8">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold text-notion-text">
              Abiturnotenrechner
            </h2>
            <p className="notion-section-header">
              Gymnasium Blankenese
            </p>
            {profile && (
              <span className="text-sm text-notion-text-secondary ml-auto">
                Profil: <span className="font-medium text-notion-text">{profile.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[max-content_12rem_16rem]">
          <div className="notion-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="grid grid-cols-[12rem_repeat(4,4.5rem)] bg-notion-bg-secondary text-xs uppercase tracking-wide text-notion-text-tertiary border-b border-notion-border">
                  <div className="px-3 py-2">Fächer</div>
                  {SEMESTERS.map((semester) => (
                    <div key={semester.key} className="px-2 py-2 text-center">
                      {semester.key}
                    </div>
                  ))}
                </div>

                {semesterSubjects.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-notion-text-secondary">
                    Noch keine Fächer ausgewählt.
                  </div>
                ) : (
                  semesterSubjects.map((subject) => (
                    <div
                      key={subject.name}
                      className="grid grid-cols-[12rem_repeat(4,4.5rem)] items-center border-b border-notion-border last:border-b-0 hover:bg-notion-bg-tertiary transition-colors"
                    >
                      <div className="px-3 py-0.5 min-w-0">
                        <SubjectTag
                          name={subject.name}
                          level={subject.level}
                          truncateName={true}
                          className="w-full min-w-0"
                        />
                      </div>
                      {SEMESTERS.map((semester) => {
                        const value = grades?.[subject.name]?.[semester.key]?.points;
                        const displayValue = value === '' || value === null || value === undefined ? '' : value;
                        const isIncluded = highlightedGrades.has(`${subject.name}::${semester.key}`);

                        return (
                          <div key={semester.key} className="px-1.5 py-0.5 flex items-center justify-center">
                            <input
                              type="number"
                              min="0"
                              max="15"
                              inputMode="numeric"
                              placeholder=""
                              aria-label={`${subject.name} ${semester.label}`}
                              value={displayValue}
                              onChange={(e) => handleNoteChange(semester.key, subject.name, e.target.value)}
                              className={`notion-input text-right h-5 px-1.5 py-0.5 text-xs w-12 ${isIncluded ? 'bg-notion-bg-tertiary' : ''}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <ExamCard
            subjects={abiturSubjects}
            abiturSubjects={abiturSubjects}
            examResults={examResults}
            onExamNoteChange={handleExamNoteChange}
          />
          <ResultCard
            result={calculationResult}
            onCalculate={onCalculate}
            onShowDetails={onShowDetails}
            canCalculate={canCalculate}
          />
        </div>
      </div>
    </div>
  );
}
