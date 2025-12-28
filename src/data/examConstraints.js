import { AUFGABENFELDER, SUBJECTS_BY_AUFGABENFELD } from './profiles';

// Exam subject variants for each profile (from PDF page 9)
export const EXAM_VARIANTS = {
  'humanities': [
    {
      id: 'var1',
      name: 'Variante I',
      subjects: ['Geschichte', 'Englisch', 'Deutsch', 'NatWi/Info/Math'],
      description: 'Geschichte + Englisch + Deutsch + Naturwissenschaft/Informatik/Mathematik'
    },
    {
      id: 'var2',
      name: 'Variante II',
      subjects: ['Geschichte', 'Englisch/Deutsch', 'Mathematik', 'Frei'],
      description: 'Geschichte + Englisch oder Deutsch + Mathematik + Fach nach Wahl'
    },
    {
      id: 'var3',
      name: 'Variante III',
      subjects: ['PGW', 'Englisch', 'Deutsch', 'NatWi/Info/Math'],
      description: 'PGW + Englisch + Deutsch + Naturwissenschaft/Informatik/Mathematik'
    },
    {
      id: 'var4',
      name: 'Variante IV',
      subjects: ['PGW', 'Englisch/Deutsch', 'Mathematik', 'Frei'],
      description: 'PGW + Englisch oder Deutsch + Mathematik + Fach nach Wahl'
    }
  ],

  'kosmopolit': [
    {
      id: 'var1',
      name: 'Variante I (Kernfach Englisch)',
      subjects: ['PGW', 'Englisch/Deutsch', 'Mathematik', 'Frei'],
      coreSubjectConstraint: 'Englisch'
    },
    {
      id: 'var2',
      name: 'Variante II (Kernfach Englisch)',
      subjects: ['PGW', 'Englisch', 'Deutsch', 'NatWi/Info/Math'],
      coreSubjectConstraint: 'Englisch'
    },
    {
      id: 'var3',
      name: 'Variante III (Kernfach Englisch)',
      subjects: ['Spanisch/Französisch', 'Englisch/Deutsch', 'Mathematik', 'GeWi'],
      coreSubjectConstraint: 'Englisch'
    },
    {
      id: 'var4',
      name: 'Variante IV (Kernfach Spa/Fra)',
      subjects: ['PGW', 'Spanisch/Französisch/Deutsch', 'Mathematik', 'Frei'],
      coreSubjectConstraint: 'Spanisch|Französisch'
    },
    {
      id: 'var5',
      name: 'Variante V (Kernfach Spa/Fra)',
      subjects: ['PGW', 'Spanisch/Französisch', 'Deutsch', 'NatWi/Info/Math'],
      coreSubjectConstraint: 'Spanisch|Französisch'
    }
  ],

  'kultur': [
    {
      id: 'var1',
      name: 'Variante I',
      subjects: ['BKu/Musik', 'Englisch/Deutsch', 'Mathematik', 'GeWi']
    },
    {
      id: 'var2',
      name: 'Variante II',
      subjects: ['Geschichte', 'Englisch', 'Deutsch', 'NatWi/Info/Math']
    },
    {
      id: 'var3',
      name: 'Variante III',
      subjects: ['Geschichte', 'Englisch/Deutsch', 'Mathematik', 'Frei']
    }
  ],

  'netzwerk-erde': [
    {
      id: 'var1',
      name: 'Variante I',
      subjects: ['Geographie', 'Englisch', 'Deutsch', 'NatWi/Info/Math']
    },
    {
      id: 'var2',
      name: 'Variante II',
      subjects: ['Geographie', 'Englisch/Deutsch', 'Mathematik', 'Frei']
    },
    {
      id: 'var3',
      name: 'Variante III',
      subjects: ['Biologie', 'Zwei von D/E/M', 'Zwei von D/E/M', 'GeWi']
    }
  ],

  'wissenschaft-bewegung': [
    {
      id: 'var1',
      name: 'Variante I',
      subjects: ['Chemie', 'Zwei von D/E/M', 'Zwei von D/E/M', 'GeWi']
    },
    {
      id: 'var2',
      name: 'Variante II',
      subjects: ['Sport', 'Deutsch/Englisch', 'Mathematik', 'GeWi'],
      note: 'Nur möglich wenn Mathematik eA belegt und als schriftliches Prüfungsfach gewählt'
    }
  ]
};

/**
 * Validates exam subject selection based on Hamburg Abitur rules
 */
export function validateExamSubjects(examSubjects, profile, coreSubjects) {
  const errors = [];

  if (examSubjects.length !== 4) {
    errors.push('Es müssen genau 4 Prüfungsfächer gewählt werden.');
    return { valid: false, errors };
  }

  // Rule 1: Ein profilgebendes Fach muss Prüfungsfach sein
  const profilgebendeFaecher = profile.profilgebend.map(f => f.name);
  const hasProfilgebendesFach = examSubjects.some(subject =>
    profilgebendeFaecher.includes(subject.name)
  );

  if (!hasProfilgebendesFach) {
    errors.push('Mindestens ein profilgebendes Fach muss als Prüfungsfach gewählt werden.');
  }

  // Rule 2: Zwei der drei Kernfächer müssen Prüfungsfächer sein
  const kernfaecherArray = [coreSubjects.coreEA1, coreSubjects.coreEA2, coreSubjects.coreGA];
  const kernfaecherInExams = examSubjects.filter(subject =>
    kernfaecherArray.includes(subject.name)
  );

  if (kernfaecherInExams.length < 2) {
    errors.push('Mindestens zwei Kernfächer müssen Prüfungsfächer sein.');
  }

  // Rule 2b: Mindestens ein Kernfach schriftlich und auf eA
  const hasSchriftlichesEAKernfach = examSubjects.some(subject =>
    (subject.name === coreSubjects.coreEA1 || subject.name === coreSubjects.coreEA2) &&
    subject.examType === 'schriftlich'
  );

  if (!hasSchriftlichesEAKernfach) {
    errors.push('Mindestens ein Kernfach auf erhöhtem Niveau muss schriftlich geprüft werden.');
  }

  // Rule 3: Zwei schriftliche Fächer müssen auf eA sein
  const schriftlicheEAFaecher = examSubjects.filter(subject =>
    subject.examType === 'schriftlich' && subject.level === 'eA'
  );

  if (schriftlicheEAFaecher.length < 2) {
    errors.push('Mindestens zwei schriftlich geprüfte Fächer müssen auf erhöhtem Niveau sein.');
  }

  // Rule 4: Alle drei Aufgabenfelder müssen abgedeckt sein
  const coveredAufgabenfelder = new Set();

  examSubjects.forEach(subject => {
    const aufgabenfeld = getAufgabenfeldForSubject(subject.name);
    if (aufgabenfeld) {
      coveredAufgabenfelder.add(aufgabenfeld);
    }
  });

  if (coveredAufgabenfelder.size < 3) {
    errors.push('Alle drei Aufgabenfelder müssen durch mindestens ein Prüfungsfach abgedeckt sein.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Returns the Aufgabenfeld for a given subject
 */
export function getAufgabenfeldForSubject(subjectName) {
  const subjectAliases = {
    'Theater (englisch bilingual)': 'Theater',
    'Bildende Kunst oder Musik': 'Bildende Kunst',
    'Spanisch oder Französisch': 'Spanisch',
  };

  const normalizedName = subjectAliases[subjectName] || subjectName;

  for (const [aufgabenfeld, subjects] of Object.entries(SUBJECTS_BY_AUFGABENFELD)) {
    if (subjects.includes(normalizedName)) {
      return aufgabenfeld;
    }
  }
  return null;
}

/**
 * Checks if a subject can be an exam subject based on profile and core subjects
 */
export function canBeExamSubject(subjectName, profile, coreSubjects) {
  // Profile subjects can be exam subjects
  const profilFaecher = [
    ...profile.profilgebend.map(f => f.name),
    ...profile.profilbegleitend.map(f => f.name)
  ];

  if (profilFaecher.includes(subjectName)) return true;

  // Core subjects can be exam subjects
  const kernfaecher = [coreSubjects.coreEA1, coreSubjects.coreEA2, coreSubjects.coreGA];
  if (kernfaecher.includes(subjectName)) return true;

  // Other subjects from Wahlbereich can be exam subjects
  // (This will be determined when we implement the Wahlbereich selection)

  return false;
}
