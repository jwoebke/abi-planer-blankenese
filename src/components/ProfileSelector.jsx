import { PROFILES } from '../data/profiles';
import { GraduationCap, Globe, Palette, Earth, Flame } from 'lucide-react';

const PROFILE_ICONS = {
  'humanities': GraduationCap,
  'kosmopolit': Globe,
  'kultur': Palette,
  'netzwerk-erde': Earth,
  'wissenschaft-bewegung': Flame,
};

export default function ProfileSelector({ onSelectProfile }) {
  return (
    <div className="min-h-screen bg-washi py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header - Ma (negative space) principle */}
        <div className="text-center mb-20">
          <h1 className="text-sumi mb-6 tracking-[0.25em]">
            ABITUR PLANER
          </h1>
          <p className="text-base text-sumi/60 font-light max-w-md mx-auto leading-relaxed">
            Wähle dein Profil. Die Berechnung folgt den Regeln des Gymnasiums Blankenese.
          </p>
        </div>

        {/* Profile Grid - Shoji-inspired layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-tatami">
          {Object.values(PROFILES).map((profile) => {
            const Icon = PROFILE_ICONS[profile.id];

            return (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="bg-washi p-8 text-left transition-all duration-300 hover:bg-white group relative"
              >
                {/* Minimalist Icon */}
                <div className="mb-6">
                  <Icon className="w-5 h-5 text-indigo-dye/40 group-hover:text-indigo-dye transition-colors" strokeWidth={1.5} />
                </div>

                {/* Profile Name - Wide tracking for Ma */}
                <h2 className="text-sumi text-sm font-medium tracking-[0.15em] uppercase mb-3">
                  {profile.name}
                </h2>

                {/* Subtle divider */}
                <div className="w-8 h-px bg-tatami mb-4" />

                {/* Profilgebende Fächer - Very subtle */}
                <div className="text-xs text-sumi/50 font-light space-y-1">
                  {profile.profilgebend.slice(0, 2).map((fach, idx) => (
                    <div key={idx}>{fach.name}</div>
                  ))}
                </div>

                {/* Hover indicator - thin line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-indigo-dye scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
            );
          })}
        </div>

        {/* Subtle footer note */}
        <div className="mt-16 text-center">
          <p className="text-xs text-sumi/30 font-light tracking-wide">
            GYMNASIUM BLANKENESE · HAMBURG
          </p>
        </div>
      </div>
    </div>
  );
}
