import { useState } from 'react';
import { CORE_SUBJECTS } from '../data/profiles';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function CoreSubjectSelector({ profile, onComplete, onBack }) {
  const [coreEA1, setCoreEA1] = useState('');
  const [coreEA2, setCoreEA2] = useState('');
  const [coreGA, setCoreGA] = useState('');

  // Determine available core subjects based on profile
  const availableCoreSubjects = profile.id === 'kosmopolit'
    ? [
        CORE_SUBJECTS.DEUTSCH,
        CORE_SUBJECTS.MATHEMATIK,
        CORE_SUBJECTS.ENGLISCH,
        CORE_SUBJECTS.SPANISCH,
        CORE_SUBJECTS.FRANZÖSISCH,
      ]
    : [
        CORE_SUBJECTS.DEUTSCH,
        CORE_SUBJECTS.MATHEMATIK,
        CORE_SUBJECTS.ENGLISCH,
      ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!coreEA1 || !coreEA2 || !coreGA) {
      alert('Bitte wähle alle drei Kernfächer aus.');
      return;
    }

    if (coreEA1 === coreEA2 || coreEA1 === coreGA || coreEA2 === coreGA) {
      alert('Jedes Kernfach darf nur einmal gewählt werden.');
      return;
    }

    onComplete({ coreEA1, coreEA2, coreGA });
  };

  const isSubjectDisabled = (subject, field) => {
    if (field === 'ea1') return subject === coreEA2 || subject === coreGA;
    if (field === 'ea2') return subject === coreEA1 || subject === coreGA;
    if (field === 'ga') return subject === coreEA1 || subject === coreEA2;
    return false;
  };

  const canProceed = coreEA1 && coreEA2 && coreGA &&
    coreEA1 !== coreEA2 && coreEA1 !== coreGA && coreEA2 !== coreGA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück zur Profilwahl
          </button>

          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Kernfächer wählen
            </h1>
            <p className="text-slate-600">
              Profil: <span className="font-semibold text-slate-900">{profile.name}</span>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Wichtige Regel
              </h3>
              <p className="text-sm text-blue-800">
                Du musst <strong>zwei Kernfächer auf erhöhtem Anforderungsniveau (eA)</strong> und
                <strong> eines auf grundlegendem Niveau (gA)</strong> belegen.
                Alle drei Kernfächer werden über alle 4 Semester belegt und fließen
                verpflichtend ins Abitur ein.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* First eA Core Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                1. Kernfach (erhöhtes Anforderungsniveau - eA)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableCoreSubjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setCoreEA1(subject)}
                    disabled={isSubjectDisabled(subject, 'ea1')}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${coreEA1 === subject
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : isSubjectDisabled(subject, 'ea1')
                        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className="font-medium">{subject}</div>
                    <div className="text-xs mt-1 opacity-75">4 Stunden/Woche</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Second eA Core Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                2. Kernfach (erhöhtes Anforderungsniveau - eA)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableCoreSubjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setCoreEA2(subject)}
                    disabled={isSubjectDisabled(subject, 'ea2')}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${coreEA2 === subject
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : isSubjectDisabled(subject, 'ea2')
                        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className="font-medium">{subject}</div>
                    <div className="text-xs mt-1 opacity-75">4 Stunden/Woche</div>
                  </button>
                ))}
              </div>
            </div>

            {/* gA Core Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                3. Kernfach (grundlegendes Anforderungsniveau - gA)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableCoreSubjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setCoreGA(subject)}
                    disabled={isSubjectDisabled(subject, 'ga')}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${coreGA === subject
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : isSubjectDisabled(subject, 'ga')
                        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-green-300'
                      }
                    `}
                  >
                    <div className="font-medium">{subject}</div>
                    <div className="text-xs mt-1 opacity-75">4 Stunden/Woche</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Note for Kosmopolit */}
            {profile.id === 'kosmopolit' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>Besonderheit im Profil Kosmopolit:</strong> Du kannst Spanisch oder
                  Französisch anstatt Englisch als Kernfach wählen. Englisch muss dann zwar
                  weiterhin über alle 4 Semester belegt werden, aber nicht zwingend ins Abitur
                  eingebracht werden.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!canProceed}
              className={`
                flex items-center px-6 py-3 rounded-lg font-semibold transition-all
                ${canProceed
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              Weiter
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
