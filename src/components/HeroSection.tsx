import { ArrowRight, HardDrive } from 'lucide-react';
import { CLINIC_IMAGES, type ClinicConfig } from '../data/clinicData';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  config: ClinicConfig;
  accentClasses: {
    buttonBg: string;
    buttonHover: string;
    textAccent: string;
  };
  onJumpToBooking: () => void;
  onJumpToPublish: () => void;
}

export function HeroSection({
  config,
  accentClasses,
  onJumpToBooking,
  onJumpToPublish,
}: HeroSectionProps) {
  return (
    <section id="top" className="pt-12 pb-14 md:pt-16 md:pb-20 border-b border-slate-200 bg-[#fafbfd]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* 2-Column Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Unboxed clean metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mb-5">
              <span>{config.cityAndDistrict}</span>
              <span aria-hidden="true">·</span>
              <span>Kierownik medyczny: {config.leadDoctor}</span>
              <span aria-hidden="true">·</span>
              <span>{config.hoursWeekday}</span>
            </div>

            <h1 className="font-display text-[clamp(2.25rem,3.8vw,3.45rem)] font-bold text-slate-900 leading-[1.14] tracking-[-0.01em] text-balance mb-5">
              {config.heroHeadline}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-[60ch] mb-8">
              {config.heroSubheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onJumpToBooking}
                className={`min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
              >
                <span>Umów konsultację</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onJumpToPublish}
                className="min-h-[44px] px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                <HardDrive className="w-4 h-4 text-sky-700" aria-hidden="true" />
                <span>Zapisz stronę na Google Drive</span>
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              {config.registrationNote} · Rejestracja telefoniczna:{' '}
              <span className="font-semibold text-slate-700 tabular-nums">{config.phone}</span>
            </p>
          </div>

          <div className="lg:col-span-6 flex">
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[16/10] lg:aspect-auto">
              <ResilientImage
                src={CLINIC_IMAGES.heroClinic}
                alt={`Recepcja i poczekalnia placówki ${config.clinicName} w naturalnym świetle dziennym`}
                fallbackLabel="Wnętrze przychodni lekarskiej"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Quantitative Proof Strip Below Hero Split */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-12 pt-10 border-t border-slate-200">
          <div>
            <p className="font-display text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">
              14 800+
            </p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Konsultacji specjalistycznych zrealizowanych w 2025 roku
            </p>
          </div>

          <div>
            <p className="font-display text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">
              30 min
            </p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Gwarantowany czas pierwszorazowej wizyty lekarskiej
            </p>
          </div>

          <div>
            <p className="font-display text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">
              15 min
            </p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Wydanie pełnego opisu i zdjęć po badaniu USG na miejscu
            </p>
          </div>

          <div>
            <p className={`font-display text-2xl md:text-3xl font-bold tabular-nums ${accentClasses.textAccent}`}>
              98,4%
            </p>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Pacjentów deklarujących pełne wyjaśnienie planu leczenia (n=1 920)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
