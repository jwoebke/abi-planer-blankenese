import { useState, useEffect } from 'react';
import { Plus, X, Check, AlertCircle } from 'lucide-react';
import SubjectTag from '../ui/SubjectTag';

// Common additional subjects that students might want to take
const ADDITIONAL_SUBJECT_OPTIONS = [
  { name: 'Physik', level: 'gA' },
  { name: 'Chemie', level: 'gA' },
  { name: 'Biologie', level: 'gA' },
  { name: 'Informatik', level: 'gA' },
  { name: 'Geschichte', level: 'gA' },
  { name: 'Geographie', level: 'gA' },
  { name: 'PGW', level: 'gA' },
  { name: 'Wirtschaft', level: 'gA' },
  { name: 'Philosophie', level: 'gA' },
  { name: 'Religion', level: 'gA' },
  { name: 'Bildende Kunst', level: 'gA' },
  { name: 'Musik', level: 'gA' },
  { name: 'Theater', level: 'gA' },
  { name: 'Sport', level: 'gA' },
  { name: 'Spanisch', level: 'gA' },
  { name: 'Französisch', level: 'gA' },
  { name: 'Latein', level: 'gA' },
];

export default function AdditionalSubjects({
  profile,
  coreSubjects,
  examSubjects,
  additionalSubjects = [],
  onAdditionalSubjectsChange,
  isActive
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [validationStatus, setValidationStatus] = useState({ valid: false, message: '' });

  // Validate requirements whenever additionalSubjects change
  useEffect(() => {
    if (!profile || !isActive) return;

    const validation = validateBelegverpflichtungen();
    setValidationStatus(validation);

    // Notify parent about validation status
    if (validation.valid) {
      onAdditionalSubjectsChange(additionalSubjects);
    } else {
      onAdditionalSubjectsChange(null);
    }
  }, [additionalSubjects, profile, isActive]);

  // Get subjects that are already selected (profile, core, exam)
  const getAllocatedSubjects = () => {
    const allocated = new Set();

    if (profile) {
      profile.profilgebend.forEach(f => allocated.add(f.name));
      profile.profilbegleitend.forEach(f => allocated.add(f.name));
    }

    if (coreSubjects) {
      allocated.add(coreSubjects.coreEA1);
      allocated.add(coreSubjects.coreEA2);
      allocated.add(coreSubjects.coreGA);
    }

    // Include exam subjects
    if (examSubjects) {
      examSubjects.forEach(exam => allocated.add(exam.name));
    }

    additionalSubjects.forEach(s => allocated.add(s.name));

    return allocated;
  };

  // Check if Belegverpflichtungen are fulfilled
  const validateBelegverpflichtungen = () => {
    if (!profile) return { valid: false, message: '' };

    const allocatedSubjects = getAllocatedSubjects();
    const belegverpflichtungen = profile.belegverpflichtungen || [];

    // Parse requirements and check if they're met
    // This is a simplified validation - in reality you'd need more complex logic
    const requirements = [];

    belegverpflichtungen.forEach(requirement => {
      // Extract subject groups from requirement text
      if (requirement.includes('Philosophie oder Religion')) {
        const hasPhi = allocatedSubjects.has('Philosophie');
        const hasRel = allocatedSubjects.has('Religion');
        if (!hasPhi && !hasRel) {
          requirements.push({ met: false, text: 'Philosophie oder Religion fehlt' });
        } else {
          requirements.push({ met: true, text: 'Philosophie oder Religion' });
        }
      }
      else if (requirement.includes('Biologie oder Chemie oder Physik')) {
        const hasBio = allocatedSubjects.has('Biologie');
        const hasChe = allocatedSubjects.has('Chemie');
        const hasPhy = allocatedSubjects.has('Physik');
        if (!hasBio && !hasChe && !hasPhy) {
          requirements.push({ met: false, text: 'Eine Naturwissenschaft (Bio/Chemie/Physik) fehlt' });
        } else {
          requirements.push({ met: true, text: 'Naturwissenschaft' });
        }
      }
      else if (requirement.includes('Bildende Kunst oder Musik oder Theater')) {
        const hasArt = allocatedSubjects.has('Bildende Kunst');
        const hasMusic = allocatedSubjects.has('Musik');
        const hasTheatre = allocatedSubjects.has('Theater');
        if (!hasArt && !hasMusic && !hasTheatre) {
          requirements.push({ met: false, text: 'Ein künstlerisches Fach (Kunst/Musik/Theater) fehlt' });
        } else {
          requirements.push({ met: true, text: 'Künstlerisches Fach' });
        }
      }
      else if (requirement.includes('Geschichte oder Geographie oder Wirtschaft')) {
        const hasGes = allocatedSubjects.has('Geschichte');
        const hasGeo = allocatedSubjects.has('Geographie');
        const hasWirt = allocatedSubjects.has('Wirtschaft');
        if (!hasGes && !hasGeo && !hasWirt) {
          requirements.push({ met: false, text: 'Geschichte oder Geographie oder Wirtschaft fehlt' });
        } else {
          requirements.push({ met: true, text: 'Geschichte/Geographie/Wirtschaft' });
        }
      }
      else if (requirement.includes('Sport')) {
        if (!allocatedSubjects.has('Sport')) {
          requirements.push({ met: false, text: 'Sport fehlt' });
        } else {
          requirements.push({ met: true, text: 'Sport' });
        }
      }
    });

    const allMet = requirements.every(req => req.met);
    const unmetRequirements = requirements.filter(req => !req.met);

    return {
      valid: allMet,
      message: allMet
        ? 'Alle Belegverpflichtungen erfüllt'
        : `Fehlende Fächer: ${unmetRequirements.map(r => r.text).join(', ')}`,
      requirements
    };
  };

  const allocatedSubjects = getAllocatedSubjects();

  // Get available subjects (not yet selected)
  const availableSubjects = ADDITIONAL_SUBJECT_OPTIONS.filter(
    subject => !allocatedSubjects.has(subject.name)
  );

  const handleAddSubject = () => {
    if (!selectedSubject) return;

    const subject = ADDITIONAL_SUBJECT_OPTIONS.find(s => s.name === selectedSubject);
    if (!subject) return;

    onAdditionalSubjectsChange([...additionalSubjects, subject]);
    setSelectedSubject('');
    setShowAddDialog(false);
  };

  const handleRemoveSubject = (subjectName) => {
    onAdditionalSubjectsChange(
      additionalSubjects.filter(s => s.name !== subjectName)
    );
  };

  if (!isActive) {
    return (
      <section className="py-8 px-6 bg-notion-bg-secondary opacity-60">
        <div className="max-w-7xl mx-auto">
          <p className="notion-section-header">Schritt 4</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Weitere Fächer
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Wähle zuerst deine Prüfungsfächer aus.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-6 bg-notion-bg border-t border-notion-border">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="notion-section-header mb-2">Schritt 4</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Weitere Fächer ergänzen
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Füge die fehlenden Fächer hinzu, um alle Belegverpflichtungen zu erfüllen.
          </p>
        </div>

        {/* Belegverpflichtungen Info Box */}
        {profile?.belegverpflichtungen && (
          <div className="mb-6 p-4 bg-notion-accent-bg border border-notion-accent rounded-lg">
            <h4 className="text-sm font-semibold text-notion-text mb-2">
              Belegverpflichtungen für {profile.name}
            </h4>
            <ul className="text-sm text-notion-text-secondary space-y-1">
              {profile.belegverpflichtungen.map((requirement, idx) => {
                const reqStatus = validationStatus.requirements?.[idx];
                return (
                  <li key={idx} className="flex items-start gap-2">
                    {reqStatus?.met ? (
                      <Check className="w-4 h-4 text-notion-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-notion-error flex-shrink-0 mt-0.5" />
                    )}
                    <span className={reqStatus?.met ? 'text-notion-text-secondary' : 'text-notion-text font-medium'}>
                      {requirement}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Current Additional Subjects */}
        {additionalSubjects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-notion-text mb-3">
              Hinzugefügte Fächer
            </h3>
            <div className="flex flex-wrap gap-2">
              {additionalSubjects.map((subject, idx) => (
                <SubjectTag
                  key={idx}
                  name={subject.name}
                  level={subject.level}
                  removable={true}
                  onRemove={() => handleRemoveSubject(subject.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Button */}
        {availableSubjects.length > 0 && !showAddDialog && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="notion-btn notion-btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Fach hinzufügen
          </button>
        )}

        {/* Add Dialog */}
        {showAddDialog && availableSubjects.length > 0 && (
          <div className="notion-card p-5 max-w-md mt-4">
            <h4 className="text-sm font-semibold text-notion-text mb-4">
              Fach auswählen
            </h4>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="notion-input mb-4"
              autoFocus
            >
              <option value="">Wähle ein Fach</option>
              {availableSubjects.map(subject => (
                <option key={subject.name} value={subject.name}>
                  {subject.name} ({subject.level})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddSubject}
                disabled={!selectedSubject}
                className="notion-btn notion-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Hinzufügen
              </button>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedSubject('');
                }}
                className="notion-btn notion-btn-secondary"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* No more subjects available */}
        {availableSubjects.length === 0 && !showAddDialog && (
          <p className="text-sm text-notion-text-secondary italic">
            Alle verfügbaren Fächer wurden bereits ausgewählt.
          </p>
        )}

        {/* Validation Status */}
        <div className="mt-6">
          {!validationStatus.valid && validationStatus.message && (
            <div className="p-4 bg-notion-error-bg border border-notion-error rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-notion-error flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-notion-text mb-1">
                    Belegverpflichtungen nicht erfüllt
                  </p>
                  <p className="text-sm text-notion-text-secondary">
                    {validationStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {validationStatus.valid && (
            <div className="p-4 bg-notion-success-bg border border-notion-success rounded-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-notion-success flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-notion-text mb-1">
                    Alle Pflichtfächer belegt
                  </h4>
                  <p className="text-sm text-notion-text-secondary">
                    Du kannst nun mit der Noteneingabe fortfahren.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
