import { Check, GraduationCap, Globe, Palette, Earth, Flame } from 'lucide-react';
import { PROFILES } from '../../data/profiles';

const PROFILE_ICONS = {
  'humanities': GraduationCap,
  'kosmopolit': Globe,
  'kultur': Palette,
  'netzwerk-erde': Earth,
  'wissenschaft-bewegung': Flame,
};

export default function ProfilePicker({ selectedProfile, onSelectProfile }) {
  const profiles = Object.values(PROFILES);

  return (
    <section className="py-8 px-6 bg-notion-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-notion-text mb-2">
            Wähle dein Profil
          </h2>
          <p className="text-sm text-notion-text-secondary">
            Das Profil bestimmt deine profilgebenden und profilbegleitenden Fächer für alle vier Semester.
          </p>
        </div>

        {/* Profile Grid - MUSS als Cards Grid sein, nicht als Text-Liste! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const Icon = PROFILE_ICONS[profile.id];
            const isSelected = selectedProfile?.id === profile.id;

            return (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className={`
                  relative text-left p-4
                  notion-card-interactive
                  ${isSelected ? 'notion-card-selected' : ''}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-md bg-notion-bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-notion-text-secondary" strokeWidth={1.5} />
                  </div>

                  {/* Profile Name */}
                  <h3 className="font-semibold text-notion-text">
                    {profile.name}
                  </h3>
                </div>

                {/* Description (truncated to 2 lines) */}
                <p className="text-sm text-notion-text-secondary mb-2 line-clamp-2 leading-relaxed">
                  {profile.description}
                </p>

                {/* Profilgebende Fächer Preview */}
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {profile.profilgebend.slice(0, 2).map((fach, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-notion-bg-secondary rounded text-notion-text-secondary"
                    >
                      {fach.name}
                    </span>
                  ))}
                  {profile.profilgebend.length > 2 && (
                    <span className="text-xs text-notion-text-tertiary">
                      +{profile.profilgebend.length - 2}
                    </span>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-notion-accent rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Box when profile selected */}
        {selectedProfile && (
          <div className="mt-6 p-4 bg-notion-accent-bg border border-notion-accent rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-notion-accent flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-notion-text mb-1">
                  Profil ausgewählt: {selectedProfile.name}
                </h4>
                <p className="text-sm text-notion-text-secondary">
                  Wechsle zu den Kernfächern.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
