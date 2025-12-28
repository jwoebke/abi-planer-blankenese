import { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { CORE_SUBJECTS } from '../../data/profiles';

export default function CoreSubjects({ profile, coreSubjects, onCoreSubjectsChange, isActive }) {
  const [coreEA1, setCoreEA1] = useState(coreSubjects?.coreEA1 || '');
  const [coreEA2, setCoreEA2] = useState(coreSubjects?.coreEA2 || '');
  const [coreGA, setCoreGA] = useState(coreSubjects?.coreGA || '');

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

  const validation = useMemo(() => {
    const newErrors = [];
    const anySelected = coreEA1 || coreEA2 || coreGA;

    if (!coreEA1 || !coreEA2 || !coreGA) {
      if (anySelected) {
        newErrors.push('Bitte wähle alle drei Kernfächer aus.');
      }
      return { errors: newErrors, isValid: false };
    }

    if (coreEA1 === coreEA2 || coreEA1 === coreGA || coreEA2 === coreGA) {
      newErrors.push('Jedes Kernfach darf nur einmal gewählt werden.');
      return { errors: newErrors, isValid: false };
    }

    return { errors: [], isValid: true };
  }, [coreEA1, coreEA2, coreGA]);

  useEffect(() => {
    if (validation.isValid) {
      onCoreSubjectsChange({ coreEA1, coreEA2, coreGA });
    } else {
      onCoreSubjectsChange(null);
    }
  }, [coreEA1, coreEA2, coreGA, onCoreSubjectsChange, validation.isValid]);

  const isSubjectDisabled = (subject, field) => {
    if (field === 'ea1') return subject === coreEA2 || subject === coreGA;
    if (field === 'ea2') return subject === coreEA1 || subject === coreGA;
    if (field === 'ga') return subject === coreEA1 || subject === coreEA2;
    return false;
  };

  const errors = validation.errors;
  const isComplete = validation.isValid;

  if (!isActive && !coreSubjects) {
    return (
      <section className="py-8 px-6 bg-notion-bg-secondary opacity-60">
        <div className="max-w-7xl mx-auto">
          <p className="notion-section-header">Schritt 2</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Kernfächer wählen
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Wähle zuerst ein Profil aus.
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
          <p className="notion-section-header mb-2">Schritt 2</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Kernfächer wählen
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Wähle zwei Kernfächer auf erhöhtem Anforderungsniveau (eA) und ein Kernfach auf grundlegendem Niveau (gA).
          </p>
        </div>

        {/* Dropdowns in einem Card-Container */}
        <div className="notion-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core eA 1 */}
            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                1. Kernfach (eA)
              </label>
              <select
                value={coreEA1}
                onChange={(e) => setCoreEA1(e.target.value)}
                className="notion-input"
              >
                <option value="">Bitte wählen...</option>
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
              <label className="block text-sm font-medium text-notion-text mb-2">
                2. Kernfach (eA)
              </label>
              <select
                value={coreEA2}
                onChange={(e) => setCoreEA2(e.target.value)}
                className="notion-input"
              >
                <option value="">Bitte wählen...</option>
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
              <label className="block text-sm font-medium text-notion-text mb-2">
                3. Kernfach (gA)
              </label>
              <select
                value={coreGA}
                onChange={(e) => setCoreGA(e.target.value)}
                className="notion-input"
              >
                <option value="">Bitte wählen...</option>
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
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-notion-error-bg border border-notion-error rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-notion-error flex-shrink-0" />
              <div>
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-notion-text">
                    {error}
                  </p>
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
                  Kernfächer ausgewählt
                </h4>
                <p className="text-sm text-notion-text-secondary">
                  Wechsle zu den weiteren Fächern.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        {profile?.kernfachBesonderheit && (
          <div className="mt-4 p-4 bg-notion-accent-bg border border-notion-accent rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-notion-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-notion-text mb-1">
                  Besonderheit für {profile.name}
                </h4>
                <p className="text-sm text-notion-text-secondary">
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
