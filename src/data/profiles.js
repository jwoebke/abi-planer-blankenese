// Profile definitions based on Gymnasium Blankenese Wegweiser

export const PROFILES = {
  HUMANITIES: {
    id: 'humanities',
    name: 'Humanities',
    description: 'Fact and fake, Europa und der Brexit, transatlantisches Bündnis – verstehe gesellschaftspolitische, wirtschaftliche und historische Fragen mit anglo-amerikanischem Schwerpunkt.',
    profilgebend: [
      { name: 'Geschichte', hours: 4, level: 'eA' },
      { name: 'PGW', hours: 4, level: 'eA' }
    ],
    profilbegleitend: [
      { name: 'Theater (englisch bilingual)', hours: 2, level: 'gA' }
    ],
    seminar: 'in einem profilgebenden Fach (+2h)',
    kernfachBesonderheit: 'gemeinsamer Englischkurs auf eA',
    belegverpflichtungen: [
      '2 Std. Philosophie oder Religion',
      '4 Std. Biologie oder Chemie oder Physik',
      '2 Std. Sport',
      '+ 2 Std. in einem beliebigen weiteren Fach'
    ],
    color: 'blue'
  },

  KOSMOPOLIT: {
    id: 'kosmopolit',
    name: 'Kosmopolit',
    description: 'Erforsche soziale, politische, ökonomische und ökologische Themen wie Globalisierung, Migration und Nachhaltigkeit mit Schwerpunkt auf der französisch- und spanischsprachigen Welt.',
    profilgebend: [
      { name: 'Spanisch oder Französisch', hours: 4, level: 'eA' },
      { name: 'PGW', hours: 4, level: 'eA' }
    ],
    profilbegleitend: [
      { name: 'Geographie', hours: 2, level: 'gA' }
    ],
    seminar: 'in einem profilgebenden Fach (+2h)',
    kernfachBesonderheit: 'Option: Spanisch bzw. Französisch als Kernfach statt Englisch',
    belegverpflichtungen: [
      '2 Std. Philosophie oder Religion',
      '4 Std. Biologie oder Chemie oder Physik',
      '2 Std. Bildende Kunst oder Musik oder Theater',
      '2 Std. Sport'
    ],
    color: 'green'
  },

  KULTUR: {
    id: 'kultur',
    name: 'Kultur!',
    description: 'Betrachte das musisch-künstlerische Schaffen der Menschen, eingebettet in historische Entwicklung und Religion(en) mit ihren vielfältigen Bezügen auf Kunst, Musik, Literatur und Geschichte.',
    profilgebend: [
      { name: 'Bildende Kunst oder Musik', hours: 4, level: 'eA' },
      { name: 'Geschichte', hours: 4, level: 'eA' }
    ],
    profilbegleitend: [
      { name: 'Religion', hours: 2, level: 'gA' }
    ],
    seminar: 'in einem profilgebenden Fach (+2h)',
    kernfachBesonderheit: 'gemeinsamer Deutschkurs auf eA',
    belegverpflichtungen: [
      '4 Std. Biologie oder Chemie oder Physik',
      '2 Std. Sport',
      '+ 4 Std. in einem oder zwei beliebigen weiteren Fächern'
    ],
    color: 'purple'
  },

  NETZWERK_ERDE: {
    id: 'netzwerk-erde',
    name: 'Netzwerk Erde',
    description: 'Untersuche ökologische, soziale, ökonomische und digitale Vernetzungen. Analysiere Klimawandel, Artensterben und Biotechnologie auf ihre Nachhaltigkeit hin.',
    profilgebend: [
      { name: 'Geographie', hours: 4, level: 'eA' },
      { name: 'Biologie', hours: 4, level: 'eA' }
    ],
    profilbegleitend: [
      { name: 'Informatik', hours: 4, level: 'gA' }
    ],
    seminar: 'in Informatik (+2h)',
    kernfachBesonderheit: null,
    belegverpflichtungen: [
      '2 Std. Philosophie oder Religion',
      '2 Std. Bildende Kunst oder Musik oder Theater',
      '2 Std. Sport',
      '+ 2 Std. in einem oder zwei beliebigen weiteren Fächern'
    ],
    color: 'emerald'
  },

  WISSENSCHAFT_IN_BEWEGUNG: {
    id: 'wissenschaft-bewegung',
    name: 'Wissenschaft in Bewegung',
    description: 'Erkunde Schnittstellen zwischen Chemie, Sport und PGW. Von Ernährung über moderne Werkstoffe bis zu sportpsychologischen Mechanismen und gesellschaftlichen Wechselwirkungen.',
    profilgebend: [
      { name: 'Chemie', hours: 4, level: 'eA' },
      { name: 'Sport', hours: 6, level: 'eA', note: 'davon 2h Theorie' }
    ],
    profilbegleitend: [
      { name: 'PGW', hours: 2, level: 'gA' }
    ],
    seminar: 'in einem profilgebenden Fach (+2h)',
    kernfachBesonderheit: null,
    belegverpflichtungen: [
      '2 Std. Philosophie oder Religion',
      '2 Std. Geschichte oder Geographie oder Wirtschaft',
      '2 Std. Bildende Kunst oder Musik oder Theater',
      '+ 2 Std. in einem beliebigen weiteren Fach'
    ],
    color: 'orange'
  }
};

// Core subjects (Kernfächer)
export const CORE_SUBJECTS = {
  DEUTSCH: 'Deutsch',
  MATHEMATIK: 'Mathematik',
  ENGLISCH: 'Englisch',
  SPANISCH: 'Spanisch',  // Only in Kosmopolit profile
  FRANZÖSISCH: 'Französisch',  // Only in Kosmopolit profile
};

// Subject categories for Aufgabenfelder
export const AUFGABENFELDER = {
  SPRACHLICH_KUENSTLERISCH: 'sprachlich-künstlerisch',
  MATH_NATURWISS: 'math-naturwiss',
  GESELLSCHAFTSWISS: 'gesellschaftswiss',
};

// Subjects grouped by Aufgabenfeld
export const SUBJECTS_BY_AUFGABENFELD = {
  [AUFGABENFELDER.SPRACHLICH_KUENSTLERISCH]: [
    'Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Latein',
    'Bildende Kunst', 'Musik', 'Theater', 'Orchester'
  ],
  [AUFGABENFELDER.MATH_NATURWISS]: [
    'Mathematik', 'Physik', 'Chemie', 'Biologie', 'Informatik'
  ],
  [AUFGABENFELDER.GESELLSCHAFTSWISS]: [
    'Religion', 'Philosophie', 'Geschichte', 'Geographie', 'PGW', 'Wirtschaft', 'Seminar'
  ],
};

// Point scale (0-15 points system)
export const POINTS_SCALE = Array.from({ length: 16 }, (_, i) => i);

// Grades to points mapping
export const GRADES_TO_POINTS = {
  '1+': 15, '1': 14, '1-': 13,
  '2+': 12, '2': 11, '2-': 10,
  '3+': 9, '3': 8, '3-': 7,
  '4+': 6, '4': 5, '4-': 4,
  '5+': 3, '5': 2, '5-': 1,
  '6': 0,
};

// Points to Abitur grade conversion table (from PDF page 12)
export const POINTS_TO_GRADE = [
  { min: 823, max: 900, grade: 1.0 },
  { min: 805, max: 822, grade: 1.1 },
  { min: 787, max: 804, grade: 1.2 },
  { min: 769, max: 786, grade: 1.3 },
  { min: 751, max: 768, grade: 1.4 },
  { min: 733, max: 750, grade: 1.5 },
  { min: 715, max: 732, grade: 1.6 },
  { min: 697, max: 714, grade: 1.7 },
  { min: 679, max: 696, grade: 1.8 },
  { min: 661, max: 678, grade: 1.9 },
  { min: 643, max: 660, grade: 2.0 },
  { min: 625, max: 642, grade: 2.1 },
  { min: 607, max: 624, grade: 2.2 },
  { min: 589, max: 606, grade: 2.3 },
  { min: 571, max: 588, grade: 2.4 },
  { min: 553, max: 570, grade: 2.5 },
  { min: 535, max: 552, grade: 2.6 },
  { min: 517, max: 534, grade: 2.7 },
  { min: 499, max: 516, grade: 2.8 },
  { min: 481, max: 498, grade: 2.9 },
  { min: 463, max: 480, grade: 3.0 },
  { min: 445, max: 462, grade: 3.1 },
  { min: 427, max: 444, grade: 3.2 },
  { min: 409, max: 426, grade: 3.3 },
  { min: 391, max: 408, grade: 3.4 },
  { min: 373, max: 390, grade: 3.5 },
  { min: 355, max: 372, grade: 3.6 },
  { min: 337, max: 354, grade: 3.7 },
  { min: 319, max: 336, grade: 3.8 },
  { min: 301, max: 318, grade: 3.9 },
  { min: 300, max: 300, grade: 4.0 },
];
