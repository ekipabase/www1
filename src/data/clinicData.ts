import heroClinicImg from '../assets/images/hero_medical_clinic_1794352809133.jpg';
import diagnosticsSuiteImg from '../assets/images/diagnostics_cardiology_suite_1794352810025.jpg';
import doctorAnnaImg from '../assets/images/doctor_anna_kowalczyk_1794352810361.jpg';
import doctorPiotrImg from '../assets/images/doctor_piotr_zielinski_1794352812022.jpg';
import doctorMartaImg from '../assets/images/doctor_marta_nowakowska_1794352810979.jpg';

export type SpecialtyCategory = 'all' | 'diagnostics' | 'consultations';

export interface ClinicConfig {
  clinicName: string;
  leadDoctor: string;
  cityAndDistrict: string;
  streetAddress: string;
  phone: string;
  email: string;
  hoursWeekday: string;
  hoursSaturday: string;
  heroHeadline: string;
  heroSubheadline: string;
  accentTheme: 'sapphire' | 'teal' | 'slate';
  registrationNote: string;
}

export interface SpecialtyItem {
  id: string;
  indexLabel: string;
  title: string;
  category: Exclude<SpecialtyCategory, 'all'>;
  summary: string;
  waitTime: string;
  procedures: string[];
  featured?: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  pwz: string;
  experienceYears: number;
  languages: string;
  bio: string;
  availabilityLabel: string;
  consultationFeePln: number;
  imageUrl: string;
  imageAlt: string;
}

export interface ServicePriceRow {
  id: string;
  code: string;
  name: string;
  department: string;
  durationMinutes: number;
  pricePln: number;
  preparation: string;
}

export interface PatientOutcome {
  id: string;
  patientName: string;
  context: string;
  quote: string;
  measurableOutcome: string;
}

export interface AppointmentBooking {
  id: string;
  referenceCode: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  visitType: 'stacjonarna' | 'teleporada';
  preferredDate: string;
  preferredSlot: string;
  notes: string;
  createdAtIso: string;
}

export const CLINIC_IMAGES = {
  heroClinic: heroClinicImg,
  diagnosticsSuite: diagnosticsSuiteImg,
  doctorAnna: doctorAnnaImg,
  doctorPiotr: doctorPiotrImg,
  doctorMarta: doctorMartaImg,
};

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  clinicName: 'Medica Nova',
  leadDoctor: 'dr n. med. Anna Kowalczyk',
  cityAndDistrict: 'Warszawa · Mokotów',
  streetAddress: 'ul. Puławska 142, lok. U4, 02-624 Warszawa',
  phone: '+48 22 490 82 10',
  email: 'rejestracja@medicanova-demo.pl',
  hoursWeekday: 'Pon.–Pt. 07:30–20:00',
  hoursSaturday: 'Sob. 08:30–14:30',
  heroHeadline: 'Diagnostyka specjalistyczna i opieka lekarska bez pośpiechu.',
  heroSubheadline:
    'Prywatna praktyka lekarska łącząca konsultacje kardiologiczne, internistyczne i dermatologiczne z pełnym zapleczem USG na miejscu w trakcie jednej wizyty.',
  accentTheme: 'sapphire',
  registrationNote: 'Podmiot leczniczy wpisany do RPWDL · Wizyty prywatne i pakiety partnerskie',
};

export const SPECIALTIES: SpecialtyItem[] = [
  {
    id: 'kardiologia',
    indexLabel: '01. Kardiologia i Diagnostyka Nieinwazyjna',
    title: 'Pełny bilans układu krążenia podczas jednej wizyty',
    category: 'diagnostics',
    summary:
      'Konsultacja kardiologiczna połączona z badaniem echokardiograficznym serca (UKG), EKG spoczynkowym 12-odprowadzeniowym oraz założeniem 24- lub 72-godzinnego rejestratora Holter EKG i ciśnieniowego RR.',
    waitTime: 'Dostępność w ciągu 48 h',
    procedures: [
      'Echokardiografia przezklatkowa z oceną przepływów Doppler',
      'Holter EKG 3/12-kanałowy oraz Holter ciśnieniowy ABPM',
      'Kwalifikacja kardiologiczna przed zabiegami operacyjnymi i aktywnością sportową',
    ],
    featured: true,
    imageUrl: diagnosticsSuiteImg,
    imageAlt: 'Gabinet diagnostyki echokardiograficznej i USG wyposażony w aparat ultrasonograficzny',
  },
  {
    id: 'interna',
    indexLabel: '02. Choroby Wewnętrzne i Medycyna Prewencyjna',
    title: 'Kompleksowa diagnostyka przyczyn przewlekłego zmęczenia i zaburzeń metabolicznych',
    category: 'consultations',
    summary:
      'Pogłębiony wywiad lekarski (30 minut na pacjenta), interpretacja szerokich paneli laboratoryjnych, prowadzenie nadciśnienia tętniczego, insulinooporności oraz chorób tarczycy.',
    waitTime: 'Wizyty tego samego dnia',
    procedures: [
      'Indywidualny roczny plan badań profilaktycznych po 40. roku życia',
      'Wystawianie e-Recept, e-Skierowań oraz e-ZLA z dokumentacją elektroniczną EDM',
    ],
  },
  {
    id: 'dermatologia',
    indexLabel: '03. Dermatologia Kliniczna i Wideodermatoskopia',
    title: 'Cyfrowe mapowanie znamion barwnikowych i leczenie dermatoz',
    category: 'diagnostics',
    summary:
      'Ocena zmian skórnych w powiększeniu optycznym 70x z archiwizacją porównawczą obrazów, diagnostyka trądziku dorosłych, atopowego zapalenia skóry oraz chorób skóry owłosionej głowy.',
    waitTime: 'Dostępność w 3 dni robocze',
    procedures: [
      'Wideodermatoskopia całego ciała z raportem fotograficznym dla pacjenta',
      'Kriochirurgiczne i elektrokoagulacyjne usuwanie łagodnych zmian skórnych',
    ],
  },
  {
    id: 'usg',
    indexLabel: '04. Pracownia Ultrasonografii Klinicznej',
    title: 'Badania USG z natychmiastowym opisem i dokumentacją obrazową',
    category: 'diagnostics',
    summary:
      'Badania wykonywane na miejscu przez lekarzy klinicystów. Pacjent opuszcza gabinet z pełnym opisem lekarskim i zaleceniami dalszego postępowania.',
    waitTime: 'Opis w 15 minut po badaniu',
    procedures: [
      'USG tarczycy, przytarczyc i węzłów chłonnych szyi',
      'USG jamy brzusznej oraz układu moczowego z oceną zalegania',
      'USG Doppler tętnic szyjnych i naczyń żylnych kończyn dolnych',
    ],
  },
];

export const DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-kowalczyk',
    name: 'dr n. med. Anna Kowalczyk',
    specialty: 'Specjalista kardiolog · Echokardiografista',
    pwz: 'PWZ 4829104',
    experienceYears: 16,
    languages: 'Polski · Angielski',
    bio: 'Wieloletni starszy asystent w klinice kardiologii zachowawczej. Specjalizuje się w diagnostyce nadciśnienia opornego, zaburzeń rytmu serca oraz echokardiografii obciążeniowej i przezklatkowej.',
    availabilityLabel: 'Wtorki, Czwartki · 08:00–16:00',
    consultationFeePln: 320,
    imageUrl: doctorAnnaImg,
    imageAlt: 'Portret dr n. med. Anny Kowalczyk w jasnym gabinecie lekarskim',
  },
  {
    id: 'doc-zielinski',
    name: 'dr hab. n. med. Piotr Zieliński',
    specialty: 'Specjalista chorób wewnętrznych i hipertensjologii',
    pwz: 'PWZ 3190482',
    experienceYears: 21,
    languages: 'Polski · Angielski · Niemiecki',
    bio: 'Prowadzi pacjentów wielochorobowych wymagających koordynacji farmakoterapii. Autor publikacji z zakresu prewencji sercowo-naczyniowej i leczenia zaburzeń lipidowych.',
    availabilityLabel: 'Poniedziałki, Środy, Piątki · 09:00–18:00',
    consultationFeePln: 300,
    imageUrl: doctorPiotrImg,
    imageAlt: 'Portret dr. hab. n. med. Piotra Zielińskiego przy biurku konsultacyjnym',
  },
  {
    id: 'doc-nowakowska',
    name: 'lek. Marta Nowakowska',
    specialty: 'Specjalista dermatolog-wenerolog',
    pwz: 'PWZ 6712039',
    experienceYears: 11,
    languages: 'Polski · Angielski',
    bio: 'Zajmuje się wczesnym wykrywaniem nowotworów skóry metodą wideodermatoskopii cyfrowej oraz nowoczesnym leczeniem przewlekłych chorób zapalnych skóry u dorosłych i młodzieży.',
    availabilityLabel: 'Wtorki, Piątki, Soboty · 08:30–15:30',
    consultationFeePln: 280,
    imageUrl: doctorMartaImg,
    imageAlt: 'Portret lek. Marty Nowakowskiej w gabinecie dermatologicznym',
  },
];

export const PRICE_LIST: ServicePriceRow[] = [
  {
    id: 'srv-1',
    code: 'KARD-01',
    name: 'Konsultacja kardiologiczna + EKG spoczynkowe + Echo serca (UKG)',
    department: 'Kardiologia',
    durationMinutes: 40,
    pricePln: 460,
    preparation: 'Zabierz dotychczasową dokumentację i listę przyjmowanych leków',
  },
  {
    id: 'srv-2',
    code: 'KARD-02',
    name: 'Konsultacja kardiologiczna z oceną EKG',
    department: 'Kardiologia',
    durationMinutes: 30,
    pricePln: 320,
    preparation: 'Pomiary domowe ciśnienia z ostatnich 7 dni',
  },
  {
    id: 'srv-3',
    code: 'INT-01',
    name: 'Konsultacja internistyczna rozszerzona (pierwszorazowa)',
    department: 'Choroby wewnętrzne',
    durationMinutes: 30,
    pricePln: 300,
    preparation: 'Wyniki morfologii, glukozy, lipidogramu i TSH z ostatnich 6 mies.',
  },
  {
    id: 'srv-4',
    code: 'DERM-01',
    name: 'Konsultacja dermatologiczna z wideodermatoskopią znamion',
    department: 'Dermatologia',
    durationMinutes: 30,
    pricePln: 340,
    preparation: 'Skóra bez makijażu i samoopalacza w dniu badania',
  },
  {
    id: 'srv-5',
    code: 'USG-01',
    name: 'USG jamy brzusznej i przestrzeni zaotrzewnowej z opisem',
    department: 'Diagnostyka USG',
    durationMinutes: 25,
    pricePln: 250,
    preparation: 'Na czczo minimum 6 godzin przed badaniem, niegazowana woda',
  },
  {
    id: 'srv-6',
    code: 'USG-02',
    name: 'USG Doppler żył lub tętnic kończyn dolnych',
    department: 'Diagnostyka USG',
    durationMinutes: 30,
    pricePln: 290,
    preparation: 'Nie wymaga specjalnego przygotowania',
  },
];

export const PATIENT_OUTCOMES: PatientOutcome[] = [
  {
    id: 'out-1',
    patientName: 'Marek S., 54 lata',
    context: 'Pacjent poradni kardiologicznej · Warszawa',
    quote:
      'Przez dwa lata szukałem przyczyny skoków ciśnienia wieczorami. Na pierwszej wizycie wykonano od razu echo serca i założono Holter ciśnieniowy, a po korekcie dawkowania leków ciśnienie ustabilizowało się w ciągu trzech tygodni.',
    measurableOutcome: 'Spadek średniego RR z 158/96 do 124/78 mmHg w 21 dni',
  },
  {
    id: 'out-2',
    patientName: 'Katarzyna W., 39 lat',
    context: 'Pacjentka poradni dermatologicznej · Piaseczno',
    quote:
      'Coroczna wideodermatoskopia pozwoliła wychwycić subtelną zmianę barwnikową na plecach na bardzo wczesnym etapie. Otrzymałam pełny raport zdjęciowy i szybkie skierowanie na bezpieczne wycięcie chirurgiczne.',
    measurableOutcome: 'Porównawcza mapa 42 znamion w 30 minut bez oczekiwania na opis',
  },
];

export const INITIAL_BOOKINGS: AppointmentBooking[] = [
  {
    id: 'bk-seed-1',
    referenceCode: 'MN-2026-841',
    patientName: 'Tomasz Kamiński (wizyta przykładowa)',
    patientPhone: '+48 601 234 567',
    patientEmail: 't.kaminski@przyklad.pl',
    doctorId: 'doc-kowalczyk',
    doctorName: 'dr n. med. Anna Kowalczyk',
    visitType: 'stacjonarna',
    preferredDate: '2026-11-12',
    preferredSlot: '10:30',
    notes: 'Kontrola po badaniu Holter EKG',
    createdAtIso: '2026-11-10T09:15:00.000Z',
  },
];
