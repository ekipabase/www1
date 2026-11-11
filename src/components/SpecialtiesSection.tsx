import type { SpecialtyCategory, SpecialtyItem } from '../data/clinicData';
import { filterSpecialtiesByCategory } from '../utils/siteGenerator';
import { ResilientImage } from './ResilientImage';

interface SpecialtiesSectionProps {
  specialties: SpecialtyItem[];
  selectedCategory: SpecialtyCategory;
  onSelectCategory: (cat: SpecialtyCategory) => void;
  accentClasses: {
    textAccent: string;
  };
  onJumpToBooking: () => void;
}

const FILTER_OPTIONS: { value: SpecialtyCategory; label: string }[] = [
  { value: 'all', label: 'Wszystkie poradnie' },
  { value: 'diagnostics', label: 'Diagnostyka obrazowa' },
  { value: 'consultations', label: 'Konsultacje specjalistyczne' },
];

export function SpecialtiesSection({
  specialties,
  selectedCategory,
  onSelectCategory,
  accentClasses,
  onJumpToBooking,
}: SpecialtiesSectionProps) {
  const visibleItems = filterSpecialtiesByCategory(specialties, selectedCategory);

  return (
    <section id="specjalizacje" className="py-16 md:py-24 border-b border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs text-slate-500 mb-2">
              Zakres świadczeń medycznych · Diagnostyka na miejscu
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 text-balance">
              Poradnie specjalistyczne i pracownia ultrasonograficzna
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
              Łączymy konsultacje kliniczne z badaniami obrazowymi w obrębie jednej wizyty, bez
              konieczności wielotygodniowego oczekiwania na osobny opis.
            </p>
          </div>

          {/* Functional interactive filter control */}
          <div
            role="group"
            aria-label="Filtruj zakres poradni"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto overflow-x-auto max-w-full"
          >
            {FILTER_OPTIONS.map((opt) => {
              const active = selectedCategory === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectCategory(opt.value)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {visibleItems.map((item, idx) => {
            const isFeatured = Boolean(item.featured && selectedCategory === 'all');
            const spanClass = isFeatured
              ? 'lg:col-span-7'
              : selectedCategory === 'all' && idx === 1
                ? 'lg:col-span-5'
                : 'lg:col-span-6';

            return (
              <article
                key={item.id}
                className={`${spanClass} border border-slate-200 rounded-xl p-6 md:p-8 bg-[#fafbfd] flex flex-col justify-between`}
              >
                <div>
                  <p className={`text-xs font-semibold mb-2 ${accentClasses.textAccent}`}>
                    {item.indexLabel}
                  </p>
                  <h3 className="font-display text-lg md:text-xl font-bold text-slate-900 text-balance mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">{item.summary}</p>

                  {item.imageUrl && (
                    <div className="mb-6 overflow-hidden rounded-lg aspect-[16/10] bg-slate-100">
                      <ResilientImage
                        src={item.imageUrl}
                        alt={item.imageAlt || item.title}
                        fallbackLabel="Pracownia diagnostyczna USG i UKG"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <ul className="space-y-2 text-sm text-slate-700 mb-6 list-disc pl-4">
                    {item.procedures.map((proc) => (
                      <li key={proc} className="leading-snug">
                        {proc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{item.waitTime}</span>
                  <button
                    type="button"
                    onClick={onJumpToBooking}
                    className={`font-semibold hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer ${accentClasses.textAccent}`}
                  >
                    Sprawdź wolne terminy
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
