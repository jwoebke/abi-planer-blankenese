import { X } from 'lucide-react';

// Notion-style tag colors mapped to subjects
const SUBJECT_COLORS = {
  // Kernfächer
  'Deutsch': 'yellow',
  'Mathematik': 'blue',
  'Englisch': 'purple',
  'Spanisch': 'pink',
  'Französisch': 'pink',

  // Naturwissenschaften
  'Biologie': 'green',
  'Chemie': 'blue',
  'Physik': 'blue',
  'Informatik': 'gray',

  // Gesellschaftswissenschaften
  'Geschichte': 'brown',
  'Geographie': 'green',
  'PGW': 'orange',
  'Wirtschaft': 'orange',
  'Philosophie': 'purple',
  'Religion': 'brown',

  // Künstlerisch
  'Bildende Kunst': 'pink',
  'Musik': 'pink',
  'Theater': 'pink',
  'Theater (englisch bilingual)': 'pink',

  // Sport
  'Sport': 'red',

  // Default
  'default': 'gray'
};

const COLOR_CLASSES = {
  'gray': 'bg-[rgba(227,226,224,0.5)] text-[rgb(50,48,44)]',
  'brown': 'bg-[rgba(238,224,218,1)] text-[rgb(68,42,30)]',
  'orange': 'bg-[rgba(250,222,201,1)] text-[rgb(73,41,14)]',
  'yellow': 'bg-[rgba(253,236,200,1)] text-[rgb(64,44,27)]',
  'green': 'bg-[rgba(219,237,219,1)] text-[rgb(28,56,41)]',
  'blue': 'bg-[rgba(211,229,239,1)] text-[rgb(24,51,71)]',
  'purple': 'bg-[rgba(232,222,238,1)] text-[rgb(65,36,84)]',
  'pink': 'bg-[rgba(245,224,233,1)] text-[rgb(76,35,55)]',
  'red': 'bg-[rgba(255,226,221,1)] text-[rgb(93,23,21)]',
};

export default function SubjectTag({
  name,
  level,
  removable = false,
  onRemove,
  className = ''
}) {
  const colorKey = SUBJECT_COLORS[name] || SUBJECT_COLORS.default;
  const colorClass = COLOR_CLASSES[colorKey];

  return (
    <span className={`
      notion-tag
      ${colorClass}
      ${className}
    `}>
      <span>{name}</span>
      {level && (
        <span className="opacity-70 text-[0.7rem]">
          {level}
        </span>
      )}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`${name} entfernen`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
