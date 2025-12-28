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
    <section className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="notion-section-header">Schritt 1</div>
          <h2 className="text-2xl font-semibold text-notion-gray-900 mb-2">
            Wähle dein Profil
          </h2>
          <p className="text-notion-gray-400 text-sm">
            Das Profil bestimmt deine profilgebenden und profilbegleitenden Fächer für alle vier Semester.
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const Icon = PROFILE_ICONS[profile.id];
            const isSelected = selectedProfile?.id === profile.id;

            return (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className={`
                  notion-card notion-card-interactive text-left p-6
                  ${isSelected ? 'notion-card-selected' : ''}
                `}
              >
                {/* Icon and Selection Indicator */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-notion-gray-50 text-notion-gray-600">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  {isSelected && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-notion-blue text-white">
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Profile Name */}
                <h3 className="text-base font-semibold text-notion-gray-900 mb-2">
                  {profile.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-notion-gray-400 leading-relaxed mb-4">
                  {profile.description}
                </p>

                {/* Profilgebende Fächer */}
                <div className="pt-3 border-t border-notion-gray-100">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-notion-gray-400 mb-2">
                    Profilgebend
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.profilgebend.map((fach, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-notion-blue-bg text-notion-blue border border-notion-blue"
                      >
                        {fach.name}
                        <span className="ml-1 text-[9px] opacity-70">{fach.level}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        {selectedProfile && (
          <div className="mt-6 p-4 bg-notion-blue-bg border border-notion-blue rounded-md">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-notion-blue flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-notion-gray-900 mb-1">
                  Profil ausgewählt: {selectedProfile.name}
                </h4>
                <p className="text-xs text-notion-gray-600">
                  Scrolle nach unten, um deine Kernfächer zu wählen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
