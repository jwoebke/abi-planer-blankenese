import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle2, Award, FileText } from 'lucide-react';
import { calculateAbiturPrognose } from '../utils/abiturCalculation';

export default function ResultsDashboard({
  profile,
  coreSubjects,
  examSubjects,
  grades,
  onBack,
  onResultCalculated
}) {
  // For now, we'll use predicted exam results based on semester grades
  const [examResults, setExamResults] = useState(() => {
    const results = {};
    examSubjects.forEach(exam => {
      // Calculate average from available semester grades
      const subjectGrades = grades[exam.name];
      if (subjectGrades) {
        const validGrades = ['S1', 'S2', 'S3', 'S4']
          .map(sem => subjectGrades[sem])
          .filter(g => g.points !== '')
          .map(g => parseFloat(g.points));

        if (validGrades.length > 0) {
          const avg = validGrades.reduce((sum, p) => sum + p, 0) / validGrades.length;
          results[exam.name] = { points: Math.round(avg), isPrediction: true };
        } else {
          results[exam.name] = { points: 10, isPrediction: true };
        }
      }
    });
    return results;
  });

  // Calculate Abitur prognosis
  const result = calculateAbiturPrognose(
    grades,
    examSubjects,
    examResults,
    coreSubjects,
    profile
  );

  const handleExamResultChange = (subjectName, points) => {
    setExamResults(prev => ({
      ...prev,
      [subjectName]: { points: parseFloat(points), isPrediction: false }
    }));
  };

  // Notify parent component when result changes (for saving)
  useEffect(() => {
    if (onResultCalculated && result) {
      onResultCalculated(result, examResults);
    }
  }, [result, examResults]);

  // Calculate percentage
  const percentage = ((result.totalPoints / result.maxPossible) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück zu Noten
          </button>

          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Deine Abiturprognose
            </h1>
            <p className="text-slate-600">
              Profil: <span className="font-semibold">{profile.name}</span>
            </p>
          </div>
        </div>

        {/* Main Result Card */}
        <div className={`rounded-2xl p-8 text-white shadow-2xl mb-8 ${
          result.passed
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-12 h-12" />
              <div>
                <div className="text-sm opacity-90">Abiturnote</div>
                <div className="text-5xl font-bold">
                  {result.finalGrade !== null ? result.finalGrade.toFixed(1) : '—'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Gesamtpunktzahl</div>
              <div className="text-4xl font-bold">{result.totalPoints}</div>
              <div className="text-sm opacity-75">von {result.maxPossible} Punkten</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-sm mt-2 opacity-90 text-right">
            {percentage}% erreicht
          </div>

          {/* Status */}
          <div className="mt-6 flex items-center gap-2">
            {result.passed ? (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-semibold">Abitur bestanden!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">Abitur nicht bestanden</span>
              </>
            )}
          </div>
        </div>

        {/* Errors and Warnings */}
        {result.errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Kritische Fehler
                </h3>
                <ul className="space-y-1">
                  {result.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-800">• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  Warnungen
                </h3>
                <ul className="space-y-1">
                  {result.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-amber-800">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Block Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Block I */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Block I</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {result.blockI.totalE}
                </div>
                <div className="text-sm text-slate-600">von 600</div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Eingebrachte Noten:</span>
                <span className="font-semibold">{result.blockI.gradeCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Summe (P):</span>
                <span className="font-semibold">{result.blockI.totalP}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Anzahl (S):</span>
                <span className="font-semibold">{result.blockI.totalS}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Noten unter 5 Punkten:</span>
                <span className={`font-semibold ${
                  result.blockI.percentUnder5 > 20 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result.blockI.gradesUnder5} ({result.blockI.percentUnder5}%)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <details className="cursor-pointer">
                <summary className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Eingebrachte Noten anzeigen ({result.blockI.gradeCount})
                </summary>
                <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                  {result.blockI.selectedGrades.map((grade, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex justify-between items-center py-1 px-2 bg-slate-50 rounded"
                    >
                      <span className={grade.isPrediction ? 'text-amber-700' : 'text-slate-700'}>
                        {grade.displayName}
                        {grade.isDouble && ' (2×)'}
                        {grade.isMandatory && ' (Pflicht)'}
                      </span>
                      <span className="font-semibold">{grade.points} P</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Block II */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Block II</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {result.blockII.totalE}
                </div>
                <div className="text-sm text-slate-600">von 300</div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-3">
                Prüfungsergebnisse (jeweils 5-fach gewichtet):
              </p>

              {result.blockII.examDetails.map((exam, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-slate-900">{exam.subject}</div>
                      <div className="text-xs text-slate-500">
                        {exam.examType === 'schriftlich' ? 'Schriftlich' : `Mündlich (${exam.format})`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">
                        {exam.weightedPoints}
                      </div>
                      <div className="text-xs text-slate-500">({exam.points} × 5)</div>
                    </div>
                  </div>

                  {/* Edit exam result */}
                  <div className="mt-2">
                    <label className="text-xs text-slate-600 block mb-1">
                      Prognostizierte Punkte:
                    </label>
                    <select
                      value={exam.points}
                      onChange={(e) => handleExamResultChange(exam.subject, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Array.from({ length: 16 }, (_, i) => i).map(points => (
                        <option key={points} value={points}>{points} Punkte</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What-If Scenarios Hint */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                💡 Optimierungshinweise
              </h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Block I:</strong> Von {result.blockI.gradeCount + result.blockI.notSelectedGrades.length} verfügbaren
                  Semesternoten wurden die besten {result.blockI.gradeCount} eingebracht.
                </p>
                {result.blockI.notSelectedGrades.length > 0 && (
                  <p className="text-xs text-slate-600">
                    Nicht eingebracht: {result.blockI.notSelectedGrades.length} Noten
                    (würden den Schnitt nicht verbessern)
                  </p>
                )}
                <p>
                  <strong>Block II:</strong> Ändere die Prüfungsprognosen oben, um verschiedene
                  Szenarien durchzuspielen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
