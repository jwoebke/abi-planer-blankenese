import { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { validateExamSubjects } from '../../data/examConstraints';

const flattenAdditionalSubjects = (subjects) => {
  if (Array.isArray(subjects)) {
    return subjects;
  }
  if (subjects && typeof subjects === 'object') {
    return Object.values(subjects).flat();
  }
  return [];
};

const expandSubjectName = (name) => {
  if (!name) return [];
  if (name.includes(' oder ')) {
    return name.split(' oder ').map((part) => part.trim()).filter(Boolean);
  }
  return [name];
};

export default function ExamSubjects({
  profile,
  coreSubjects,
  examSubjects,
  additionalSubjects = {},
  onExamSubjectsChange,
  isActive
}) {
  const [subjects, setSubjects] = useState(
    examSubjects || [
      { position: 1, name: '', examType: 'schriftlich', level: 'eA' },
      { position: 2, name: '', examType: 'schriftlich', level: 'eA' },
      { position: 3, name: '', examType: 'schriftlich', level: 'gA' },
      { position: 4, name: '', examType: 'mündlich', level: 'gA', format: 'klassisch' }
    ]
  );

  // Get all available subjects from profile + core subjects
  const getAvailableSubjects = () => {
    if (!profile || !coreSubjects) return [];

    const availableSubjects = [];

    // Add profile subjects
    profile.profilgebend.forEach(fach => {
      expandSubjectName(fach.name).forEach((name) => {
        availableSubjects.push({ name, level: fach.level });
      });
    });
    profile.profilbegleitend.forEach(fach => {
      expandSubjectName(fach.name).forEach((name) => {
        availableSubjects.push({ name, level: fach.level });
      });
    });

    // Add core subjects
    availableSubjects.push({ name: coreSubjects.coreEA1, level: 'eA' });
    availableSubjects.push({ name: coreSubjects.coreEA2, level: 'eA' });
    availableSubjects.push({ name: coreSubjects.coreGA, level: 'gA' });

    // Add additional subjects
    flattenAdditionalSubjects(additionalSubjects).forEach((subject) => {
      if (!subject?.name) return;
      availableSubjects.push({ name: subject.name, level: subject.level || 'gA' });
    });

    // Remove duplicates
    const unique = availableSubjects.filter((subject, index, self) =>
      index === self.findIndex(s => s.name === subject.name)
    );

    return unique;
  };

  const availableSubjects = getAvailableSubjects();

  // Check if subject is already selected
  const isSubjectSelected = (subjectName, currentPosition) => {
    return subjects.some(s => s.name === subjectName && s.position !== currentPosition);
  };

  const handleSubjectChange = (position, subjectName) => {
    const selected = availableSubjects.find(s => s.name === subjectName);
    if (!selected) return;

    setSubjects(prev => prev.map(exam =>
      exam.position === position
        ? { ...exam, name: subjectName, level: selected.level }
        : exam
    ));
  };

  const validation = useMemo(() => {
    if (!profile || !coreSubjects) {
      return { valid: false, errors: [], warnings: [] };
    }

    const allSelected = subjects.every((s) => s.name);
    if (!allSelected) {
      return {
        valid: false,
        errors: ['Bitte wähle alle 4 Prüfungsfächer aus.'],
        warnings: [],
      };
    }

    return validateExamSubjects(subjects, profile, coreSubjects);
  }, [subjects, profile, coreSubjects]);

  // Update parent whenever the selection changes
  useEffect(() => {
    if (!profile || !coreSubjects) return;
    onExamSubjectsChange(validation.valid ? subjects : null);
  }, [subjects, profile, coreSubjects, onExamSubjectsChange, validation.valid]);

  const isComplete = validation.valid;

  if (!isActive && !examSubjects) {
    return (
      <section className="py-8 px-6 bg-notion-bg-secondary opacity-60">
        <div className="max-w-7xl mx-auto">
          <p className="notion-section-header">Schritt 4</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Prüfungsfächer wählen
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Wähle zuerst die weiteren Fächer aus.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 px-6 ${isActive ? 'bg-notion-bg' : 'bg-notion-bg-secondary'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="notion-section-header mb-2">Schritt 4</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Prüfungsfächer wählen
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Wähle 4 Prüfungsfächer: 3 schriftliche Prüfungen und 1 mündliche Prüfung. Mindestens 2 müssen auf eA-Niveau sein.
          </p>
        </div>

        {/* Exam Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Schriftlich 1 (eA) */}
          <div className="notion-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-notion-text">
                1. Prüfungsfach (Schriftlich)
              </h4>
              <span className="notion-tag bg-[rgba(211,229,239,1)] text-[rgb(24,51,71)]">eA</span>
            </div>
            <select
              value={subjects[0].name}
              onChange={(e) => handleSubjectChange(1, e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableSubjects.filter(s => s.level === 'eA').map(subject => (
                <option
                  key={subject.name}
                  value={subject.name}
                  disabled={isSubjectSelected(subject.name, 1)}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Schriftlich 2 (eA) */}
          <div className="notion-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-notion-text">
                2. Prüfungsfach (Schriftlich)
              </h4>
              <span className="notion-tag bg-[rgba(211,229,239,1)] text-[rgb(24,51,71)]">eA</span>
            </div>
            <select
              value={subjects[1].name}
              onChange={(e) => handleSubjectChange(2, e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableSubjects.filter(s => s.level === 'eA').map(subject => (
                <option
                  key={subject.name}
                  value={subject.name}
                  disabled={isSubjectSelected(subject.name, 2)}
                >
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Schriftlich 3 (gA) */}
          <div className="notion-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-notion-text">
                3. Prüfungsfach (Schriftlich)
              </h4>
              <span className="notion-tag bg-[rgba(219,237,219,1)] text-[rgb(28,56,41)]">gA</span>
            </div>
            <select
              value={subjects[2].name}
              onChange={(e) => handleSubjectChange(3, e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableSubjects.map(subject => (
                <option
                  key={subject.name}
                  value={subject.name}
                  disabled={isSubjectSelected(subject.name, 3)}
                >
                  {subject.name} ({subject.level})
                </option>
              ))}
            </select>
          </div>

          {/* Mündlich (gA) */}
          <div className="notion-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-notion-text">
                4. Prüfungsfach (Mündlich)
              </h4>
              <span className="notion-tag bg-[rgba(219,237,219,1)] text-[rgb(28,56,41)]">gA</span>
            </div>
            <select
              value={subjects[3].name}
              onChange={(e) => handleSubjectChange(4, e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableSubjects.map(subject => (
                <option
                  key={subject.name}
                  value={subject.name}
                  disabled={isSubjectSelected(subject.name, 4)}
                >
                  {subject.name} ({subject.level})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-4 p-4 bg-notion-accent-bg border border-notion-accent rounded-lg">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-notion-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-notion-text-secondary space-y-1">
              <p><strong>Wichtig:</strong> Die Prüfungsfächer müssen alle drei Aufgabenfelder abdecken:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Sprachlich-künstlerisch (z.B. Deutsch, Englisch, Kunst)</li>
                <li>Mathematisch-naturwissenschaftlich (z.B. Mathe, Physik, Bio)</li>
                <li>Gesellschaftswissenschaftlich (z.B. Geschichte, PGW, Geo)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Validation Feedback */}
        {validation.errors.length > 0 && (
          <div className="mb-4 p-4 bg-notion-error-bg border border-notion-error rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-notion-error flex-shrink-0" />
              <div className="text-sm text-notion-text space-y-1">
                {validation.errors.map((error, idx) => (
                  <p key={idx}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isComplete && (
          <div className="p-4 bg-notion-success-bg border border-notion-success rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-notion-success flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-notion-text mb-1">
                  Prüfungsfächer ausgewählt
                </h4>
                <p className="text-sm text-notion-text-secondary">
                  Alle vier Prüfungsfächer wurden ausgewählt. Du kannst mit der Noteneingabe fortfahren.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
