import { PROFILES } from '../data/profiles';
import { GraduationCap, Globe, Palette, Earth, Flame } from 'lucide-react';

const PROFILE_ICONS = {
  'humanities': GraduationCap,
  'kosmopolit': Globe,
  'kultur': Palette,
  'netzwerk-erde': Earth,
  'wissenschaft-bewegung': Flame,
};

const COLOR_CLASSES = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
};

export default function ProfileSelector({ onSelectProfile }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Abitur-Planer Blankenese
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Prognostiziere deine Abiturnote und optimiere deine Fächereinbringung.
            Wähle zunächst dein Profil aus.
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.values(PROFILES).map((profile) => {
            const Icon = PROFILE_ICONS[profile.id];
            const colorClass = COLOR_CLASSES[profile.color];

            return (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden text-left"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${colorClass} p-6 text-white transition-all duration-300`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                    </div>
                    <Icon className="w-8 h-8 opacity-90" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    {profile.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">
                        Profilgebende Fächer (eA):
                      </h3>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {profile.profilgebend.map((fach, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                            {fach.name} ({fach.hours}h)
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">
                        Profilbegleitend (gA):
                      </h3>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {profile.profilbegleitend.map((fach, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                            {fach.name} ({fach.hours}h)
                          </li>
                        ))}
                      </ul>
                    </div>

                    {profile.kernfachBesonderheit && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 italic">
                          💡 {profile.kernfachBesonderheit}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Hinweis zur Profilwahl
              </h3>
              <p className="text-sm text-blue-800">
                Die Profilwahl am Gymnasium Blankenese erfolgt normalerweise im Januar des 10. Jahrgangs.
                Bedenke, dass Profile nur bei ausreichender Anwahl eingerichtet werden können.
                Nimm auch deine Zweitwahl ernst!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
