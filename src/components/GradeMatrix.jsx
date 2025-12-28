import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, RefreshCw, Save } from 'lucide-react';
import { POINTS_SCALE } from '../data/profiles';

export default function GradeMatrix({ profile, coreSubjects, examSubjects, onComplete, onBack }) {
  // Combine all subjects
  const allSubjects = [
    { name: coreSubjects.coreEA1, level: 'eA', role: 'Kernfach', isExam: examSubjects.some(e => e.name === coreSubjects.coreEA1) },
    { name: coreSubjects.coreEA2, level: 'eA', role: 'Kernfach', isExam: examSubjects.some(e => e.name === coreSubjects.coreEA2) },
    { name: coreSubjects.coreGA, level: 'gA', role: 'Kernfach', isExam: examSubjects.some(e => e.name === coreSubjects.coreGA) },
    ...profile.profilgebend.map(f => ({
      name: f.name,
      level: f.level,
      role: 'Profilgebend',
      isExam: examSubjects.some(e => e.name === f.name)
    })),
    ...profile.profilbegleitend.map(f => ({
      name: f.name,
      level: f.level,
      role: 'Profilbegleitend',
      isExam: examSubjects.some(e => e.name === f.name)
    })),
  ];

  // Remove duplicates
  const uniqueSubjects = allSubjects.filter((subject, index, self) =>
    index === self.findIndex(s => s.name === subject.name)
  );

  // Initialize grades state
  const [grades, setGrades] = useState(() => {
    const initialGrades = {};
    uniqueSubjects.forEach(subject => {
      initialGrades[subject.name] = {
        S1: { points: '', isPrediction: false, isManual: false },
        S2: { points: '', isPrediction: false, isManual: false },
        S3: { points: '', isPrediction: false, isManual: false },
        S4: { points: '', isPrediction: false, isManual: false },
      };
    });
    return initialGrades;
  });

  const [predictionMode, setPredictionMode] = useState({}); // Track which subjects use auto-prediction

  // Calculate average for prediction
  const calculateAverage = (subjectName) => {
    const subjectGrades = grades[subjectName];
    const actualGrades = ['S1', 'S2', 'S3', 'S4']
      .map(sem => subjectGrades[sem])
      .filter(g => g.points !== '' && !g.isPrediction)
      .map(g => parseFloat(g.points));

    if (actualGrades.length === 0) return null;

    const avg = actualGrades.reduce((sum, p) => sum + p, 0) / actualGrades.length;
    return Math.round(avg);
  };

  // Apply prediction for a subject
  const applyPrediction = (subjectName) => {
    const avg = calculateAverage(subjectName);
    if (avg === null) return;

    setGrades(prev => {
      const newGrades = { ...prev };
      ['S1', 'S2', 'S3', 'S4'].forEach(sem => {
        if (newGrades[subjectName][sem].points === '' || newGrades[subjectName][sem].isPrediction) {
          newGrades[subjectName][sem] = {
            points: avg,
            isPrediction: true,
            isManual: false
          };
        }
      });
      return newGrades;
    });

    setPredictionMode(prev => ({ ...prev, [subjectName]: true }));
  };

  // Clear predictions for a subject
  const clearPredictions = (subjectName) => {
    setGrades(prev => {
      const newGrades = { ...prev };
      ['S1', 'S2', 'S3', 'S4'].forEach(sem => {
        if (newGrades[subjectName][sem].isPrediction) {
          newGrades[subjectName][sem] = {
            points: '',
            isPrediction: false,
            isManual: false
          };
        }
      });
      return newGrades;
    });

    setPredictionMode(prev => {
      const newMode = { ...prev };
      delete newMode[subjectName];
      return newMode;
    });
  };

  const handleGradeChange = (subjectName, semester, value) => {
    setGrades(prev => ({
      ...prev,
      [subjectName]: {
        ...prev[subjectName],
        [semester]: {
          points: value,
          isPrediction: false,
          isManual: true
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(grades);
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    let totalPoints = 0;
    let totalGrades = 0;

    Object.keys(grades).forEach(subjectName => {
      ['S1', 'S2', 'S3', 'S4'].forEach(sem => {
        const grade = grades[subjectName][sem];
        if (grade.points !== '') {
          totalPoints += parseFloat(grade.points);
          totalGrades++;
        }
      });
    });

    return {
      totalGrades,
      averagePoints: totalGrades > 0 ? (totalPoints / totalGrades).toFixed(2) : 0,
      totalPoints
    };
  };

  const summary = calculateSummary();

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
            Zurück
          </button>

          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Noten eingeben
            </h1>
            <p className="text-slate-600">
              Erfasse deine Noten für die Semester 1-4. Du kannst echte Noten eingeben oder Prognosen nutzen.
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Eingegebene Noten</div>
                <div className="text-3xl font-bold">{summary.totalGrades}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Durchschnitt</div>
                <div className="text-3xl font-bold">{summary.averagePoints} Punkte</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Gesamtpunkte</div>
                <div className="text-3xl font-bold">{summary.totalPoints}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10">
                      Fach
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-semibold text-slate-900">
                      Niveau
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-semibold text-slate-900">
                      S1
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-semibold text-slate-900">
                      S2
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-semibold text-slate-900">
                      S3
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-semibold text-slate-900">
                      S4
                    </th>
                    <th className="px-3 py-4 text-center text-sm font-semibold text-slate-900">
                      Ø
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {uniqueSubjects.map((subject) => {
                    const avg = calculateAverage(subject.name);
                    const hasGrades = ['S1', 'S2', 'S3', 'S4'].some(sem =>
                      grades[subject.name][sem].points !== '' && !grades[subject.name][sem].isPrediction
                    );

                    return (
                      <tr key={subject.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            {subject.name}
                            {subject.isExam && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                                Prüfung
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{subject.role}</div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            subject.level === 'eA'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {subject.level}
                          </span>
                        </td>
                        {['S1', 'S2', 'S3', 'S4'].map((sem) => (
                          <td key={sem} className="px-3 py-4">
                            <select
                              value={grades[subject.name][sem].points}
                              onChange={(e) => handleGradeChange(subject.name, sem, e.target.value)}
                              className={`w-full px-2 py-1.5 text-center border rounded transition-all ${
                                grades[subject.name][sem].isPrediction
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-white border-slate-300 text-slate-900'
                              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            >
                              <option value="">-</option>
                              {POINTS_SCALE.map(points => (
                                <option key={points} value={points}>{points}</option>
                              ))}
                            </select>
                          </td>
                        ))}
                        <td className="px-3 py-4 text-center text-sm font-semibold text-slate-700">
                          {avg !== null ? avg : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            {!predictionMode[subject.name] && hasGrades ? (
                              <button
                                type="button"
                                onClick={() => applyPrediction(subject.name)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                title="Prognose aus Durchschnitt"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                Prognose
                              </button>
                            ) : predictionMode[subject.name] ? (
                              <button
                                type="button"
                                onClick={() => clearPredictions(subject.name)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                title="Prognose löschen"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Zurücksetzen
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info and Submit */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Tipps zur Eingabe
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Gib zunächst deine bereits erzielten Noten ein</li>
                  <li>• Nutze "Prognose" um fehlende Noten basierend auf deinem Durchschnitt zu schätzen</li>
                  <li>• Prognose-Noten sind gelb markiert und können jederzeit angepasst werden</li>
                  <li>• Die Punkteskala reicht von 0 (ungenügend) bis 15 (sehr gut)</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ Wichtig
                </h4>
                <p className="text-sm text-amber-800">
                  Du beginnst bereits im ersten Semester Noten für dein Abitur zu sammeln!
                  Alle hier eingegebenen Noten fließen potenziell in deine Abiturnote ein.
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="w-5 h-5" />
                Zur Berechnung
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
