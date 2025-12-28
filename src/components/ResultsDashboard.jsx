import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle2, Award, FileText } from 'lucide-react';
import { calculateAbiturPrognose } from '../utils/abiturCalculation';
import { POINTS_TO_GRADE } from '../data/profiles';

const buildPredictedExamResults = (examSubjects, grades) => {
  const results = {};

  (examSubjects || []).forEach((exam) => {
    const subjectGrades = grades?.[exam.name];
    if (subjectGrades) {
      const validGrades = ['S1', 'S2', 'S3', 'S4']
        .map((sem) => subjectGrades[sem])
        .filter((g) => g.points !== '')
        .map((g) => parseFloat(g.points));

      if (validGrades.length > 0) {
        const avg = validGrades.reduce((sum, p) => sum + p, 0) / validGrades.length;
        results[exam.name] = { points: Math.round(avg), isPrediction: true };
      } else {
        results[exam.name] = { points: 10, isPrediction: true };
      }
    } else {
      results[exam.name] = { points: 10, isPrediction: true };
    }
  });

  return results;
};

const createInitialExamResults = (examSubjects, grades, initialExamResults) => {
  const predicted = buildPredictedExamResults(examSubjects, grades);
  const merged = { ...predicted };

  (examSubjects || []).forEach((exam) => {
    if (initialExamResults?.[exam.name]) {
      merged[exam.name] = initialExamResults[exam.name];
    }
  });

  return merged;
};

export default function ResultsDashboard({
  profile,
  coreSubjects,
  examSubjects,
  grades,
  initialExamResults = null,
  onBack,
  onResultCalculated
}) {
  const [examResults, setExamResults] = useState(() =>
    createInitialExamResults(examSubjects, grades, initialExamResults)
  );
  const [result, setResult] = useState(() =>
    calculateAbiturPrognose(
      grades,
      examSubjects,
      createInitialExamResults(examSubjects, grades, initialExamResults),
      coreSubjects,
      profile
    )
  );
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleExamResultChange = (subjectName, points) => {
    setExamResults(prev => ({
      ...prev,
      [subjectName]: { points: parseFloat(points), isPrediction: false }
    }));
    setHasPendingChanges(true);
  };

  const handleRecalculate = () => {
    const recalculated = calculateAbiturPrognose(
      grades,
      examSubjects,
      examResults,
      coreSubjects,
      profile
    );
    setResult(recalculated);
    setHasPendingChanges(false);
    if (onResultCalculated && recalculated) {
      onResultCalculated(recalculated, examResults);
    }
  };

  useEffect(() => {
    if (hasPendingChanges) return;
    if (onResultCalculated && result) {
      onResultCalculated(result, examResults);
    }
  }, [examResults, hasPendingChanges, onResultCalculated, result]);

  const examDetails = (examSubjects || []).map((exam) => {
    const current = examResults?.[exam.name] || { points: 0, isPrediction: true };
    return {
      subject: exam.name,
      examType: exam.examType,
      format: exam.format,
      points: current.points,
      weightedPoints: current.points * 5,
      isPrediction: current.isPrediction,
    };
  });

  const gradeBand = POINTS_TO_GRADE.find((entry) => entry.grade === result.finalGrade);

  // Calculate percentage
  const percentage = ((result.totalPoints / result.maxPossible) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-notion-bg py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="notion-btn notion-btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Rechner
          </button>
        </div>

        <div className="notion-card p-6 mb-6">
          <p className="notion-section-header mb-2">Detailansicht</p>
          <h1 className="text-2xl font-semibold text-notion-text mb-2">
            Deine Abiturprognose
          </h1>
          <p className="text-sm text-notion-text-secondary">
            Profil: <span className="font-medium text-notion-text">{profile.name}</span>
          </p>
        </div>

        {hasPendingChanges && (
          <div className="notion-card p-4 mb-6 bg-notion-warning-bg border border-notion-warning">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-notion-text">
                Änderungen an Prüfungsnoten sind noch nicht berechnet.
              </div>
              <button
                onClick={handleRecalculate}
                className="notion-btn notion-btn-primary"
              >
                Neu berechnen
              </button>
            </div>
          </div>
        )}

        <div className={`notion-card p-6 mb-6 ${result.passed ? 'bg-notion-success-bg' : 'bg-notion-error-bg'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8" />
              <div>
                <div className="text-xs uppercase tracking-wide text-notion-text-tertiary">Abiturnote</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-notion-text">
                  {result.finalGrade !== null ? result.finalGrade.toFixed(1) : '—'}
                  </span>
                  {gradeBand && (
                    <span className="text-xs text-notion-text-tertiary">
                      ({gradeBand.min}-{gradeBand.max} Punkte)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-notion-text-tertiary">Gesamtpunktzahl</div>
              <div className="text-2xl font-semibold text-notion-text">{result.totalPoints}</div>
              <div className="text-xs text-notion-text-tertiary">
                von {result.maxPossible} Punkten
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-notion-bg-tertiary rounded-full h-2 overflow-hidden">
              <div
                className="bg-notion-accent h-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-notion-text-tertiary mt-2 text-right">
              {percentage}% erreicht
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {result.passed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-notion-success" />
                <span className="font-medium text-notion-text">Abitur bestanden</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-notion-error" />
                <span className="font-medium text-notion-text">Abitur nicht bestanden</span>
              </>
            )}
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="notion-card p-5 mb-6 bg-notion-error-bg border border-notion-error">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-notion-error mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-notion-text mb-2">
                  Kritische Fehler
                </h3>
                <ul className="space-y-1">
                  {result.errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-notion-text">• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {result.warnings.length > 0 && (
          <div className="notion-card p-5 mb-6 bg-notion-warning-bg border border-notion-warning">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-notion-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-notion-text mb-2">
                  Warnungen
                </h3>
                <ul className="space-y-1">
                  {result.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-notion-text">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-notion-text">Block I</h2>
              <div className="text-right">
                <div className="text-2xl font-semibold text-notion-text">
                  {result.blockI.totalE}
                </div>
                <div className="text-xs text-notion-text-tertiary">von 600</div>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-notion-text-secondary">
              <div className="flex justify-between">
                <span>Eingebrachte Noten:</span>
                <span className="font-semibold text-notion-text">{result.blockI.gradeCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Summe (P):</span>
                <span className="font-semibold text-notion-text">{result.blockI.totalP}</span>
              </div>
              <div className="flex justify-between">
                <span>Anzahl (S):</span>
                <span className="font-semibold text-notion-text">{result.blockI.totalS}</span>
              </div>
              <div className="flex justify-between">
                <span>Noten unter 5 Punkten:</span>
                <span className="font-semibold text-notion-text">
                  {result.blockI.gradesUnder5} ({result.blockI.percentUnder5}%)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-notion-border">
              <details className="cursor-pointer">
                <summary className="text-sm font-semibold text-notion-accent">
                  Eingebrachte Noten anzeigen ({result.blockI.gradeCount})
                </summary>
                <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                  {result.blockI.selectedGrades.map((grade, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex justify-between items-center py-1 px-2 bg-notion-bg-secondary rounded"
                    >
                      <span className={grade.isPrediction ? 'text-notion-warning' : 'text-notion-text-secondary'}>
                        {grade.displayName}
                        {grade.isDouble && ' (2×)'}
                        {grade.isMandatory && ' (Pflicht)'}
                      </span>
                      <span className="font-semibold text-notion-text">{grade.points} P</span>
                    </div>
                  ))}
                </div>
              </details>
              <details className="cursor-pointer mt-3">
                <summary className="text-sm font-semibold text-notion-accent">
                  Nicht eingebrachte Noten anzeigen ({result.blockI.notSelectedGrades.length})
                </summary>
                <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                  {result.blockI.notSelectedGrades.length === 0 ? (
                    <div className="text-xs text-notion-text-tertiary py-1 px-2">
                      Keine weiteren Noten vorhanden.
                    </div>
                  ) : (
                    result.blockI.notSelectedGrades.map((grade, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex justify-between items-center py-1 px-2 bg-notion-bg-secondary rounded"
                      >
                        <span className={grade.isPrediction ? 'text-notion-warning' : 'text-notion-text-secondary'}>
                          {grade.displayName}
                          {grade.isDouble && ' (2x)'}
                          {grade.isMandatory && ' (Pflicht)'}
                        </span>
                        <span className="font-semibold text-notion-text">{grade.points} P</span>
                      </div>
                    ))
                  )}
                </div>
              </details>
            </div>
          </div>

          <div className="notion-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-notion-text">Block II</h2>
              <div className="text-right">
                <div className="text-2xl font-semibold text-notion-text">
                  {result.blockII.totalE}
                </div>
                <div className="text-xs text-notion-text-tertiary">von 300</div>
              </div>
            </div>

            <p className="text-sm text-notion-text-secondary mb-3">
              Prüfungsergebnisse (jeweils 5-fach gewichtet):
            </p>

            <div className="space-y-3">
              {examDetails.map((exam, idx) => (
                <div key={idx} className="border border-notion-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-notion-text">{exam.subject}</div>
                      <div className="text-xs text-notion-text-tertiary">
                        {exam.examType === 'schriftlich' ? 'Schriftlich' : `Mündlich (${exam.format})`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-notion-text">
                        {exam.weightedPoints}
                      </div>
                      <div className="text-xs text-notion-text-tertiary">({exam.points} × 5)</div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="text-xs text-notion-text-tertiary block mb-1">
                      Prognostizierte Punkte:
                    </label>
                    <select
                      value={exam.points}
                      onChange={(e) => handleExamResultChange(exam.subject, e.target.value)}
                      className="notion-input text-sm"
                    >
                      {Array.from({ length: 16 }, (_, i) => i).map((points) => (
                        <option key={points} value={points}>{points} Punkte</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="notion-card p-6 bg-notion-accent-bg border border-notion-accent">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-notion-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-notion-text mb-2">
                Optimierungshinweise
              </h3>
              <div className="text-sm text-notion-text-secondary space-y-2">
                <p>
                  <strong>Block I:</strong> Von {result.blockI.gradeCount + result.blockI.notSelectedGrades.length} verfügbaren
                  Semesternoten wurden die besten {result.blockI.gradeCount} eingebracht.
                </p>
                {result.blockI.notSelectedGrades.length > 0 && (
                  <p className="text-xs text-notion-text-tertiary">
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
