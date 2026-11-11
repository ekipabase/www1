import { useState, type FormEvent } from 'react';
import { CalendarCheck, Trash2 } from 'lucide-react';
import type {
  AppointmentBooking,
  ClinicConfig,
  DoctorProfile,
  ServicePriceRow,
} from '../data/clinicData';
import {
  validateBookingInput,
  type BookingFormInput,
  type ValidationErrors,
} from '../utils/siteGenerator';

interface PricingAndBookingSectionProps {
  config: ClinicConfig;
  prices: ServicePriceRow[];
  doctors: DoctorProfile[];
  selectedDoctorId: string;
  onSelectedDoctorChange: (doctorId: string) => void;
  bookings: AppointmentBooking[];
  onAddBooking: (booking: AppointmentBooking) => void;
  onCancelBooking: (bookingId: string) => void;
  accentClasses: {
    buttonBg: string;
    buttonHover: string;
    textAccent: string;
  };
}

const TIME_SLOTS = ['08:30', '09:30', '11:00', '13:30', '15:30', '17:00', '18:30'];

export function PricingAndBookingSection({
  config,
  prices,
  doctors,
  selectedDoctorId,
  onSelectedDoctorChange,
  bookings,
  onAddBooking,
  onCancelBooking,
  accentClasses,
}: PricingAndBookingSectionProps) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [visitType, setVisitType] = useState<'stacjonarna' | 'teleporada'>('stacjonarna');
  const [preferredDate, setPreferredDate] = useState('2026-11-16');
  const [preferredSlot, setPreferredSlot] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [lastCreatedRef, setLastCreatedRef] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLastCreatedRef(null);

    const payload: BookingFormInput = {
      patientName,
      patientPhone,
      patientEmail,
      doctorId: selectedDoctorId,
      visitType,
      preferredDate,
      preferredSlot,
      notes,
    };

    const validation = validateBookingInput(payload);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    const doctorObj = doctors.find((d) => d.id === selectedDoctorId) ?? doctors[0];
    const refNumber = `MN-2026-${Math.floor(100 + Math.random() * 899)}`;

    const newBooking: AppointmentBooking = {
      id: `bk-${Date.now()}`,
      referenceCode: refNumber,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim(),
      doctorId: doctorObj.id,
      doctorName: doctorObj.name,
      visitType,
      preferredDate,
      preferredSlot,
      notes: notes.trim(),
      createdAtIso: new Date().toISOString(),
    };

    onAddBooking(newBooking);
    setLastCreatedRef(refNumber);
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setNotes('');
  };

  return (
    <section id="wizyty" className="py-16 md:py-24 border-b border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs text-slate-500 mb-2">
            Przejrzyste zasady finansowe · Rezerwacja online bez przedpłat
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 text-balance">
            Cennik świadczeń oraz formularz umawiania wizyt
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
            Każda cena obejmuje pełną konsultację specjalistyczną, interpretację wyników oraz
            wystawienie e-Recepty lub e-Skierowania w systemie P1.
          </p>
        </div>

        {/* Fee Schedule Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl mb-16">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th scope="col" className="py-3.5 px-5">
                  Kod
                </th>
                <th scope="col" className="py-3.5 px-5">
                  Świadczenie medyczne i zalecenia przed wizytą
                </th>
                <th scope="col" className="py-3.5 px-5">
                  Poradnia
                </th>
                <th scope="col" className="py-3.5 px-5 whitespace-nowrap">
                  Czas trwania
                </th>
                <th scope="col" className="py-3.5 px-5 text-right whitespace-nowrap">
                  Cena brutto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {prices.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-slate-500 whitespace-nowrap tabular-nums">
                    {row.code}
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-semibold text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{row.preparation}</p>
                  </td>
                  <td className="py-4 px-5 text-slate-600 whitespace-nowrap">{row.department}</td>
                  <td className="py-4 px-5 text-slate-600 whitespace-nowrap tabular-nums">
                    {row.durationMinutes} min
                  </td>
                  <td className="py-4 px-5 text-right font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                    {row.pricePln} zł
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interactive Booking Form + Confirmed Demo Appointments */}
        <div id="kontakt" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 bg-[#fafbfd] border border-slate-200 rounded-xl p-6 md:p-8">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
              Zarezerwuj termin konsultacji (symulacja pacjenta)
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Przetestuj działanie formularza rejestracji, który zobaczą pacjenci odwiedzający
              stronę Twojego gabinetu.
            </p>

            {lastCreatedRef && (
              <div
                role="status"
                className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3"
              >
                <CalendarCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    Wizyta została zapisana w harmonogramie demonstracyjnym (nr{' '}
                    <span className="font-mono tabular-nums">{lastCreatedRef}</span>).
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Potwierdzenie widnieje w panelu zaplanowanych wizyt po prawej stronie.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="booking-patient-name"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Imię i nazwisko pacjenta *
                  </label>
                  <input
                    id="booking-patient-name"
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="np. Janusz Majewski"
                    aria-invalid={Boolean(errors.patientName)}
                    className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  />
                  {errors.patientName && (
                    <p role="alert" className="text-xs text-red-700 mt-1">
                      {errors.patientName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-patient-phone"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Numer telefonu kontaktowego *
                  </label>
                  <input
                    id="booking-patient-phone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+48 602 441 890"
                    aria-invalid={Boolean(errors.patientPhone)}
                    className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-sky-700"
                  />
                  {errors.patientPhone && (
                    <p role="alert" className="text-xs text-red-700 mt-1">
                      {errors.patientPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="booking-patient-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Adres e-mail do powiadomień *
                  </label>
                  <input
                    id="booking-patient-email"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="pacjent@domena.pl"
                    aria-invalid={Boolean(errors.patientEmail)}
                    className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  />
                  {errors.patientEmail && (
                    <p role="alert" className="text-xs text-red-700 mt-1">
                      {errors.patientEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-doctor-select"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Wybór lekarza specjalisty *
                  </label>
                  <select
                    id="booking-doctor-select"
                    value={selectedDoctorId}
                    onChange={(e) => onSelectedDoctorChange(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.consultationFeePln} zł)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="booking-visit-type"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Forma konsultacji
                  </label>
                  <select
                    id="booking-visit-type"
                    value={visitType}
                    onChange={(e) =>
                      setVisitType(e.target.value as 'stacjonarna' | 'teleporada')
                    }
                    className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  >
                    <option value="stacjonarna">Wizyta w gabinecie</option>
                    <option value="teleporada">Telekonsultacja lekarska</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Preferowany dzień *
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-sky-700"
                  />
                  {errors.preferredDate && (
                    <p role="alert" className="text-xs text-red-700 mt-1">
                      {errors.preferredDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-slot"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Godzina wizyty *
                  </label>
                  <select
                    id="booking-slot"
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-sky-700"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Powód wizyty lub przyjmowane leki (opcjonalnie)
                </label>
                <input
                  id="booking-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="np. Kontrola ciśnienia tętniczego, interpretacja badań krwi"
                  className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
                >
                  Potwierdź rezerwację terminu
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Clinic Address & Live Session Bookings */}
          <div className="lg:col-span-5 space-y-8">
            <div className="pb-6 border-b border-slate-200">
              <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                Dane teleadresowe gabinetu
              </h3>
              <p className="text-sm text-slate-700 font-medium">{config.clinicName}</p>
              <p className="text-sm text-slate-600 mt-0.5">{config.streetAddress}</p>
              <p className="text-sm text-slate-600 mt-2 tabular-nums">
                Rejestracja: <strong className="text-slate-900">{config.phone}</strong> ·{' '}
                {config.email}
              </p>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Godziny przyjęć: {config.hoursWeekday} · {config.hoursSaturday}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Zarezerwowane wizyty (sesja demo)
                </h3>
                <span className="text-xs text-slate-500 tabular-nums">
                  Liczba zgłoszeń: {bookings.length}
                </span>
              </div>

              {bookings.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 border border-dashed border-slate-200 rounded-xl text-center px-4">
                  Brak zaplanowanych wizyt w bieżącej sesji. Wypełnij formularz obok, aby dodać
                  przykładowe zgłoszenie pacjenta.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
                  {bookings.map((bk) => (
                    <li key={bk.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {bk.patientName}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">{bk.doctorName}</p>
                        <p className="text-xs text-slate-500 mt-1 tabular-nums">
                          {bk.preferredDate} o {bk.preferredSlot} ·{' '}
                          {bk.visitType === 'stacjonarna' ? 'W gabinecie' : 'Teleporada'} ·{' '}
                          <span className={`font-mono ${accentClasses.textAccent}`}>
                            {bk.referenceCode}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onCancelBooking(bk.id)}
                        aria-label={`Odwołaj wizytę pacjenta ${bk.patientName}`}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
