import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SemesterMatrix from './SemesterMatrix';
import ProfilePicker from './ProfilePicker';
import CoreSubjects from './CoreSubjects';
import ExamSubjects from './ExamSubjects';
import AdditionalSubjects from './AdditionalSubjects';
import { calculateAbiturPrognose } from '../../utils/abiturCalculation';

/**
 * AbiturWizard - Single-page wizard with progressive disclosure
 * Features:
 * - Fixed SemesterMatrix at top showing all selections
 * - Progressive sections that activate as user completes previous steps
 * - Smooth scroll between sections
 */
const createEmptyAdditionalSubjects = () => ({
  S1: [],
  S2: [],
  S3: [],
  S4: [],
});

const normalizeAdditionalSubjects = (value) => {
  if (!value) return createEmptyAdditionalSubjects();

  const list = Array.isArray(value) ? value : Object.values(value).flat();
  const unique = new Map();
  list.forEach((subject) => {
    if (subject?.name && !unique.has(subject.name)) {
      unique.set(subject.name, subject);
    }
  });
  const shared = Array.from(unique.values());

  return {
    S1: shared,
    S2: shared,
    S3: shared,
    S4: shared,
  };
};

const getAdditionalForSemester = (semesterKey, subjects) => {
  if (Array.isArray(subjects)) {
    return subjects;
  }
  if (subjects && Array.isArray(subjects[semesterKey])) {
    return subjects[semesterKey];
  }
  return [];
};

const pruneGrades = (currentGrades, profile, coreSubjects, additionalSubjects) => {
  const allowed = new Set();

  if (profile) {
    profile.profilgebend.forEach((fach) => fach?.name && allowed.add(fach.name));
    profile.profilbegleitend.forEach((fach) => fach?.name && allowed.add(fach.name));
  }

  if (coreSubjects) {
    if (coreSubjects.coreEA1) allowed.add(coreSubjects.coreEA1);
    if (coreSubjects.coreEA2) allowed.add(coreSubjects.coreEA2);
    if (coreSubjects.coreGA) allowed.add(coreSubjects.coreGA);
  }

  ['S1', 'S2', 'S3', 'S4'].forEach((semesterKey) => {
    getAdditionalForSemester(semesterKey, additionalSubjects).forEach((subject) => {
      if (subject?.name) {
        allowed.add(subject.name);
      }
    });
  });

  const nextGrades = {};
  allowed.forEach((name) => {
    if (currentGrades?.[name]) {
      nextGrades[name] = currentGrades[name];
    }
  });

  return nextGrades;
};

const areCoreSubjectsEqual = (a, b) => {
  if (!a || !b) return false;
  return a.coreEA1 === b.coreEA1 && a.coreEA2 === b.coreEA2 && a.coreGA === b.coreGA;
};

const normalizeExamSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return [];
  return [...subjects].sort((a, b) => (a?.position || 0) - (b?.position || 0));
};

const areExamSubjectsEqual = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  const left = normalizeExamSubjects(a);
  const right = normalizeExamSubjects(b);
  if (left.length !== right.length) return false;
  return left.every((item, index) => {
    const other = right[index];
    return item.name === other.name
      && item.examType === other.examType
      && item.level === other.level
      && item.format === other.format
      && item.position === other.position;
  });
};

export default function AbiturWizard({ onComplete, onShowDetails, initialData = null }) {
  // State
  const [selectedProfile, setSelectedProfile] = useState(initialData?.profile || null);
  const [coreSubjects, setCoreSubjects] = useState(initialData?.coreSubjects || null);
  const [examSubjects, setExamSubjects] = useState(initialData?.examSubjects || null);
  const [examResults, setExamResults] = useState(initialData?.examResults || {});
  const [additionalSubjects, setAdditionalSubjects] = useState(() =>
    normalizeAdditionalSubjects(initialData?.additionalSubjects)
  );
  const [additionalSubjectsValid, setAdditionalSubjectsValid] = useState(false);
  const [activeStep, setActiveStep] = useState('profile');
  const [grades, setGrades] = useState(initialData?.grades || {});
  const [calculationResult, setCalculationResult] = useState(initialData?.result || null);

  const createEmptySemesterGrade = () => ({
    points: '',
    isPrediction: false,
    isManual: false,
  });

  const createEmptySubjectGrades = () => ({
    S1: createEmptySemesterGrade(),
    S2: createEmptySemesterGrade(),
    S3: createEmptySemesterGrade(),
    S4: createEmptySemesterGrade(),
  });

  const parseGradePoints = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const buildPredictedExamResults = (subjects, grades) => {
    const results = {};

    (subjects || []).forEach((exam) => {
      const subjectGrades = grades?.[exam.name];
      if (subjectGrades) {
        const validGrades = ['S1', 'S2', 'S3', 'S4']
          .map((sem) => subjectGrades[sem])
          .filter((g) => g?.points !== '' && g?.points !== null && g?.points !== undefined)
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

  const resolvedExamResults = useMemo(() => {
    if (!examSubjects) return examResults;
    const predicted = buildPredictedExamResults(examSubjects, grades);
    const merged = { ...predicted };

    Object.entries(examResults || {}).forEach(([name, value]) => {
      if (value && value.points !== undefined && value.points !== null) {
        merged[name] = value;
      }
    });

    return merged;
  }, [examSubjects, grades, examResults]);

  const fillMissingGradesWithAverage = (currentGrades) => {
    const nextGrades = { ...currentGrades };

    Object.entries(currentGrades || {}).forEach(([subjectName, subjectGrades]) => {
      const s1Value = parseGradePoints(subjectGrades?.S1?.points);
      if (s1Value === null) return;

      const existingPoints = ['S1', 'S2', 'S3', 'S4']
        .map((semesterKey) => parseGradePoints(subjectGrades?.[semesterKey]?.points))
        .filter((value) => value !== null);

      if (existingPoints.length === 0) return;
      const avg = Math.round(
        existingPoints.reduce((sum, value) => sum + value, 0) / existingPoints.length
      );

      const nextSubjectGrades = {
        ...createEmptySubjectGrades(),
        ...subjectGrades
      };
      let changed = false;

      ['S1', 'S2', 'S3', 'S4'].forEach((semesterKey) => {
        const current = nextSubjectGrades[semesterKey] || createEmptySemesterGrade();
        if (current.points === '' || current.points === null || current.points === undefined) {
          nextSubjectGrades[semesterKey] = {
            points: avg,
            isPrediction: true,
            isManual: false
          };
          changed = true;
        }
      });

      if (changed) {
        nextGrades[subjectName] = nextSubjectGrades;
      }
    });

    return nextGrades;
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setCalculationResult(null);
    // Reset subsequent selections if profile changes
    if (selectedProfile?.id !== profile.id) {
      setCoreSubjects(null);
      setExamSubjects(null);
      setExamResults({});
      setAdditionalSubjects(createEmptyAdditionalSubjects());
      setAdditionalSubjectsValid(false);
      setGrades({});
    }
    setActiveStep('core');
  };

  const handleCoreSubjectsChange = useCallback((subjects) => {
    const changed = subjects
      ? !areCoreSubjectsEqual(coreSubjects, subjects)
      : coreSubjects !== null;

    if (changed) {
      setCoreSubjects(subjects);
      setExamSubjects(null);
      setExamResults({});
      setAdditionalSubjects(createEmptyAdditionalSubjects());
      setAdditionalSubjectsValid(false);
      setGrades({});
    }

    setCalculationResult(null);

    setActiveStep((prev) => {
      if (!subjects && prev !== 'profile') {
        return 'core';
      }
      if (subjects && prev === 'core') {
        return 'additional';
      }
      return prev;
    });
  }, [coreSubjects]);

  const handleExamSubjectsChange = useCallback((subjects) => {
    const nextSubjects = subjects || null;
    const changed = nextSubjects
      ? !areExamSubjectsEqual(examSubjects, nextSubjects)
      : examSubjects !== null;

    if (!changed) {
      return;
    }

    setExamSubjects(nextSubjects);
    setCalculationResult(null);
  }, [examSubjects]);

  const handleGradeChange = (semesterKey, subjectName, value) => {
    if (!semesterKey || !subjectName) return;
    setCalculationResult(null);
    setGrades((prev) => ({
      ...prev,
      [subjectName]: {
        ...(prev[subjectName] || createEmptySubjectGrades()),
        [semesterKey]: {
          points: value,
          isPrediction: false,
          isManual: true
        }
      }
    }));
  };

  const handleExamResultsChange = (subjectOrResults, value) => {
    setCalculationResult(null);
    if (typeof subjectOrResults === 'string') {
      const subjectName = subjectOrResults;
      if (!subjectName) return;
      if (value === '') {
        setExamResults((prev) => {
          const next = { ...prev };
          delete next[subjectName];
          return next;
        });
        return;
      }
      setExamResults((prev) => ({
        ...prev,
        [subjectName]: {
          points: parseFloat(value),
          isPrediction: false
        }
      }));
      return;
    }

    if (subjectOrResults) {
      setExamResults(subjectOrResults);
    } else {
      setExamResults({});
    }
  };

  const handleAdditionalSubjectsChange = useCallback((subjects, isValid) => {
    if (subjects) {
      const normalized = normalizeAdditionalSubjects(subjects);
      setAdditionalSubjects(normalized);
      setGrades((prev) => pruneGrades(prev, selectedProfile, coreSubjects, normalized));
    }
    setCalculationResult(null);
    setAdditionalSubjectsValid(!!isValid);
    if (!isValid) {
      setActiveStep((prev) => (prev === 'exam' ? 'additional' : prev));
    }
  }, [coreSubjects, selectedProfile]);

  const buildCalculationPayload = () => {
    if (!selectedProfile || !coreSubjects || !examSubjects || !additionalSubjectsValid) return null;

    const filledGrades = fillMissingGradesWithAverage(grades);
    setGrades(filledGrades);

    const result = calculateAbiturPrognose(
      filledGrades,
      examSubjects,
      resolvedExamResults,
      coreSubjects,
      selectedProfile
    );
    setCalculationResult(result);

    return {
      profile: selectedProfile,
      coreSubjects,
      examSubjects,
      additionalSubjects,
      examResults,
      grades: filledGrades,
      result
    };
  };

  const handleCalculate = () => {
    const payload = buildCalculationPayload();
    if (!payload) return;
    onComplete(payload);
  };

  const handleShowDetails = () => {
    const payload = buildCalculationPayload();
    if (!payload) return;
    onComplete(payload);
    if (onShowDetails) {
      onShowDetails(payload);
    }
  };

  // Can only proceed if all required fields are filled AND additionalSubjects validation passed
  const canCalculate = selectedProfile && coreSubjects && examSubjects && additionalSubjectsValid;

  const steps = useMemo(() => ([
    { key: 'profile', label: 'Profil', enabled: true },
    { key: 'core', label: 'Kernfächer', enabled: !!selectedProfile },
    { key: 'additional', label: 'Weitere Fächer', enabled: !!coreSubjects },
    { key: 'exam', label: 'Prüfungsfächer', enabled: !!coreSubjects && additionalSubjectsValid },
  ]), [selectedProfile, coreSubjects, additionalSubjectsValid]);

  const activeIndex = steps.findIndex((step) => step.key === activeStep);

  const resolvedActiveIndex = useMemo(() => {
    if (activeIndex === -1) {
      return steps.findIndex((step) => step.enabled);
    }

    for (let i = activeIndex; i >= 0; i -= 1) {
      if (steps[i].enabled) {
        return i;
      }
    }

    return steps.findIndex((step) => step.enabled);
  }, [activeIndex, steps]);

  const resolvedActiveStep = steps[resolvedActiveIndex]?.key || 'profile';

  const goToStep = (key) => {
    const step = steps.find((item) => item.key === key);
    if (step?.enabled) {
      setActiveStep(key);
    }
  };

  const goToPrevious = () => {
    if (resolvedActiveIndex > 0) {
      const prev = steps[resolvedActiveIndex - 1];
      if (prev.enabled) {
        setActiveStep(prev.key);
      }
    }
  };

  const goToNext = () => {
    if (resolvedActiveIndex < steps.length - 1) {
      const next = steps[resolvedActiveIndex + 1];
      if (next.enabled) {
        setActiveStep(next.key);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Header with SemesterMatrix */}
      <SemesterMatrix
        profile={selectedProfile}
        coreSubjects={coreSubjects}
        examSubjects={examSubjects}
        additionalSubjects={additionalSubjects}
        grades={grades}
        onGradesChange={handleGradeChange}
        examResults={resolvedExamResults}
        onExamResultsChange={handleExamResultsChange}
        calculationResult={calculationResult}
        onCalculate={handleCalculate}
        onShowDetails={handleShowDetails}
        canCalculate={canCalculate}
      />

      {/* Main Content - Horizontal Steps */}
      <div className="flex-1 min-h-0">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Step Navigation */}
          <div className="px-6 pt-4 pb-3 border-b border-notion-border bg-notion-bg">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={resolvedActiveIndex <= 0}
                className="notion-btn notion-btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Zurück
              </button>
              <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto">
                {steps.map((step) => (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => goToStep(step.key)}
                    disabled={!step.enabled}
                    className={`
                      notion-btn text-xs uppercase tracking-wider font-light
                      ${resolvedActiveStep === step.key ? 'notion-btn-primary' : 'notion-btn-secondary'}
                      ${!step.enabled ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={goToNext}
                disabled={resolvedActiveIndex >= steps.length - 1 || !steps[resolvedActiveIndex + 1]?.enabled}
                className="notion-btn notion-btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${resolvedActiveIndex * 100}%)` }}
            >
              <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                <ProfilePicker
                  selectedProfile={selectedProfile}
                  onSelectProfile={handleProfileSelect}
                />
              </div>
              <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                <CoreSubjects
                  profile={selectedProfile}
                  coreSubjects={coreSubjects}
                  onCoreSubjectsChange={handleCoreSubjectsChange}
                  isActive={!!selectedProfile}
                />
              </div>
              <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                <AdditionalSubjects
                  profile={selectedProfile}
                  coreSubjects={coreSubjects}
                  additionalSubjects={additionalSubjects}
                  onAdditionalSubjectsChange={handleAdditionalSubjectsChange}
                  isActive={!!coreSubjects}
                />
              </div>
              <div className="w-full flex-shrink-0 h-full overflow-y-auto">
                <ExamSubjects
                  key={`${selectedProfile?.id || 'profile'}-${coreSubjects?.coreEA1 || 'ea1'}-${coreSubjects?.coreEA2 || 'ea2'}-${coreSubjects?.coreGA || 'ga'}`}
                  profile={selectedProfile}
                  coreSubjects={coreSubjects}
                  additionalSubjects={additionalSubjects}
                  examSubjects={examSubjects}
                  onExamSubjectsChange={handleExamSubjectsChange}
                  isActive={additionalSubjectsValid}
                />
              </div>
            </div>
          </div>

          {/* Calculation handled in the result card inside the header */}
        </div>
      </div>
    </div>
  );
}
