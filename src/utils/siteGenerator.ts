import type {
  ClinicConfig,
  DoctorProfile,
  ServicePriceRow,
  SpecialtyCategory,
  SpecialtyItem,
} from '../data/clinicData';

export interface BookingFormInput {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  visitType: 'stacjonarna' | 'teleporada';
  preferredDate: string;
  preferredSlot: string;
  notes: string;
}

export interface ValidationErrors {
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId?: string;
  preferredDate?: string;
  preferredSlot?: string;
}

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildDriveFileName(clinicName: string): string {
  const polishMap: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
    Ą: 'a',
    Ć: 'c',
    Ę: 'e',
    Ł: 'l',
    Ń: 'n',
    Ó: 'o',
    Ś: 's',
    Ź: 'z',
    Ż: 'z',
  };

  const normalized = clinicName
    .trim()
    .split('')
    .map((ch) => polishMap[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const slug = normalized || 'gabinet-lekarski';
  return `${slug}-strona-demo.html`;
}

export function filterSpecialtiesByCategory(
  items: SpecialtyItem[],
  category: SpecialtyCategory
): SpecialtyItem[] {
  if (category === 'all') {
    return items;
  }
  return items.filter((item) => item.category === category);
}

export function validateBookingInput(input: BookingFormInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const trimmedName = input.patientName.trim();
  if (trimmedName.length < 3 || !trimmedName.includes(' ')) {
    errors.patientName = 'Podaj imię i nazwisko pacjenta (minimum dwa człony).';
  }

  const digitsOnly = input.patientPhone.replace(/[^\d]/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 13) {
    errors.patientPhone = 'Podaj prawidłowy numer telefonu (min. 9 cyfr).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(input.patientEmail.trim())) {
    errors.patientEmail = 'Podaj prawidłowy adres e-mail do potwierdzenia wizyty.';
  }

  if (!input.doctorId.trim()) {
    errors.doctorId = 'Wybierz specjalistę z listy.';
  }

  if (!input.preferredDate.trim()) {
    errors.preferredDate = 'Wybierz preferowaną datę konsultacji.';
  }

  if (!input.preferredSlot.trim()) {
    errors.preferredSlot = 'Wybierz godzinę wizyty.';
  }

  return errors;
}

export function resolveAccentColors(theme: ClinicConfig['accentTheme']): {
  primaryHex: string;
  primaryHoverHex: string;
  softBgHex: string;
} {
  switch (theme) {
    case 'teal':
      return {
        primaryHex: '#0f766e',
        primaryHoverHex: '#115e59',
        softBgHex: '#f0fdfa',
      };
    case 'slate':
      return {
        primaryHex: '#1e293b',
        primaryHoverHex: '#0f172a',
        softBgHex: '#f1f5f9',
      };
    case 'sapphire':
    default:
      return {
        primaryHex: '#0369a1',
        primaryHoverHex: '#075985',
        softBgHex: '#f0f9ff',
      };
  }
}

export function generateStandaloneClinicHtml(
  config: ClinicConfig,
  specialties: SpecialtyItem[],
  doctors: DoctorProfile[],
  prices: ServicePriceRow[]
): string {
  const colors = resolveAccentColors(config.accentTheme);
  const safeName = escapeHtml(config.clinicName.trim() || 'Praktyka Lekarska');
  const safeHeadline = escapeHtml(config.heroHeadline.trim());
  const safeSubheadline = escapeHtml(config.heroSubheadline.trim());
  const safeCity = escapeHtml(config.cityAndDistrict.trim());
  const safeStreet = escapeHtml(config.streetAddress.trim());
  const safePhone = escapeHtml(config.phone.trim());
  const safeEmail = escapeHtml(config.email.trim());
  const safeWeekday = escapeHtml(config.hoursWeekday.trim());
  const safeSaturday = escapeHtml(config.hoursSaturday.trim());
  const safeLead = escapeHtml(config.leadDoctor.trim());
  const safeRegNote = escapeHtml(config.registrationNote.trim());

  const specialtiesHtml = specialties
    .map(
      (sp) => `
      <article class="card">
        <p class="index-label">${escapeHtml(sp.indexLabel)}</p>
        <h3>${escapeHtml(sp.title)}</h3>
        <p class="muted">${escapeHtml(sp.summary)}</p>
        <ul class="clean-list">
          ${sp.procedures.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
        <p class="meta-line">${escapeHtml(sp.waitTime)}</p>
      </article>`
    )
    .join('\n');

  const doctorsHtml = doctors
    .map(
      (doc) => `
      <article class="card">
        <h3>${escapeHtml(doc.name)}</h3>
        <p class="meta-line">${escapeHtml(doc.specialty)} · ${escapeHtml(doc.pwz)} · ${doc.experienceYears} lat praktyki</p>
        <p class="muted">${escapeHtml(doc.bio)}</p>
        <p class="meta-line">${escapeHtml(doc.availabilityLabel)} · Wizyta od <strong class="tabular">${doc.consultationFeePln} zł</strong></p>
      </article>`
    )
    .join('\n');

  const priceRowsHtml = prices
    .map(
      (row) => `
      <tr>
        <td>
          <strong>${escapeHtml(row.name)}</strong>
          <div class="sub-cell">${escapeHtml(row.preparation)}</div>
        </td>
        <td>${escapeHtml(row.department)}</td>
        <td class="tabular">${row.durationMinutes} min</td>
        <td class="tabular price-col">${row.pricePln} zł</td>
      </tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName} — Prywatna Praktyka Lekarska (${safeCity})</title>
  <meta name="description" content="${safeSubheadline}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #fafbfd;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #475569;
      --accent: ${colors.primaryHex};
      --accent-hover: ${colors.primaryHoverHex};
      --accent-soft: ${colors.softBgHex};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, .brand { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; letter-spacing: -0.02em; }
    .tabular { font-variant-numeric: tabular-nums; }
    .container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
    header {
      background: rgba(255, 255, 255, 0.94);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(8px);
    }
    .nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      height: 72px;
    }
    .brand { font-size: 1.25rem; font-weight: 700; color: var(--text); text-decoration: none; white-space: nowrap; }
    nav { display: flex; gap: 28px; }
    nav a { color: var(--muted); text-decoration: none; font-size: 0.9375rem; font-weight: 500; white-space: nowrap; }
    nav a:hover { color: var(--text); text-decoration: underline; text-underline-offset: 4px; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      background: var(--accent);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.9375rem;
      border-radius: 8px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn:hover { background: var(--accent-hover); }
    .hero { padding: 72px 0 56px; border-bottom: 1px solid var(--border); }
    .meta-kicker { font-size: 0.85rem; color: var(--muted); margin-bottom: 16px; }
    .hero h1 { font-size: clamp(2.1rem, 4vw, 3.35rem); line-height: 1.12; max-width: 18ch; margin-bottom: 20px; text-wrap: balance; }
    .hero p.lead { font-size: 1.08rem; color: var(--muted); max-width: 62ch; margin-bottom: 28px; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
    }
    .kpi-val { font-size: 1.75rem; font-weight: 700; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; }
    .kpi-lbl { font-size: 0.85rem; color: var(--muted); margin-top: 4px; }
    section { padding: 64px 0; border-bottom: 1px solid var(--border); }
    .sec-head { margin-bottom: 36px; max-width: 64ch; }
    .sec-head h2 { font-size: 1.85rem; margin-bottom: 10px; }
    .sec-head p { color: var(--muted); }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 24px; }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
    }
    .index-label { font-size: 0.82rem; font-weight: 600; color: var(--accent); margin-bottom: 8px; }
    .card h3 { font-size: 1.2rem; margin-bottom: 10px; }
    .muted { color: var(--muted); font-size: 0.95rem; margin-bottom: 16px; }
    .clean-list { padding-left: 18px; color: var(--text); font-size: 0.9rem; margin-bottom: 16px; }
    .clean-list li { margin-bottom: 6px; }
    .meta-line { font-size: 0.82rem; color: var(--muted); padding-top: 12px; border-top: 1px solid var(--border); }
    table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    th, td { text-align: left; padding: 16px 20px; border-bottom: 1px solid var(--border); font-size: 0.9375rem; }
    th { background: #f8fafc; font-weight: 600; color: var(--muted); font-size: 0.82rem; }
    .sub-cell { font-size: 0.8rem; color: var(--muted); margin-top: 3px; }
    .price-col { font-weight: 700; text-align: right; white-space: nowrap; }
    .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; align-items: start; }
    .form-row { margin-bottom: 14px; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; }
    input, select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.95rem;
    }
    #booking-msg { margin-top: 14px; font-size: 0.9rem; color: var(--accent); font-weight: 600; display: none; }
    footer { padding: 40px 0; color: var(--muted); font-size: 0.85rem; }
    @media (max-width: 768px) {
      nav { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container nav-bar">
      <a href="#" class="brand">${safeName}</a>
      <nav>
        <a href="#specjalizacje">Specjalizacje</a>
        <a href="#zespol">Zespół</a>
        <a href="#cennik">Cennik</a>
        <a href="#kontakt">Kontakt</a>
      </nav>
      <a href="#kontakt" class="btn">Umów konsultację</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <p class="meta-kicker">${safeCity} · Kierownik medyczny: ${safeLead} · ${safeRegNote}</p>
        <h1>${safeHeadline}</h1>
        <p class="lead">${safeSubheadline}</p>
        <div class="hero-actions">
          <a href="#kontakt" class="btn">Zarezerwuj termin wizyty</a>
          <span class="tabular" style="font-size: 0.95rem; color: var(--muted);">Rejestracja telefoniczna: <strong>${safePhone}</strong> (${safeWeekday})</span>
        </div>
        <div class="kpi-strip">
          <div>
            <div class="kpi-val tabular">14 800+</div>
            <div class="kpi-lbl">Konsultacji specjalistycznych rocznie</div>
          </div>
          <div>
            <div class="kpi-val tabular">30 min</div>
            <div class="kpi-lbl">Gwarantowany czas pierwszorazowej wizyty</div>
          </div>
          <div>
            <div class="kpi-val tabular">98,4%</div>
            <div class="kpi-lbl">Pozytywnych ocen pacjentów w ankietach po wizycie</div>
          </div>
          <div>
            <div class="kpi-val tabular">15 min</div>
            <div class="kpi-lbl">Wydanie opisu i dokumentacji po badaniu USG</div>
          </div>
        </div>
      </div>
    </section>

    <section id="specjalizacje">
      <div class="container">
        <div class="sec-head">
          <h2>Poradnie specjalistyczne i pracownia diagnostyczna</h2>
          <p>Zakres świadczeń zaplanowany tak, aby badania obrazowe i konsultacja lekarska odbywały się podczas jednej wizyty.</p>
        </div>
        <div class="grid-2">
          ${specialtiesHtml}
        </div>
      </div>
    </section>

    <section id="zespol">
      <div class="container">
        <div class="sec-head">
          <h2>Zespół lekarski</h2>
          <p>Lekarze ze stopniami naukowymi i wieloletnim doświadczeniem klinicznym, zweryfikowani w Centralnym Rejestrze Lekarzy RP.</p>
        </div>
        <div class="grid-3">
          ${doctorsHtml}
        </div>
      </div>
    </section>

    <section id="cennik">
      <div class="container">
        <div class="sec-head">
          <h2>Przejrzysty cennik konsultacji i badań</h2>
          <p>Ceny obejmują pełną konsultację, wystawienie e-Recepty lub e-Skierowania oraz pisemne zalecenia dla pacjenta.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Świadczenie medyczne i przygotowanie</th>
              <th>Poradnia</th>
              <th>Czas trwania</th>
              <th style="text-align:right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${priceRowsHtml}
          </tbody>
        </table>
      </div>
    </section>

    <section id="kontakt">
      <div class="container contact-grid">
        <div>
          <div class="sec-head">
            <h2>Rejestracja pacjentów i adres placówki</h2>
            <p>${safeStreet}</p>
          </div>
          <p class="muted tabular">Telefon: <strong>${safePhone}</strong><br />E-mail: <strong>${safeEmail}</strong><br />Godziny przyjęć: ${safeWeekday} · ${safeSaturday}</p>
        </div>
        <form class="card" onsubmit="event.preventDefault(); document.getElementById('booking-msg').style.display='block'; this.reset();">
          <h3>Zgłoszenie rezerwacji terminu (wersja demo)</h3>
          <p class="muted">Wypełnij formularz — rejestracja oddzwoni z potwierdzeniem godziny.</p>
          <div class="form-row">
            <label for="p-name">Imię i nazwisko pacjenta</label>
            <input id="p-name" type="text" required placeholder="np. Jan Kowalski" />
          </div>
          <div class="form-row">
            <label for="p-phone">Numer telefonu</label>
            <input id="p-phone" type="tel" required placeholder="+48 600 000 000" />
          </div>
          <button type="submit" class="btn" style="width:100%;">Wyślij prośbę o kontakt z rejestracji</button>
          <p id="booking-msg">Dziękujemy! Zgłoszenie demonstracyjne zostało zapisane. Rejestracja skontaktuje się telefonicznie.</p>
        </form>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>${safeName} · ${safeStreet} · ${safeRegNote}. Strona demonstracyjna wygenerowana i opublikowana za pomocą Google Drive.</p>
    </div>
  </footer>
</body>
</html>`;
}

export function buildMultipartDrivePayload(
  metadata: { name: string; mimeType: string; description?: string },
  htmlContent: string,
  boundary = 'medica_nova_drive_boundary_2026'
): { body: string; contentType: string } {
  const openDelimiter = `--${boundary}\r\n`;
  const middleDelimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    openDelimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    middleDelimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    htmlContent +
    closeDelimiter;

  return {
    body,
    contentType: `multipart/related; boundary=${boundary}`,
  };
}
