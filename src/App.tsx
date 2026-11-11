/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import {
  DEFAULT_CLINIC_CONFIG,
  DOCTORS,
  INITIAL_BOOKINGS,
  PATIENT_OUTCOMES,
  PRICE_LIST,
  SPECIALTIES,
  type AppointmentBooking,
  type ClinicConfig,
  type SpecialtyCategory,
} from './data/clinicData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SpecialtiesSection } from './components/SpecialtiesSection';
import { DoctorsAndProofSection } from './components/DoctorsAndProofSection';
import { PricingAndBookingSection } from './components/PricingAndBookingSection';
import { DrivePublisherSection } from './components/DrivePublisherSection';

export default function App() {
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(DEFAULT_CLINIC_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState<SpecialtyCategory>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(DOCTORS[0].id);
  const [bookings, setBookings] = useState<AppointmentBooking[]>(INITIAL_BOOKINGS);
  const [quickSaveOpen, setQuickSaveOpen] = useState(false);

  const accentClasses = useMemo(() => {
    switch (clinicConfig.accentTheme) {
      case 'teal':
        return {
          buttonBg: 'bg-teal-700',
          buttonHover: 'hover:bg-teal-800',
          textAccent: 'text-teal-700',
        };
      case 'slate':
        return {
          buttonBg: 'bg-slate-800',
          buttonHover: 'hover:bg-slate-900',
          textAccent: 'text-slate-800',
        };
      case 'sapphire':
      default:
        return {
          buttonBg: 'bg-sky-700',
          buttonHover: 'hover:bg-sky-800',
          textAccent: 'text-sky-700',
        };
    }
  }, [clinicConfig.accentTheme]);

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectDoctorForBooking = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    scrollToSection('kontakt');
    setTimeout(() => {
      const nameInput = document.getElementById('booking-patient-name');
      nameInput?.focus();
    }, 250);
  };

  const handleAddBooking = (newBooking: AppointmentBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((item) => item.id !== bookingId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfd] text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      <Header
        config={clinicConfig}
        accentClasses={accentClasses}
        onJumpToPublish={() => setQuickSaveOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          config={clinicConfig}
          accentClasses={accentClasses}
          onJumpToBooking={() => scrollToSection('kontakt')}
          onJumpToPublish={() => setQuickSaveOpen(true)}
        />

        <SpecialtiesSection
          specialties={SPECIALTIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          accentClasses={accentClasses}
          onJumpToBooking={() => scrollToSection('kontakt')}
        />

        <DoctorsAndProofSection
          doctors={DOCTORS}
          outcomes={PATIENT_OUTCOMES}
          accentClasses={accentClasses}
          onSelectDoctorForBooking={handleSelectDoctorForBooking}
        />

        <PricingAndBookingSection
          config={clinicConfig}
          prices={PRICE_LIST}
          doctors={DOCTORS}
          selectedDoctorId={selectedDoctorId}
          onSelectedDoctorChange={setSelectedDoctorId}
          bookings={bookings}
          onAddBooking={handleAddBooking}
          onCancelBooking={handleCancelBooking}
          accentClasses={accentClasses}
        />

        <DrivePublisherSection
          config={clinicConfig}
          onChangeConfig={setClinicConfig}
          specialties={SPECIALTIES}
          doctors={DOCTORS}
          prices={PRICE_LIST}
          quickSaveOpen={quickSaveOpen}
          onCloseQuickSave={() => setQuickSaveOpen(false)}
          accentClasses={accentClasses}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-slate-500">
          <div>
            <p className="font-display text-sm font-bold text-slate-900 mb-1">
              {clinicConfig.clinicName}
            </p>
            <p>
              {clinicConfig.streetAddress} · {clinicConfig.registrationNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#specjalizacje" className="hover:text-slate-900 transition-colors">
              Specjalizacje
            </a>
            <a href="#zespol" className="hover:text-slate-900 transition-colors">
              Zespół lekarski
            </a>
            <a href="#wizyty" className="hover:text-slate-900 transition-colors">
              Cennik
            </a>
            <a href="#publikacja" className="hover:text-slate-900 transition-colors">
              Eksport Google Drive
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
