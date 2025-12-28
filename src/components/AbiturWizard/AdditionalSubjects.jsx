import { useEffect, useMemo } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { SUBJECTS_BY_AUFGABENFELD, AUFGABENFELDER } from '../../data/profiles';
import SubjectTag from '../ui/SubjectTag';

const SEMESTERS = [
  { key: 'S1', label: 'Semester 1' },
  { key: 'S2', label: 'Semester 2' },
  { key: 'S3', label: 'Semester 3' },
  { key: 'S4', label: 'Semester 4' },
];

const ADDITIONAL_SUBJECT_OPTIONS = Array.from(
  new Set(
    Object.values(SUBJECTS_BY_AUFGABENFELD)
      .flat()
      .map((name) => name)
      .concat(['Sport'])
  )
).map((name) => ({
  name,
  level: 'gA',
}));

const AUFGABENFELD_LABELS = {
  [AUFGABENFELDER.SPRACHLICH_KUENSTLERISCH]: 'Sprachlich-künstlerisch',
  [AUFGABENFELDER.MATH_NATURWISS]: 'Mathematik/Naturwissenschaften',
  [AUFGABENFELDER.GESELLSCHAFTSWISS]: 'Gesellschaftswissenschaften',
  other: 'Sonstiges',
};

const AUFGABENFELD_ORDER = [
  AUFGABENFELDER.SPRACHLICH_KUENSTLERISCH,
  AUFGABENFELDER.MATH_NATURWISS,
  AUFGABENFELDER.GESELLSCHAFTSWISS,
  'other',
];

const getAufgabenfeldForSubject = (name) => {
  const entry = Object.entries(SUBJECTS_BY_AUFGABENFELD).find(([, subjects]) =>
    subjects.includes(name)
  );
  return entry ? entry[0] : 'other';
};

const normalizeAdditionalSubjects = (value) => {
  if (!value) return [];

  const list = Array.isArray(value) ? value : Object.values(value).flat();
  const unique = new Map();

  list.forEach((subject) => {
    if (subject?.name && !unique.has(subject.name)) {
      unique.set(subject.name, subject);
    }
  });

  return Array.from(unique.values());
};

const buildSharedSubjectsMap = (subjects) => ({
  S1: subjects,
  S2: subjects,
  S3: subjects,
  S4: subjects,
});

export default function AdditionalSubjects({
  profile,
  coreSubjects,
  additionalSubjects = {},
  onAdditionalSubjectsChange,
  isActive
}) {
  const selectedSubjects = useMemo(
    () => normalizeAdditionalSubjects(additionalSubjects),
    [additionalSubjects]
  );

  const baseUnavailableSubjects = useMemo(() => {
    const allocated = new Set();

    if (profile) {
      profile.profilgebend.forEach((fach) => fach?.name && allocated.add(fach.name));
      profile.profilbegleitend.forEach((fach) => fach?.name && allocated.add(fach.name));
    }

    if (coreSubjects) {
      if (coreSubjects.coreEA1) allocated.add(coreSubjects.coreEA1);
      if (coreSubjects.coreEA2) allocated.add(coreSubjects.coreEA2);
      if (coreSubjects.coreGA) allocated.add(coreSubjects.coreGA);
    }

    return allocated;
  }, [profile, coreSubjects]);

  const buildValidationStatus = (subjectsList) => {
    if (!profile) return { valid: false, message: '', requirements: [] };

    const belegverpflichtungen = profile.belegverpflichtungen || [];
    const resolveRequirement = (requirement, allocated, semesterSubjects) => {
      if (requirement.includes('Philosophie oder Religion')) {
        const hasPhi = allocated.has('Philosophie');
        const hasRel = allocated.has('Religion');
        return { met: hasPhi || hasRel, text: requirement };
      }
      if (requirement.includes('Biologie oder Chemie oder Physik')) {
        const hasBio = allocated.has('Biologie');
        const hasChe = allocated.has('Chemie');
        const hasPhy = allocated.has('Physik');
        return { met: hasBio || hasChe || hasPhy, text: requirement };
      }
      if (requirement.includes('Bildende Kunst oder Musik oder Theater')) {
        const hasArt = allocated.has('Bildende Kunst');
        const hasMusic = allocated.has('Musik');
        const hasTheatre = allocated.has('Theater');
        return { met: hasArt || hasMusic || hasTheatre, text: requirement };
      }
      if (requirement.includes('Geschichte oder Geographie oder Wirtschaft')) {
        const hasGes = allocated.has('Geschichte');
        const hasGeo = allocated.has('Geographie');
        const hasWirt = allocated.has('Wirtschaft');
        return { met: hasGes || hasGeo || hasWirt, text: requirement };
      }
      if (requirement.includes('Sport')) {
        return { met: allocated.has('Sport'), text: requirement };
      }
      if (requirement.toLowerCase().includes('beliebigen weiteren')) {
        const additionalCount = semesterSubjects.filter((subject) => subject?.name).length;
        return { met: additionalCount > 0, text: requirement };
      }

      return { met: true, text: requirement };
    };

    const semesters = SEMESTERS.reduce((acc, semester) => {
      const semesterSubjects = subjectsList || [];
      const allocatedSubjects = new Set(baseUnavailableSubjects);
      semesterSubjects.forEach((subject) => allocatedSubjects.add(subject.name));
      const requirements = belegverpflichtungen.map((requirement) =>
        resolveRequirement(requirement, allocatedSubjects, semesterSubjects)
      );
      acc[semester.key] = {
        valid: requirements.every((req) => req.met),
        requirements,
      };
      return acc;
    }, {});

    const allMet = SEMESTERS.every((semester) => semesters[semester.key]?.valid);
    const missingSemesters = SEMESTERS.filter((semester) => !semesters[semester.key]?.valid)
      .map((semester) => semester.label);

    return {
      valid: allMet,
      message: allMet
        ? 'Alle Belegverpflichtungen pro Semester erfüllt'
        : `Nicht erfüllt in: ${missingSemesters.join(', ')}`,
      requirements: belegverpflichtungen,
      semesters,
    };
  };

  const validationStatus = buildValidationStatus(selectedSubjects);

  useEffect(() => {
    if (!profile || !isActive) return;
    onAdditionalSubjectsChange(null, validationStatus.valid);
  }, [validationStatus.valid, profile, isActive, onAdditionalSubjectsChange]);

  const availableSubjects = useMemo(
    () =>
      ADDITIONAL_SUBJECT_OPTIONS.filter(
        (subject) => !baseUnavailableSubjects.has(subject.name)
      ),
    [baseUnavailableSubjects]
  );

  const groupedAvailableSubjects = useMemo(() => {
    const groups = AUFGABENFELD_ORDER.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});

    availableSubjects.forEach((subject) => {
      const groupKey = getAufgabenfeldForSubject(subject.name);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(subject);
    });

    return AUFGABENFELD_ORDER
      .filter((key) => groups[key]?.length)
      .map((key) => ({
        key,
        label: AUFGABENFELD_LABELS[key] || AUFGABENFELD_LABELS.other,
        subjects: groups[key],
      }));
  }, [availableSubjects]);

  const handleToggleSubject = (subjectName) => {
    if (!subjectName) return;

    const subject = ADDITIONAL_SUBJECT_OPTIONS.find((s) => s.name === subjectName);
    if (!subject) return;

    const alreadySelected = selectedSubjects.some((item) => item.name === subjectName);
    const nextList = alreadySelected
      ? selectedSubjects.filter((item) => item.name !== subjectName)
      : [...selectedSubjects, subject];

    const nextValidation = buildValidationStatus(nextList);
    onAdditionalSubjectsChange(buildSharedSubjectsMap(nextList), nextValidation.valid);
  };

  const handleRemoveSubject = (subjectName) => {
    if (!subjectName) return;

    const nextList = selectedSubjects.filter((subject) => subject.name !== subjectName);
    const nextValidation = buildValidationStatus(nextList);
    onAdditionalSubjectsChange(buildSharedSubjectsMap(nextList), nextValidation.valid);
  };

  if (!isActive) {
    return (
      <section className="py-8 px-6 bg-notion-bg-secondary opacity-60">
        <div className="max-w-7xl mx-auto">
          <p className="notion-section-header">Schritt 3</p>
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Weitere Fächer
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Wähle zuerst deine Kernfächer aus.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-6 bg-notion-bg border-t border-notion-border h-full">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <p className="notion-section-header mb-2">Schritt 3</p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-notion-text">
              Weitere Fächer ergänzen
            </h2>
            <span className="text-xs text-notion-text-secondary ml-auto">
              Gilt für alle Semester
            </span>
          </div>
          <p className="text-sm text-notion-text-secondary">
            Ergänze zusätzliche Fächer, die in allen vier Semestern belegt werden.
          </p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {/* Selected subjects */}
          <div className="notion-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-notion-text">
                Ausgewählte Fächer
              </h3>
              <span className="text-xs text-notion-text-secondary">
                Mit X entfernen
              </span>
            </div>
            {selectedSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subject) => (
                  <SubjectTag
                    key={subject.name}
                    name={subject.name}
                    level={subject.level}
                    removable={true}
                    onRemove={() => handleRemoveSubject(subject.name)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-notion-text-secondary">
                Noch keine weiteren Fächer ausgewählt.
              </p>
            )}
          </div>

          {/* Selection Panel + Requirements */}
          <div className="md:min-h-0 flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="notion-card p-5 md:max-h-[50vh] md:overflow-y-auto">
              <h3 className="text-sm font-semibold text-notion-text mb-3">
                Fächer auswählen
              </h3>
              {availableSubjects.length === 0 && (
                <p className="text-sm text-notion-text-secondary">
                  Für dieses Profil stehen keine weiteren Fächer zur Auswahl.
                </p>
              )}
              {availableSubjects.length > 0 && (
                <div className="flex flex-col gap-3">
                  {groupedAvailableSubjects.map((group) => (
                    <div key={group.key}>
                      <p className="text-xs uppercase tracking-wide text-notion-text-tertiary mb-2">
                        {group.label}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.subjects.map((subject) => {
                          const isSelected = selectedSubjects.some(
                            (item) => item.name === subject.name
                          );
                          return (
                            <button
                              key={subject.name}
                              type="button"
                              onClick={() => handleToggleSubject(subject.name)}
                              aria-pressed={isSelected}
                              className={`
                                notion-btn flex items-center justify-between gap-2
                                ${isSelected ? 'notion-btn-primary' : 'notion-btn-secondary'}
                              `}
                            >
                              <span className="text-sm">
                                {subject.name}
                              </span>
                              <span className={isSelected ? 'text-xs text-white/80' : 'text-xs text-notion-text-secondary'}>
                                {subject.level}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Belegverpflichtungen Info Box */}
            {profile?.belegverpflichtungen && (
              <div className="p-4 bg-notion-accent-bg border border-notion-accent rounded-lg h-fit">
                <h4 className="text-sm font-semibold text-notion-text mb-2">
                  Belegverpflichtungen für {profile.name}
                </h4>
                <p className="text-xs text-notion-text-secondary mb-2">
                  Pro Semester prüfen.
                </p>
                <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,1.25rem)] gap-x-2 gap-y-2 text-xs">
                  <div className="text-notion-text-tertiary uppercase tracking-wide">Fach</div>
                  {SEMESTERS.map((semester) => (
                    <div key={semester.key} className="text-notion-text-tertiary text-center">
                      {semester.key}
                    </div>
                  ))}
                  {validationStatus.requirements?.map((requirement, idx) => (
                    <div key={requirement} className="contents">
                      <div className="text-notion-text-secondary">
                        {requirement}
                      </div>
                      {SEMESTERS.map((semester) => {
                        const met = validationStatus.semesters?.[semester.key]?.requirements?.[idx]?.met;
                        return (
                          <div key={`${semester.key}-${requirement}`} className="flex justify-center">
                            {met ? (
                              <Check className="w-3.5 h-3.5 text-notion-success" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-notion-error" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {validationStatus.message && (
                  <div className="mt-3 flex items-start gap-2 text-xs">
                    {validationStatus.valid ? (
                      <Check className="w-4 h-4 text-notion-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-notion-error flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-notion-text-secondary">
                      {validationStatus.valid
                        ? 'Alle Belegverpflichtungen pro Semester erfüllt. Du kannst weitere Fächer ergänzen.'
                        : validationStatus.message}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
