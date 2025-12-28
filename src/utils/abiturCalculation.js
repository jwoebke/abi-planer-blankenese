import { POINTS_TO_GRADE } from '../data/profiles';

/**
 * Calculates Block I (Semester grades) with optimization algorithm
 * Based on Hamburg Abitur rules from the Wegweiser
 */

const MUSIC_REQUIREMENT_SUBJECTS = new Set([
  'Bildende Kunst',
  'Musik',
  'Theater',
  'Theater (englisch bilingual)',
  'Bildende Kunst oder Musik',
]);

const MUSIC_PRACTICAL_SUBJECTS = new Set([
  'Orchester',
  'Chor',
  'Popchor',
  'Bigband',
]);

const normalizeMusicRequirementName = (name) => {
  if (name === 'Theater (englisch bilingual)') return 'Theater';
  if (name === 'Bildende Kunst oder Musik') return 'Bildende Kunst';
  return name;
};

/**
 * Determines if a subject/semester combination must be included in Block I
 */
function isMandatoryGrade(subjectName, semester, examSubjects, coreSubjects, mandatorySubjects) {
  // Rule 1: All exam subjects (all 4 semesters)
  const isExamSubject = examSubjects.some(exam => exam.name === subjectName);
  if (isExamSubject) return true;

  // Rule 2: All core subjects (all 4 semesters)
  const isCoreSubject = [
    coreSubjects.coreEA1,
    coreSubjects.coreEA2,
    coreSubjects.coreGA
  ].includes(subjectName);
  if (isCoreSubject) return true;

  if (mandatorySubjects?.has(subjectName)) return true;

  // Note: Rules for Kunst/Musik/Theater, GesWi, NatWi are handled at subject level
  // We need at least one, but specific semesters are not mandatory
  return false;
}

/**
 * Determines if a subject gets double weighting in Block I
 */
function isDoubleWeighted(subjectName, examSubjects, coreSubjects, profile) {
  // Rule 1: Profilgebendes Prüfungsfach
  const profilgebendeFaecher = profile.profilgebend.map(f => f.name);
  const isProfilgebendExam = profilgebendeFaecher.includes(subjectName) &&
    examSubjects.some(exam => exam.name === subjectName);

  if (isProfilgebendExam) return true;

  // Rule 2: Schriftliches eA-Kernfach
  const isEACore = (subjectName === coreSubjects.coreEA1 || subjectName === coreSubjects.coreEA2);
  const isSchriftlichExam = examSubjects.some(exam =>
    exam.name === subjectName && exam.examType === 'schriftlich'
  );

  if (isEACore && isSchriftlichExam) return true;

  return false;
}

/**
 * Prepares all grades with metadata for calculation
 */
function prepareGradesForCalculation(grades, examSubjects, coreSubjects, profile, mandatorySubjects) {
  const allGrades = [];

  Object.keys(grades).forEach(subjectName => {
    const subjectGrades = grades[subjectName];
    const isDouble = isDoubleWeighted(subjectName, examSubjects, coreSubjects, profile);
    const isMusicPractical = MUSIC_PRACTICAL_SUBJECTS.has(subjectName);

    ['S1', 'S2', 'S3', 'S4'].forEach(semester => {
      const grade = subjectGrades?.[semester];
      if (!grade) return;

      const points = parseFloat(grade.points);
      if (grade.points === '' || !Number.isFinite(points)) return;

      allGrades.push({
        subject: subjectName,
        semester,
        points,
        isPrediction: grade.isPrediction,
        isMandatory: isMandatoryGrade(subjectName, semester, examSubjects, coreSubjects, mandatorySubjects),
        isDouble,
        isMusicPractical,
        // For display purposes
        displayName: `${subjectName} ${semester}`
      });
    });
  });

  return allGrades;
}

function findBestMusicRequirementSubject(grades) {
  const candidates = [];

  Object.entries(grades || {}).forEach(([subjectName, subjectGrades]) => {
    if (!subjectGrades) return;
    const normalized = normalizeMusicRequirementName(subjectName);
    if (!MUSIC_REQUIREMENT_SUBJECTS.has(subjectName) && !MUSIC_REQUIREMENT_SUBJECTS.has(normalized)) {
      return;
    }

    const semesterPoints = ['S1', 'S2', 'S3', 'S4']
      .map((semester) => subjectGrades?.[semester]?.points)
      .filter((value) => value !== '' && value !== null && value !== undefined)
      .map((value) => parseFloat(value))
      .filter((value) => Number.isFinite(value));

    if (semesterPoints.length === 0) return;

    const avg = semesterPoints.reduce((sum, value) => sum + value, 0) / semesterPoints.length;
    candidates.push({
      subject: subjectName,
      avg,
      count: semesterPoints.length
    });
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.avg - a.avg);
  return candidates[0];
}

/**
 * Calculates E (result) for Block I using the formula: E = P × 40 / S
 */
function calculateE(selectedGrades) {
  // P = Sum of all points including double weighted ones
  const P = selectedGrades.reduce((sum, g) =>
    sum + (g.isDouble ? g.points * 2 : g.points), 0
  );

  // S = Count of all grades including double weighted ones
  const S = selectedGrades.reduce((count, g) =>
    count + (g.isDouble ? 2 : 1), 0
  );

  if (S === 0) return 0;

  return (P * 40) / S;
}

/**
 * Main optimization algorithm for Block I
 * Implements the greedy algorithm suggested by Gemini
 */
export function calculateOptimalBlockI(grades, examSubjects, coreSubjects, profile) {
  const bestMusicSubject = findBestMusicRequirementSubject(grades);
  const mandatorySubjects = new Set();
  if (bestMusicSubject?.subject) {
    mandatorySubjects.add(bestMusicSubject.subject);
  }

  // Step 1: Prepare all grades with metadata
  const allGrades = prepareGradesForCalculation(grades, examSubjects, coreSubjects, profile, mandatorySubjects);

  // Step 2: Separate mandatory from optional grades
  const mandatoryGrades = allGrades.filter(g => g.isMandatory);
  let optionalPractical = allGrades.filter(g => !g.isMandatory && g.isMusicPractical);
  let optionalNonPractical = allGrades.filter(g => !g.isMandatory && !g.isMusicPractical);

  // Step 3: Sort optional grades descending by points
  optionalNonPractical.sort((a, b) => b.points - a.points);
  optionalPractical.sort((a, b) => b.points - a.points);

  // Step 4: Start with mandatory grades
  let currentSelection = [...mandatoryGrades];

  // Step 5: Fill up to minimum of 32 grades
  while (currentSelection.length < 32 && optionalNonPractical.length > 0) {
    currentSelection.push(optionalNonPractical.shift());
  }

  // Step 6: Calculate initial E
  let bestE = calculateE(currentSelection);
  let finalSelection = [...currentSelection];

  // Step 7: Iteratively try adding more grades (up to max 40)
  const combinedOptional = [...optionalNonPractical, ...optionalPractical].sort(
    (a, b) => b.points - a.points
  );
  let practicalCount = currentSelection.filter((grade) => grade.isMusicPractical).length;

  while (currentSelection.length < 40 && combinedOptional.length > 0) {
    const nextGrade = combinedOptional.shift();
    if (nextGrade.isMusicPractical && practicalCount >= 3) {
      continue;
    }
    const tempSelection = [...currentSelection, nextGrade];
    const newE = calculateE(tempSelection);

    if (newE > bestE) {
      bestE = newE;
      currentSelection = tempSelection;
      finalSelection = [...tempSelection];
      if (nextGrade.isMusicPractical) {
        practicalCount += 1;
      }
    } else {
      // If adding this grade doesn't improve E, stop
      break;
    }
  }

  // Calculate final statistics
  const P = finalSelection.reduce((sum, g) =>
    sum + (g.isDouble ? g.points * 2 : g.points), 0
  );
  const S = finalSelection.reduce((count, g) =>
    count + (g.isDouble ? 2 : 1), 0
  );

  // Count grades under 5 points
  const gradesUnder5 = finalSelection.filter(g => g.points < 5).length;
  const percentUnder5 = finalSelection.length
    ? (gradesUnder5 / finalSelection.length) * 100
    : 0;

  // Validation checks
  const warnings = [];
  const errors = [];

  if (Math.round(bestE) < 200) {
    errors.push('Block I: Weniger als 200 Punkte (nicht bestanden)');
  }

  if (percentUnder5 > 20) {
    errors.push(`Block I: Mehr als 20% der Noten unter 5 Punkten (${Math.round(percentUnder5)}%)`);
  }

  if (finalSelection.some(g => g.points === 0)) {
    errors.push('Block I: Noten mit 0 Punkten können nicht eingebracht werden');
  }

  if (Math.round(bestE) < 250 && Math.round(bestE) >= 200) {
    warnings.push('Block I: Knapp über der Mindestpunktzahl. Verbesserung empfohlen.');
  }

  if (!bestMusicSubject) {
    errors.push('Block I: Es müssen 4 Semesternoten in Bildende Kunst, Musik oder Theater eingebracht werden.');
  } else if (bestMusicSubject.count < 4) {
    errors.push(`Block I: ${bestMusicSubject.subject} muss in allen 4 Semestern eingebracht werden.`);
  }

  return {
    totalE: Math.round(bestE),
    totalP: Math.round(P),
    totalS: S,
    gradeCount: finalSelection.length,
    selectedGrades: finalSelection,
    notSelectedGrades: allGrades.filter(g =>
      !finalSelection.some(f => f.subject === g.subject && f.semester === g.semester)
    ),
    gradesUnder5,
    percentUnder5: Math.round(percentUnder5),
    warnings,
    errors,
    maxPossible: 600
  };
}

/**
 * Calculates Block II (Exam results)
 */
export function calculateBlockII(examSubjects, examResults) {
  // Each exam counts 5x: E = 5 × (PF1 + PF2 + PF3 + PF4)
  let totalPoints = 0;
  const examDetails = [];

  examSubjects.forEach((exam) => {
    const result = examResults?.[exam.name] || { points: 0, isPrediction: true };
    const weighted = result.points * 5;

    examDetails.push({
      subject: exam.name,
      examType: exam.examType,
      format: exam.format,
      points: result.points,
      weightedPoints: weighted,
      isPrediction: result.isPrediction
    });

    totalPoints += weighted;
  });

  // Validation
  const errors = [];
  const warnings = [];

  if (totalPoints < 100) {
    errors.push('Block II: Weniger als 100 Punkte (nicht bestanden)');
  }

  // Check: At least 5 points in two exams (one must be eA)
  const examsWithMin5 = examDetails.filter(e => e.points >= 5);
  if (examsWithMin5.length < 2) {
    errors.push('Block II: Mindestens zwei Prüfungen müssen mind. 5 Punkte erreichen');
  }

  // Check: At least one exam with 0 points = failed
  if (examDetails.some(e => e.points === 0)) {
    errors.push('Block II: Eine Prüfung mit 0 Punkten = Abitur nicht bestanden');
  }

  if (totalPoints < 125 && totalPoints >= 100) {
    warnings.push('Block II: Knapp über der Mindestpunktzahl. Mehr Vorbereitung empfohlen.');
  }

  return {
    totalE: totalPoints,
    examDetails,
    errors,
    warnings,
    maxPossible: 300
  };
}

/**
 * Calculates total Gesamtqualifikation and final Abitur grade
 */
export function calculateGesamtqualifikation(blockI, blockII) {
  const totalPoints = blockI.totalE + blockII.totalE;
  const maxPossible = 900;

  // Find corresponding grade
  let finalGrade = null;
  for (const entry of POINTS_TO_GRADE) {
    if (totalPoints >= entry.min && totalPoints <= entry.max) {
      finalGrade = entry.grade;
      break;
    }
  }

  // Overall validation
  const allErrors = [...blockI.errors, ...blockII.errors];
  const allWarnings = [...blockI.warnings, ...blockII.warnings];

  const passed = allErrors.length === 0 && totalPoints >= 300;

  return {
    totalPoints,
    maxPossible,
    finalGrade,
    passed,
    blockI,
    blockII,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Main calculation function - calculates everything
 */
export function calculateAbiturPrognose(
  grades,
  examSubjects,
  examResults,
  coreSubjects,
  profile
) {
  const blockI = calculateOptimalBlockI(grades, examSubjects, coreSubjects, profile);
  const blockII = calculateBlockII(examSubjects, examResults);
  const gesamtqualifikation = calculateGesamtqualifikation(blockI, blockII);

  return gesamtqualifikation;
}
