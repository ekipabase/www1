import type { ClinicConfig } from '../data/clinicData';

interface HeaderProps {
  config: ClinicConfig;
  accentClasses: {
    buttonBg: string;
    buttonHover: string;
  };
  onJumpToPublish: () => void;
}

export function Header({ config, accentClasses, onJumpToPublish }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single clean text wordmark */}
        <a
          href="#top"
          title={config.clinicName.trim() || 'Medica Nova'}
          className="font-display text-lg font-bold text-slate-900 whitespace-nowrap truncate max-w-[165px] sm:max-w-[280px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          {config.clinicName.trim() || 'Medica Nova'}
        </a>

        {/* Zone 2: 4 concise single-line text links */}
        <nav
          aria-label="Nawigacja główna"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#specjalizacje"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Specjalizacje
          </a>
          <a
            href="#zespol"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Zespół
          </a>
          <a
            href="#wizyty"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Cennik i wizyty
          </a>
          <a
            href="#publikacja"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Publikacja Drive
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onJumpToPublish}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
          >
            Zapisz na Google Drive
          </button>
        </div>
      </div>
    </header>
  );
}
