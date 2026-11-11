import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDriveFileName,
  buildMultipartDrivePayload,
  escapeHtml,
  filterSpecialtiesByCategory,
  generateStandaloneClinicHtml,
  validateBookingInput,
} from './siteGenerator';
import type { ClinicConfig, DoctorProfile, ServicePriceRow, SpecialtyItem } from '../data/clinicData';

const SAMPLE_CONFIG: ClinicConfig = {
  clinicName: 'Klinika Świętego Łukasza & Wspólnicy',
  leadDoctor: 'dr n. med. Anna Kowalczyk',
  cityAndDistrict: 'Kraków · Stare Miasto',
  streetAddress: 'ul. Długa 18, 31-146 Kraków',
  phone: '+48 12 400 10 20',
  email: 'kontakt@lukasz-demo.pl',
  hoursWeekday: 'Pon.–Pt. 08:00–19:00',
  hoursSaturday: 'Sob. 09:00–14:00',
  heroHeadline: 'Nowoczesna kardiologia i interna w centrum Krakowa.',
  heroSubheadline: 'Konsultacje bez kolejek z pełnym zapleczem diagnostycznym.',
  accentTheme: 'teal',
  registrationNote: 'Podmiot leczniczy RPWDL',
};

const SAMPLE_SPECIALTIES: SpecialtyItem[] = [
  {
    id: 'sp-1',
    indexLabel: '01. Kardiologia',
    title: 'Echo serca i Holter',
    category: 'diagnostics',
    summary: 'Diagnostyka kardiologiczna.',
    waitTime: '48 h',
    procedures: ['UKG', 'EKG'],
  },
  {
    id: 'sp-2',
    indexLabel: '02. Interna',
    title: 'Konsultacje internistyczne',
    category: 'consultations',
    summary: 'Opieka internistyczna.',
    waitTime: '24 h',
    procedures: ['Wywiad', 'Badanie'],
  },
];

const SAMPLE_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-1',
    name: 'dr n. med. Anna Kowalczyk',
    specialty: 'Kardiolog',
    pwz: 'PWZ 4829104',
    experienceYears: 15,
    languages: 'Polski',
    bio: 'Doświadczony kardiolog.',
    availabilityLabel: 'Wtorki',
    consultationFeePln: 320,
    imageUrl: '/placeholder.jpg',
    imageAlt: 'Portret',
  },
];

const SAMPLE_PRICES: ServicePriceRow[] = [
  {
    id: 'pr-1',
    code: 'K-01',
    name: 'Konsultacja kardiologiczna',
    department: 'Kardiologia',
    durationMinutes: 30,
    pricePln: 320,
    preparation: 'Brak',
  },
];

test('buildDriveFileName normalizes Polish diacritics and special characters', () => {
  assert.equal(
    buildDriveFileName('Klinika Świętego Łukasza & Wspólnicy!'),
    'klinika-swietego-lukasza-wspolnicy-strona-demo.html'
  );
  assert.equal(buildDriveFileName('   '), 'gabinet-lekarski-strona-demo.html');
});

test('filterSpecialtiesByCategory filters accurately', () => {
  assert.equal(filterSpecialtiesByCategory(SAMPLE_SPECIALTIES, 'all').length, 2);
  assert.equal(filterSpecialtiesByCategory(SAMPLE_SPECIALTIES, 'diagnostics').length, 1);
  assert.equal(filterSpecialtiesByCategory(SAMPLE_SPECIALTIES, 'consultations')[0]?.id, 'sp-2');
});

test('validateBookingInput enforces required fields and formats without silent fallback', () => {
  const invalidErrors = validateBookingInput({
    patientName: 'Jan',
    patientPhone: '12345',
    patientEmail: 'zly-email',
    doctorId: '',
    visitType: 'stacjonarna',
    preferredDate: '',
    preferredSlot: '',
    notes: '',
  });

  assert.ok(invalidErrors.patientName);
  assert.ok(invalidErrors.patientPhone);
  assert.ok(invalidErrors.patientEmail);
  assert.ok(invalidErrors.doctorId);
  assert.ok(invalidErrors.preferredDate);
  assert.ok(invalidErrors.preferredSlot);

  const validErrors = validateBookingInput({
    patientName: 'Janusz Majewski',
    patientPhone: '+48 602 441 890',
    patientEmail: 'janusz@example.pl',
    doctorId: 'doc-1',
    visitType: 'stacjonarna',
    preferredDate: '2026-11-20',
    preferredSlot: '11:00',
    notes: 'Pierwsza wizyta',
  });

  assert.deepEqual(validErrors, {});
});

test('generateStandaloneClinicHtml escapes HTML entities and includes clinic content', () => {
  const html = generateStandaloneClinicHtml(
    SAMPLE_CONFIG,
    SAMPLE_SPECIALTIES,
    SAMPLE_DOCTORS,
    SAMPLE_PRICES
  );

  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('Klinika Świętego Łukasza &amp; Wspólnicy'));
  assert.ok(html.includes('#0f766e')); // teal theme accent
  assert.ok(html.includes('320 zł'));
  assert.equal(escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
});

test('buildMultipartDrivePayload creates valid RFC2387 multipart/related payload for Google Drive v3', () => {
  const { body, contentType } = buildMultipartDrivePayload(
    { name: 'test-demo.html', mimeType: 'text/html' },
    '<html><body>Test</body></html>',
    'custom_boundary'
  );

  assert.equal(contentType, 'multipart/related; boundary=custom_boundary');
  assert.ok(body.includes('Content-Type: application/json; charset=UTF-8'));
  assert.ok(body.includes('"name":"test-demo.html"'));
  assert.ok(body.includes('Content-Type: text/html; charset=UTF-8'));
  assert.ok(body.includes('<html><body>Test</body></html>'));
  assert.ok(body.endsWith('--custom_boundary--'));
});
