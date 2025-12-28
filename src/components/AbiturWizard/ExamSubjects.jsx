import { useState, useEffect } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

export default function ExamSubjects({ profile, coreSubjects, examSubjects, onExamSubjectsChange, isActive }) {
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
      availableSubjects.push({ name: fach.name, level: fach.level });
    });
    profile.profilbegleitend.forEach(fach => {
      availableSubjects.push({ name: fach.name, level: fach.level });
    });

    // Add core subjects
    availableSubjects.push({ name: coreSubjects.coreEA1, level: 'eA' });
    availableSubjects.push({ name: coreSubjects.coreEA2, level: 'eA' });
    availableSubjects.push({ name: coreSubjects.coreGA, level: 'gA' });

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

  const handleExamTypeChange = (position, examType) => {
    setSubjects(prev => prev.map(exam =>
      exam.position === position ? { ...exam, examType } : exam
    ));
  };

  // Validate and update parent
  useEffect(() => {
    const filledSubjects = subjects.filter(s => s.name);

    // Check if all 4 exam subjects are selected
    if (filledSubjects.length === 4) {
      // Basic validation: all different subjects
      const uniqueNames = new Set(filledSubjects.map(s => s.name));
      if (uniqueNames.size === 4) {
        onExamSubjectsChange(subjects);
        return;
      }
    }

    onExamSubjectsChange(null);
  }, [subjects, onExamSubjectsChange]);

  const isComplete = subjects.every(s => s.name);

  if (!isActive && !examSubjects) {
    return (
      <section className="py-12 px-6 bg-notion-gray-50 opacity-50">
        <div className="max-w-7xl mx-auto">
          <div className="notion-section-header">Schritt 3</div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 mb-2">
            Prüfungsfächer wählen
          </h2>
          <p className="text-sm text-notion-gray-400">
            Wähle zuerst deine Kernfächer aus.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-6 ${isActive ? 'bg-white' : 'bg-notion-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="notion-section-header">Schritt 3</div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 mb-2">
            Prüfungsfächer wählen
          </h2>
          <p className="text-sm text-notion-gray-400">
            Wähle 4 Prüfungsfächer: 3 schriftliche Prüfungen und 1 mündliche Prüfung. Mindestens 2 müssen auf eA-Niveau sein.
          </p>
        </div>

        {/* Exam Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Schriftlich 1 (eA) */}
          <div className="notion-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-notion-gray-900">
                1. Prüfungsfach (Schriftlich)
              </h4>
              <span className="notion-chip-blue">eA</span>
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
              <h4 className="text-sm font-semibold text-notion-gray-900">
                2. Prüfungsfach (Schriftlich)
              </h4>
              <span className="notion-chip-blue">eA</span>
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
              <h4 className="text-sm font-semibold text-notion-gray-900">
                3. Prüfungsfach (Schriftlich)
              </h4>
              <span className="notion-chip-green">gA</span>
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
              <h4 className="text-sm font-semibold text-notion-gray-900">
                4. Prüfungsfach (Mündlich)
              </h4>
              <span className="notion-chip-green">gA</span>
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
        <div className="mb-6 p-4 bg-notion-blue-bg border border-notion-blue rounded-md">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-notion-blue flex-shrink-0 mt-0.5" />
            <div className="text-xs text-notion-gray-700 space-y-1">
              <p><strong>Wichtig:</strong> Die Prüfungsfächer müssen alle drei Aufgabenfelder abdecken:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Sprachlich-künstlerisch (z.B. Deutsch, Englisch, Kunst)</li>
                <li>Mathematisch-naturwissenschaftlich (z.B. Mathe, Physik, Bio)</li>
                <li>Gesellschaftswissenschaftlich (z.B. Geschichte, PGW, Geo)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isComplete && (
          <div className="p-4 bg-notion-green-bg border border-notion-green rounded-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-notion-green flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-notion-gray-900 mb-1">
                  Prüfungsfächer ausgewählt
                </h4>
                <p className="text-xs text-notion-gray-600">
                  Alle vier Prüfungsfächer wurden ausgewählt. Du kannst nun optional weitere Fächer hinzufügen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
