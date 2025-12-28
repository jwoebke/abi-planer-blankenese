import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateExamSubjects, getAufgabenfeldForSubject, EXAM_VARIANTS } from '../data/examConstraints';
import { AUFGABENFELDER } from '../data/profiles';

export default function ExamSubjectSelector({ profile, coreSubjects, onComplete, onBack }) {
  const [examSubjects, setExamSubjects] = useState([
    { position: 1, name: '', examType: 'schriftlich', level: 'eA' },
    { position: 2, name: '', examType: 'schriftlich', level: 'eA' },
    { position: 3, name: '', examType: 'schriftlich', level: 'gA' },
    { position: 4, name: '', examType: 'mündlich', level: 'gA', format: 'klassisch' }
  ]);

  const [validation, setValidation] = useState({ valid: false, errors: [], warnings: [] });
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Available subjects from profile and core subjects
  const availableSubjects = [
    ...profile.profilgebend.map(f => ({ name: f.name, level: f.level, role: 'profilgebend' })),
    ...profile.profilbegleitend.map(f => ({ name: f.name, level: f.level, role: 'profilbegleitend' })),
    { name: coreSubjects.coreEA1, level: 'eA', role: 'Kernfach' },
    { name: coreSubjects.coreEA2, level: 'eA', role: 'Kernfach' },
    { name: coreSubjects.coreGA, level: 'gA', role: 'Kernfach' },
  ];

  // Remove duplicates (e.g., if a core subject is also profilgebend)
  const uniqueSubjects = availableSubjects.filter((subject, index, self) =>
    index === self.findIndex(s => s.name === subject.name)
  );

  useEffect(() => {
    // Validate whenever exam subjects change
    const validation = validateExamSubjects(
      examSubjects.filter(s => s.name),
      profile,
      coreSubjects
    );
    setValidation(validation);
  }, [examSubjects, profile, coreSubjects]);

  const handleSubjectChange = (position, subjectName) => {
    const selectedSubject = uniqueSubjects.find(s => s.name === subjectName);
    if (!selectedSubject) return;

    setExamSubjects(prev => prev.map(exam =>
      exam.position === position
        ? { ...exam, name: subjectName, level: selectedSubject.level }
        : exam
    ));
  };

  const handleExamTypeChange = (position, examType) => {
    setExamSubjects(prev => prev.map(exam =>
      exam.position === position ? { ...exam, examType } : exam
    ));
  };

  const handleMuendlichFormatChange = (position, format) => {
    setExamSubjects(prev => prev.map(exam =>
      exam.position === position ? { ...exam, format } : exam
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validation.valid) {
      onComplete(examSubjects.filter(s => s.name));
    }
  };

  const isSubjectSelected = (subjectName) => {
    return examSubjects.some(exam => exam.name === subjectName);
  };

  const getAufgabenfeldCoverage = () => {
    const covered = new Set();
    examSubjects.filter(s => s.name).forEach(exam => {
      const aufgabenfeld = getAufgabenfeldForSubject(exam.name);
      if (aufgabenfeld) covered.add(aufgabenfeld);
    });
    return covered;
  };

  const aufgabenfeldCoverage = getAufgabenfeldCoverage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück
          </button>

          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Prüfungsfächer wählen
            </h1>
            <p className="text-slate-600">
              Profil: <span className="font-semibold">{profile.name}</span> |
              Kernfächer: <span className="font-semibold">
                {coreSubjects.coreEA1} (eA), {coreSubjects.coreEA2} (eA), {coreSubjects.coreGA} (gA)
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Exam Subjects */}
              {examSubjects.map((exam) => (
                <div key={exam.position} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {exam.position}. Prüfungsfach
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        ({exam.examType === 'schriftlich' ? 'Schriftlich' : 'Mündlich'})
                      </span>
                    </h3>
                    {exam.name && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        exam.level === 'eA'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {exam.level}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fach auswählen
                      </label>
                      <select
                        value={exam.name}
                        onChange={(e) => handleSubjectChange(exam.position, e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- Fach wählen --</option>
                        {uniqueSubjects.map((subject) => (
                          <option
                            key={subject.name}
                            value={subject.name}
                            disabled={isSubjectSelected(subject.name) && exam.name !== subject.name}
                          >
                            {subject.name} ({subject.level}) - {subject.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exam Type Toggle (for flexible positions) */}
                    {exam.position <= 3 && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Prüfungsart
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleExamTypeChange(exam.position, 'schriftlich')}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                              exam.examType === 'schriftlich'
                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            Schriftlich
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExamTypeChange(exam.position, 'mündlich')}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                              exam.examType === 'mündlich'
                                ? 'border-green-500 bg-green-50 text-green-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            Mündlich
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mündliche Prüfung Format */}
                    {exam.examType === 'mündlich' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Format der mündlichen Prüfung
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleMuendlichFormatChange(exam.position, 'klassisch')}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                              exam.format === 'klassisch'
                                ? 'border-purple-500 bg-purple-50 text-purple-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            Klassisch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMuendlichFormatChange(exam.position, 'Präsentation')}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                              exam.format === 'Präsentation'
                                ? 'border-purple-500 bg-purple-50 text-purple-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            Präsentation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!validation.valid}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  validation.valid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Weiter zur Notenerfassung
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>
          </div>

          {/* Sidebar with Info and Validation */}
          <div className="space-y-6">
            {/* Aufgabenfeld Coverage */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Aufgabenfelder
              </h3>
              <div className="space-y-3">
                {Object.entries(AUFGABENFELDER).map(([key, value]) => {
                  const covered = aufgabenfeldCoverage.has(value);
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        {value === 'sprachlich-künstlerisch' && 'Sprachlich-künstlerisch'}
                        {value === 'math-naturwiss' && 'Math.-naturwiss.'}
                        {value === 'gesellschaftswiss' && 'Gesellschaftswiss.'}
                      </span>
                      {covered ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Validation Messages */}
            {validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-2">
                      Fehler in der Auswahl
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {validation.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {validation.valid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 mb-1">
                      Auswahl ist gültig!
                    </h4>
                    <p className="text-sm text-green-800">
                      Alle Anforderungen sind erfüllt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Prüfungsregeln
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 3 schriftliche + 1 mündliche Prüfung</li>
                <li>• Mind. 1 profilgebendes Fach</li>
                <li>• Mind. 2 Kernfächer</li>
                <li>• Mind. 2 Fächer auf eA schriftlich</li>
                <li>• Alle 3 Aufgabenfelder abdecken</li>
              </ul>
            </div>

            {/* Exam Variants Hint */}
            {EXAM_VARIANTS[profile.id] && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">
                  Mögliche Varianten
                </h4>
                <p className="text-xs text-amber-800 mb-2">
                  Für dein Profil gibt es {EXAM_VARIANTS[profile.id].length} vordefinierte Varianten:
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  {EXAM_VARIANTS[profile.id].map((variant) => (
                    <li key={variant.id}>• {variant.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
