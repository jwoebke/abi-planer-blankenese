import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { CORE_SUBJECTS } from '../../data/profiles';

export default function CoreSubjects({ profile, coreSubjects, onCoreSubjectsChange, isActive }) {
  const [coreEA1, setCoreEA1] = useState(coreSubjects?.coreEA1 || '');
  const [coreEA2, setCoreEA2] = useState(coreSubjects?.coreEA2 || '');
  const [coreGA, setCoreGA] = useState(coreSubjects?.coreGA || '');
  const [errors, setErrors] = useState([]);

  // Determine available core subjects based on profile
  const availableCoreSubjects = profile?.id === 'kosmopolit'
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

  // Validate and update parent whenever values change
  useEffect(() => {
    const newErrors = [];

    // Check if all fields are filled
    if (!coreEA1 || !coreEA2 || !coreGA) {
      if (coreEA1 || coreEA2 || coreGA) {
        newErrors.push('Bitte wähle alle drei Kernfächer aus.');
      }
      setErrors(newErrors);
      onCoreSubjectsChange(null);
      return;
    }

    // Check for duplicates
    if (coreEA1 === coreEA2 || coreEA1 === coreGA || coreEA2 === coreGA) {
      newErrors.push('Jedes Kernfach darf nur einmal gewählt werden.');
      setErrors(newErrors);
      onCoreSubjectsChange(null);
      return;
    }

    // All valid
    setErrors([]);
    onCoreSubjectsChange({ coreEA1, coreEA2, coreGA });
  }, [coreEA1, coreEA2, coreGA, onCoreSubjectsChange]);

  const isSubjectDisabled = (subject, field) => {
    if (field === 'ea1') return subject === coreEA2 || subject === coreGA;
    if (field === 'ea2') return subject === coreEA1 || subject === coreGA;
    if (field === 'ga') return subject === coreEA1 || subject === coreEA2;
    return false;
  };

  const isComplete = coreEA1 && coreEA2 && coreGA && errors.length === 0;

  if (!isActive && !coreSubjects) {
    return (
      <section className="py-12 px-6 bg-notion-gray-50 opacity-50">
        <div className="max-w-7xl mx-auto">
          <div className="notion-section-header">Schritt 2</div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 mb-2">
            Kernfächer wählen
          </h2>
          <p className="text-sm text-notion-gray-400">
            Wähle zuerst ein Profil aus.
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
          <div className="notion-section-header">Schritt 2</div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 mb-2">
            Kernfächer wählen
          </h2>
          <p className="text-sm text-notion-gray-400">
            Wähle zwei Kernfächer auf erhöhtem Anforderungsniveau (eA) und ein Kernfach auf grundlegendem Niveau (gA).
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Core eA 1 */}
          <div>
            <label className="block text-sm font-medium text-notion-gray-700 mb-2">
              Kernfach 1 (eA)
            </label>
            <select
              value={coreEA1}
              onChange={(e) => setCoreEA1(e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableCoreSubjects.map(subject => (
                <option
                  key={subject}
                  value={subject}
                  disabled={isSubjectDisabled(subject, 'ea1')}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Core eA 2 */}
          <div>
            <label className="block text-sm font-medium text-notion-gray-700 mb-2">
              Kernfach 2 (eA)
            </label>
            <select
              value={coreEA2}
              onChange={(e) => setCoreEA2(e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableCoreSubjects.map(subject => (
                <option
                  key={subject}
                  value={subject}
                  disabled={isSubjectDisabled(subject, 'ea2')}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Core gA */}
          <div>
            <label className="block text-sm font-medium text-notion-gray-700 mb-2">
              Kernfach 3 (gA)
            </label>
            <select
              value={coreGA}
              onChange={(e) => setCoreGA(e.target.value)}
              className="notion-input"
            >
              <option value="">Wähle ein Fach</option>
              {availableCoreSubjects.map(subject => (
                <option
                  key={subject}
                  value={subject}
                  disabled={isSubjectDisabled(subject, 'ga')}
                >
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-notion-red-bg border border-notion-red rounded-md">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-notion-red flex-shrink-0" />
              <div>
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-notion-gray-900">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

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
                  Kernfächer ausgewählt
                </h4>
                <p className="text-xs text-notion-gray-600">
                  Scrolle nach unten, um deine Prüfungsfächer zu wählen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {profile?.kernfachBesonderheit && (
          <div className="mt-6 p-4 bg-notion-blue-bg border border-notion-blue rounded-md">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-notion-blue flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-notion-gray-900 mb-1">
                  Besonderheit für {profile.name}
                </h4>
                <p className="text-xs text-notion-gray-600">
                  {profile.kernfachBesonderheit}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
