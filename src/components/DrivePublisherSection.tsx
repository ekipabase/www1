import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  Eye,
  HardDrive,
  RefreshCw,
  Share2,
  Trash2,
  UploadCloud,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  DEFAULT_CLINIC_CONFIG,
  type ClinicConfig,
  type DoctorProfile,
  type ServicePriceRow,
  type SpecialtyItem,
} from '../data/clinicData';
import {
  buildDriveFileName,
  generateStandaloneClinicHtml,
} from '../utils/siteGenerator';
import {
  deleteDriveFile,
  DriveAuthExpiredError,
  getAccessToken,
  googleSignIn,
  initAuth,
  listPublishedDriveFiles,
  logout,
  shareDriveFileAnyoneWithLink,
  updateHtmlOnDrive,
  uploadFormattedDocToDrive,
  uploadHtmlToDrive,
  type DrivePublishedFile,
} from '../services/googleDriveService';

interface DrivePublisherSectionProps {
  config: ClinicConfig;
  onChangeConfig: (next: ClinicConfig) => void;
  specialties: SpecialtyItem[];
  doctors: DoctorProfile[];
  prices: ServicePriceRow[];
  quickSaveOpen: boolean;
  onCloseQuickSave: () => void;
  accentClasses: {
    buttonBg: string;
    buttonHover: string;
    textAccent: string;
  };
}

type PendingConfirmAction =
  | {
      kind: 'overwrite';
      file: DrivePublishedFile;
    }
  | {
      kind: 'delete';
      file: DrivePublishedFile;
    }
  | {
      kind: 'share';
      file: DrivePublishedFile;
    };

const THEME_OPTIONS: { value: ClinicConfig['accentTheme']; label: string }[] = [
  { value: 'sapphire', label: 'Szafirowy kliniczny' },
  { value: 'teal', label: 'Morski medyczny' },
  { value: 'slate', label: 'Grafitowy gabinetowy' },
];

export function DrivePublisherSection({
  config,
  onChangeConfig,
  specialties,
  doctors,
  prices,
  quickSaveOpen,
  onCloseQuickSave,
  accentClasses,
}: DrivePublisherSectionProps) {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [driveFiles, setDriveFiles] = useState<DrivePublishedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareOnCreate, setShareOnCreate] = useState(false);
  const [autoSaveOnLogin, setAutoSaveOnLogin] = useState(true);
  const [alsoCreateGoogleDoc, setAlsoCreateGoogleDoc] = useState(true);

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
    linkUrl?: string;
    linkLabel?: string;
  } | null>(null);

  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'rendered' | 'source'>('rendered');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmAction | null>(null);
  const [isExecutingConfirm, setIsExecutingConfirm] = useState(false);

  const generatedHtml = useMemo(
    () => generateStandaloneClinicHtml(config, specialties, doctors, prices),
    [config, specialties, doctors, prices]
  );

  const targetFileName = useMemo(
    () => buildDriveFileName(config.clinicName),
    [config.clinicName]
  );

  const htmlSizeKb = useMemo(
    () => (new TextEncoder().encode(generatedHtml).length / 1024).toFixed(1),
    [generatedHtml]
  );

  const refreshFiles = useCallback(async (activeToken: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await listPublishedDriveFiles(activeToken);
      setDriveFiles(files);
    } catch (err) {
      if (err instanceof DriveAuthExpiredError) {
        setNeedsAuth(true);
        setToken(null);
      }
      setStatusBanner({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Nie udało się pobrać listy opublikowanych plików z Google Drive.',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        setNeedsAuth(false);
        void refreshFiles(authToken);
      },
      () => {
        setNeedsAuth(true);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, [refreshFiles]);

  const performSaveToDrive = async (activeToken: string) => {
    setIsPublishing(true);
    setStatusBanner(null);
    try {
      const uploadedHtml = await uploadHtmlToDrive(
        activeToken,
        targetFileName,
        generatedHtml,
        config.clinicName
      );

      if (shareOnCreate && uploadedHtml.id) {
        await shareDriveFileAnyoneWithLink(activeToken, uploadedHtml.id);
      }

      let uploadedDoc: DrivePublishedFile | null = null;
      if (alsoCreateGoogleDoc) {
        uploadedDoc = await uploadFormattedDocToDrive(
          activeToken,
          config.clinicName,
          generatedHtml
        );
        if (shareOnCreate && uploadedDoc.id) {
          await shareDriveFileAnyoneWithLink(activeToken, uploadedDoc.id);
        }
      }

      await refreshFiles(activeToken);
      setStatusBanner({
        type: 'success',
        message: uploadedDoc
          ? `Zapisano plik HTML („${uploadedHtml.name}”) oraz czytelny podgląd Google Docs na Twoim Dysku Google.`
          : `Zapisano kompletną stronę „${uploadedHtml.name}” na Twoim Dysku Google.`,
        linkUrl: uploadedDoc?.webViewLink || uploadedHtml.webViewLink,
        linkLabel: uploadedDoc
          ? 'Otwórz podgląd strony w Google Drive'
          : 'Otwórz plik HTML w Google Drive',
      });
    } catch (err) {
      if (err instanceof DriveAuthExpiredError) {
        setNeedsAuth(true);
        setToken(null);
      }
      setStatusBanner({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Wystąpił błąd podczas zapisywania strony na Google Drive.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGoogleLogin = async (saveImmediately = autoSaveOnLogin) => {
    setIsLoggingIn(true);
    setStatusBanner(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        if (saveImmediately) {
          await performSaveToDrive(result.accessToken);
        } else {
          await refreshFiles(result.accessToken);
        }
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        message:
          err instanceof Error
            ? `Logowanie Google nie powiodło się: ${err.message}`
            : 'Logowanie Google zostało przerwane lub zablokowane przez przeglądarkę.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setNeedsAuth(true);
    setStatusBanner(null);
  };

  const handlePublishNewFile = async () => {
    const activeToken = token ?? (await getAccessToken());
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }
    await performSaveToDrive(activeToken);
  };

  const handleExecuteConfirmedAction = async () => {
    if (!pendingConfirm) return;
    const activeToken = token ?? (await getAccessToken());
    if (!activeToken) {
      setPendingConfirm(null);
      setNeedsAuth(true);
      return;
    }

    setIsExecutingConfirm(true);
    setStatusBanner(null);
    try {
      if (pendingConfirm.kind === 'overwrite') {
        const updated = await updateHtmlOnDrive(
          activeToken,
          pendingConfirm.file.id,
          targetFileName,
          generatedHtml
        );
        await refreshFiles(activeToken);
        setStatusBanner({
          type: 'success',
          message: `Zaktualizowano zawartość pliku „${updated.name}” na Google Drive.`,
          linkUrl: updated.webViewLink,
          linkLabel: 'Zobacz zaktualizowany plik',
        });
      } else if (pendingConfirm.kind === 'share') {
        await shareDriveFileAnyoneWithLink(activeToken, pendingConfirm.file.id);
        await refreshFiles(activeToken);
        setStatusBanner({
          type: 'success',
          message: `Włączono dostęp publiczny z linkiem dla pliku „${pendingConfirm.file.name}”.`,
          linkUrl: pendingConfirm.file.webViewLink,
          linkLabel: 'Otwórz udostępniony link',
        });
      } else if (pendingConfirm.kind === 'delete') {
        await deleteDriveFile(activeToken, pendingConfirm.file.id);
        await refreshFiles(activeToken);
        setStatusBanner({
          type: 'success',
          message: `Usunięto plik „${pendingConfirm.file.name}” z Google Drive.`,
        });
      }
      setPendingConfirm(null);
    } catch (err) {
      if (err instanceof DriveAuthExpiredError) {
        setNeedsAuth(true);
        setToken(null);
      }
      setStatusBanner({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Operacja na Google Drive zakończyła się niepowodzeniem.',
      });
      setPendingConfirm(null);
    } finally {
      setIsExecutingConfirm(false);
    }
  };

  const handleDownloadLocalHtml = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = targetFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // Fallback ignored silently
    }
  };

  return (
    <section id="publikacja" className="py-16 md:py-24 bg-[#f1f5f9] border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs text-slate-600 mb-2">
            Personalizacja wizytówki · Bezpośredni eksport HTML5 do chmury Google Workspace
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 text-balance">
            Studio dostosowania i publikacji strony na Google Drive
          </h2>
          <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
            Dostosuj nazwę gabinetu, dane kierownika medycznego oraz kontakt, a następnie zapisz
            gotową, samodzielną witrynę HTML bezpośrednio na swoim koncie Google Drive.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Live Clinic Customizer */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="font-display text-lg font-bold text-slate-900">
                1. Dane praktyki lekarskiej (edycja na żywo)
              </h3>
              <button
                type="button"
                onClick={() => onChangeConfig(DEFAULT_CLINIC_CONFIG)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Przywróć dane domyślne
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cfg-clinic-name"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Nazwa placówki lub gabinetu
                  </label>
                  <input
                    id="cfg-clinic-name"
                    type="text"
                    value={config.clinicName}
                    onChange={(e) => onChangeConfig({ ...config, clinicName: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-lead-doctor"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Kierownik medyczny / główny lekarz
                  </label>
                  <input
                    id="cfg-lead-doctor"
                    type="text"
                    value={config.leadDoctor}
                    onChange={(e) => onChangeConfig({ ...config, leadDoctor: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cfg-city"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Miasto i dzielnica
                  </label>
                  <input
                    id="cfg-city"
                    type="text"
                    value={config.cityAndDistrict}
                    onChange={(e) =>
                      onChangeConfig({ ...config, cityAndDistrict: e.target.value })
                    }
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-phone"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Telefon rejestracji
                  </label>
                  <input
                    id="cfg-phone"
                    type="text"
                    value={config.phone}
                    onChange={(e) => onChangeConfig({ ...config, phone: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:border-sky-700"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cfg-street"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Dokładny adres gabinetu
                </label>
                <input
                  id="cfg-street"
                  type="text"
                  value={config.streetAddress}
                  onChange={(e) => onChangeConfig({ ...config, streetAddress: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                />
              </div>

              <div>
                <label
                  htmlFor="cfg-headline"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Nagłówek główny strony
                </label>
                <input
                  id="cfg-headline"
                  type="text"
                  value={config.heroHeadline}
                  onChange={(e) => onChangeConfig({ ...config, heroHeadline: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-700"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Kolor akcentu eksportowanej witryny
                </span>
                <div
                  role="group"
                  aria-label="Wybór motywu kolorystycznego"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
                >
                  {THEME_OPTIONS.map((opt) => {
                    const active = config.accentTheme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChangeConfig({ ...config, accentTheme: opt.value })}
                        className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreviewMode('rendered');
                  setShowHtmlModal(true);
                }}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>Podgląd gotowej strony i kodu ({htmlSizeKb} KB)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadLocalHtml}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Pobierz plik .html lokalnie</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Google Drive Authentication & Publishing */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  2. Publikacja witryny na Google Drive
                </h3>
                <HardDrive className={`w-5 h-5 shrink-0 ${accentClasses.textAccent}`} aria-hidden="true" />
              </div>

              <p className="text-xs text-slate-500 tabular-nums pb-6 mb-6 border-b border-slate-200">
                Docelowy plik eksportu: <span className="font-mono text-slate-800">{targetFileName}</span> ·
                Rozmiar: {htmlSizeKb} KB
              </p>

            {statusBanner && (
              <div
                role={statusBanner.type === 'error' ? 'alert' : 'status'}
                className={`mb-6 p-4 rounded-lg border text-sm ${
                  statusBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {statusBanner.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="space-y-1.5">
                    <p className="font-medium leading-snug">{statusBanner.message}</p>
                    {statusBanner.linkUrl && (
                      <a
                        href={statusBanner.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4"
                      >
                        <span>{statusBanner.linkLabel || 'Otwórz w Google Drive'}</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {needsAuth || !token ? (
              <div className="pb-2 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1.5">
                    Połącz swoje konto Google, aby zapisać stronę na Google Drive
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Aplikacja zapisuje pliki wyłącznie za Twoją zgodą na Twoim koncie Google Drive.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveOnLogin}
                    onChange={(e) => setAutoSaveOnLogin(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300"
                  />
                  <span>
                    Zapisz stronę <strong className="font-mono text-slate-900">{targetFileName}</strong>{' '}
                    automatycznie zaraz po zalogowaniu kontem Google
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoCreateGoogleDoc}
                    onChange={(e) => setAlsoCreateGoogleDoc(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300"
                  />
                  <span>
                    Utwórz dodatkowo czytelny podgląd w Dokumentach Google na Dysku
                  </span>
                </label>

                {/* Official Google Sign-In Button per Workspace Integration Guidelines */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => void handleGoogleLogin(autoSaveOnLogin)}
                    disabled={isLoggingIn || isPublishing}
                    className="gsi-material-button"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon" aria-hidden="true">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          className="block w-5 h-5"
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isLoggingIn || isPublishing
                          ? 'Zapisywanie na Google Drive...'
                          : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 text-xs text-slate-600">
                  <span>
                    Połączono jako:{' '}
                    <strong className="text-slate-900">{user?.email || user?.displayName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Wyloguj konto Google
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoCreateGoogleDoc}
                      onChange={(e) => setAlsoCreateGoogleDoc(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300"
                    />
                    <span>
                      Zapisz obok pliku <span className="font-mono">.html</span> również sformatowany
                      podgląd w Dokumentach Google
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareOnCreate}
                      onChange={(e) => setShareOnCreate(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300"
                    />
                    <span>
                      Ustaw uprawnienia „Każdy, kto ma link — przeglądający” dla zapisywanych plików
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePublishNewFile}
                      disabled={isPublishing}
                      className={`min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
                    >
                      <UploadCloud className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {isPublishing
                          ? 'Zapisywanie na Google Drive...'
                          : 'Opublikuj stronę na Google Drive'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => token && void refreshFiles(token)}
                      disabled={isLoadingFiles}
                      aria-label="Odśwież listę plików z Google Drive"
                      className="min-h-[44px] px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>Odśwież listę</span>
                    </button>
                  </div>
                </div>

                {/* Published Files List on Google Drive */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 mb-3">
                    Pliki witryn utworzone przez tę aplikację na Twoim Google Drive (
                    <span className="tabular-nums">{driveFiles.length}</span>)
                  </h4>

                  {isLoadingFiles ? (
                    <p className="text-xs text-slate-500 py-4">
                      Pobieranie listy plików z Google Drive...
                    </p>
                  ) : driveFiles.length === 0 ? (
                    <p className="text-xs text-slate-500 py-5 px-4 border border-dashed border-slate-200 rounded-lg text-center">
                      Brak zapisanych witryn na Google Drive. Kliknij „Opublikuj stronę na Google
                      Drive”, aby utworzyć pierwszy plik.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {driveFiles.map((file) => {
                        const formattedDate = file.modifiedTime
                          ? new Date(file.modifiedTime).toLocaleString('pl-PL', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Brak daty';
                        return (
                          <li key={file.id} className="py-3.5 space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                                  Ostatnia zmiana: {formattedDate} ·{' '}
                                  {file.shared ? 'Udostępniony linkiem' : 'Prywatny na dysku'}
                                </p>
                              </div>

                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs font-semibold inline-flex items-center gap-1 hover:underline underline-offset-4 whitespace-nowrap shrink-0 ${accentClasses.textAccent}`}
                                >
                                  <span>Otwórz w Drive</span>
                                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                </a>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingConfirm({ kind: 'overwrite', file })
                                }
                                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Nadpisz aktualną wersją
                              </button>

                              {!file.shared && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingConfirm({ kind: 'share', file })
                                  }
                                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  <Share2 className="w-3 h-3" aria-hidden="true" />
                                  <span>Udostępnij linkiem</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setPendingConfirm({ kind: 'delete', file })
                                }
                                aria-label={`Usuń plik ${file.name} z Google Drive`}
                                className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                                <span>Usuń</span>
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
            </div>

            {/* Specification of what gets exported to Google Drive */}
            <div className="pt-6 mt-6 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-800 mb-3">
                Zawartość eksportowanego pakietu witryny lekarskiej
              </p>
              <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                <li>
                  Kompletny, responsywny plik <span className="font-mono text-slate-800">.html</span> gotowy
                  do otwarcia w przeglądarce lub wdrożenia na dowolnej domenie gabinetu.
                </li>
                <li>
                  Sekcje poradni, profile lekarzy z numerami PWZ, przejrzysty cennik badań oraz
                  interaktywny formularz kontaktowy pacjenta.
                </li>
                <li>
                  Możliwość bezpiecznej aktualizacji istniejącej wersji pliku na Google Drive lub
                  udostępnienia jej linkiem współpracownikom.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Confirmation Modal for Mutating / Destructive Google Drive Operations */}
      {pendingConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-confirm-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 id="drive-confirm-title" className="font-display text-lg font-bold text-slate-900 mb-2">
              {pendingConfirm.kind === 'delete'
                ? 'Usunąć plik z Google Drive?'
                : pendingConfirm.kind === 'overwrite'
                  ? 'Nadpisać istniejący plik na Google Drive?'
                  : 'Udostępnić plik publicznym linkiem?'}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {pendingConfirm.kind === 'delete' && (
                <>
                  Czy na pewno chcesz trwale usunąć plik{' '}
                  <strong className="text-slate-900">„{pendingConfirm.file.name}”</strong> ze swojego
                  konta Google Drive? Tej operacji nie można cofnąć.
                </>
              )}
              {pendingConfirm.kind === 'overwrite' && (
                <>
                  Zawartość pliku{' '}
                  <strong className="text-slate-900">„{pendingConfirm.file.name}”</strong> na Google
                  Drive zostanie zastąpiona bieżącą wersją szablonu ({targetFileName}).
                </>
              )}
              {pendingConfirm.kind === 'share' && (
                <>
                  Plik <strong className="text-slate-900">„{pendingConfirm.file.name}”</strong>{' '}
                  otrzyma uprawnienie odczytu dla każdej osoby posiadającej bezpośredni link Google
                  Drive.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                disabled={isExecutingConfirm}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                disabled={isExecutingConfirm}
                className={`min-h-[40px] px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  pendingConfirm.kind === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : `${accentClasses.buttonBg} ${accentClasses.buttonHover}`
                }`}
              >
                {isExecutingConfirm
                  ? 'Wykonywanie...'
                  : pendingConfirm.kind === 'delete'
                    ? 'Potwierdź usunięcie'
                    : 'Potwierdź operację'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone HTML Source Preview Modal */}
      {showHtmlModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="html-preview-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-5xl w-full h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 id="html-preview-title" className="font-display text-base font-bold text-slate-900">
                  Podgląd publikowanego pliku ({targetFileName})
                </h3>
                <p className="text-xs text-slate-500">
                  Samodzielny dokument HTML5 przygotowany do zapisu na Google Drive
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  role="group"
                  aria-label="Tryb podglądu eksportu"
                  className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
                >
                  <button
                    type="button"
                    aria-pressed={previewMode === 'rendered'}
                    onClick={() => setPreviewMode('rendered')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      previewMode === 'rendered'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Widok strony
                  </button>
                  <button
                    type="button"
                    aria-pressed={previewMode === 'source'}
                    onClick={() => setPreviewMode('source')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      previewMode === 'source'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Kod HTML</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHtmlModal(false)}
                  aria-label="Zamknij podgląd kodu HTML"
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {previewMode === 'rendered' ? (
              <div className="flex-1 bg-slate-100 overflow-hidden">
                <iframe
                  title={`Podgląd wygenerowanej witryny ${targetFileName}`}
                  srcDoc={generatedHtml}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            ) : (
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
                <pre className="whitespace-pre-wrap break-words">{generatedHtml}</pre>
              </div>
            )}

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 tabular-nums">
                Rozmiar dokumentu: {htmlSizeKb} KB
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="min-h-[38px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedHtml ? 'Skopiowano do schowka' : 'Kopiuj kod HTML'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHtmlModal(false)}
                  className={`min-h-[38px] px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
                >
                  Zamknij podgląd
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Quick-Save to Google Drive Dialog (opened from Top Bar / Hero CTA) */}
      {quickSaveOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-save-drive-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 md:p-7 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3
                  id="quick-save-drive-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Zapisz stronę na Google Drive
                </h3>
                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                  Plik: <span className="font-mono text-slate-800">{targetFileName}</span> ({htmlSizeKb} KB)
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseQuickSave}
                aria-label="Zamknij okno zapisu na Google Drive"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {statusBanner && (
              <div
                role={statusBanner.type === 'error' ? 'alert' : 'status'}
                className={`mb-5 p-3.5 rounded-lg border text-sm ${
                  statusBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <p className="font-medium leading-snug">{statusBanner.message}</p>
                {statusBanner.linkUrl && (
                  <a
                    href={statusBanner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4"
                  >
                    <span>{statusBanner.linkLabel || 'Otwórz w Google Drive'}</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoCreateGoogleDoc}
                  onChange={(e) => setAlsoCreateGoogleDoc(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>
                  Zapisz zarówno gotowy plik witryny <span className="font-mono">.html</span>, jak i
                  sformatowany podgląd w Dokumentach Google
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareOnCreate}
                  onChange={(e) => setShareOnCreate(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>
                  Włącz udostępnianie publicznym linkiem (Każdy, kto ma link — przeglądający)
                </span>
              </label>
            </div>

            {needsAuth || !token ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kliknij poniżej, aby potwierdzić dostęp za Twoją zgodą i{' '}
                  <strong className="text-slate-900">natychmiast zapisać stronę</strong> na Twoim
                  Dysku Google:
                </p>

                <button
                  type="button"
                  onClick={() => void handleGoogleLogin(true)}
                  disabled={isLoggingIn || isPublishing}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon" aria-hidden="true">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="block w-5 h-5"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoggingIn || isPublishing
                        ? 'Zapisywanie na Google Drive...'
                        : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-600">
                  Konto: <strong className="text-slate-900">{user?.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={handlePublishNewFile}
                  disabled={isPublishing}
                  className={`min-h-[42px] px-5 py-2 text-sm font-semibold text-white rounded-lg inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 ${accentClasses.buttonBg} ${accentClasses.buttonHover}`}
                >
                  <UploadCloud className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {isPublishing ? 'Zapisywanie...' : 'Zapisz teraz na Google Drive'}
                  </span>
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadLocalHtml}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pobierz plik .html na komputer</span>
              </button>
              <button
                type="button"
                onClick={onCloseQuickSave}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
