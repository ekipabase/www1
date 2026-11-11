import type { DoctorProfile, PatientOutcome } from '../data/clinicData';
import { ResilientImage } from './ResilientImage';

interface DoctorsAndProofSectionProps {
  doctors: DoctorProfile[];
  outcomes: PatientOutcome[];
  accentClasses: {
    buttonBg: string;
    buttonHover: string;
    textAccent: string;
  };
  onSelectDoctorForBooking: (doctorId: string) => void;
}

export function DoctorsAndProofSection({
  doctors,
  outcomes,
  accentClasses,
  onSelectDoctorForBooking,
}: DoctorsAndProofSectionProps) {
  return (
    <section id="zespol" className="py-16 md:py-24 border-b border-slate-200 bg-[#fafbfd]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs text-slate-500 mb-2">
            Kadra kliniczna · Weryfikacja Centralnego Rejestru Lekarzy RP
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 text-balance">
            Zespół lekarski prowadzący konsultacje i badania
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
            Każdy specjalista przyjmuje w stałych blokach godzinowych, prowadząc dokumentację
            medyczną oraz kontrolę wyników badań pacjenta od pierwszej wizyty.
          </p>
        </div>

        {/* 3 Specialist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {doctors.map((doc) => (
            <article
              key={doc.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/4.6] bg-slate-100 overflow-hidden border-b border-slate-100">
                  <ResilientImage
                    src={doc.imageUrl}
                    alt={doc.imageAlt}
                    fallbackLabel={doc.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    {doc.specialty}
                  </p>

                  {/* Clean unboxed metadata with middle dot separators */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 pb-4 mb-4 border-b border-slate-100 tabular-nums">
                    <span>{doc.pwz}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.experienceYears} lat doświadczenia</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.languages}</span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{doc.bio}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-4 tabular-nums">
                  <span>{doc.availabilityLabel}</span>
                  <span className="font-semibold text-slate-900">
                    od {doc.consultationFeePln} zł
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectDoctorForBooking(doc.id)}
                  aria-label={`Wybierz termin u lekarza: ${doc.name}`}
                  className={`w-full min-h-[42px] px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
                >
                  Wybierz termin u lekarza
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Adjacent Claim-to-Proof Clinical Outcomes */}
        <div className="pt-12 border-t border-slate-200">
          <div className="max-w-xl mb-8">
            <h3 className="font-display text-xl font-bold text-slate-900">
              Udokumentowane efekty ścieżki diagnostycznej pacjentów
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Przykłady skrócenia czasu od pierwszych objawów do celowanego wdrożenia leczenia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {outcomes.map((out) => (
              <blockquote
                key={out.id}
                className="bg-white border border-slate-200 rounded-xl p-6 md:p-7 flex flex-col justify-between"
              >
                <div>
                  <p className={`text-xs font-semibold tabular-nums mb-3 ${accentClasses.textAccent}`}>
                    {out.measurableOutcome}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed mb-5">
                    „{out.quote}”
                  </p>
                </div>
                <footer className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <strong className="text-slate-800 font-semibold">{out.patientName}</strong>
                  <span aria-hidden="true"> · </span>
                  <span>{out.context}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
