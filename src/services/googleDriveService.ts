import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { buildMultipartDrivePayload } from '../utils/siteGenerator';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'consent',
});

let isSigningIn = false;
// In-memory cache only (never localStorage or sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;

export interface DrivePublishedFile {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
  modifiedTime?: string;
  size?: string;
  shared?: boolean;
}

export class DriveAuthExpiredError extends Error {
  constructor(message = 'Sesja Google wygasła. Zaloguj się ponownie, aby kontynuować.') {
    super(message);
    this.name = 'DriveAuthExpiredError';
  }
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Nie udało się pobrać tokenu dostępu do usługi Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async (): Promise<void> => {
  await auth.signOut();
  cachedAccessToken = null;
};

async function handleDriveResponse<T>(res: Response): Promise<T> {
  if (res.status === 401 || res.status === 403) {
    if (res.status === 401) {
      cachedAccessToken = null;
      throw new DriveAuthExpiredError();
    }
    const errBody = await res.json().catch(() => ({}));
    const message =
      errBody?.error?.message ||
      'Brak uprawnień do wykonania operacji na Google Drive. Sprawdź przyznany dostęp.';
    throw new Error(message);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message =
      errBody?.error?.message || `Błąd komunikacji z Google Drive (kod ${res.status}).`;
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function listPublishedDriveFiles(accessToken: string): Promise<DrivePublishedFile[]> {
  const query = encodeURIComponent(
    "trashed = false and (mimeType = 'text/html' or mimeType = 'application/vnd.google-apps.document')"
  );
  const fields = encodeURIComponent(
    'files(id,name,webViewLink,webContentLink,modifiedTime,size,shared)'
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=20&fields=${fields}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await handleDriveResponse<{ files?: DrivePublishedFile[] }>(res);
  return data.files ?? [];
}

export async function uploadHtmlToDrive(
  accessToken: string,
  fileName: string,
  htmlContent: string,
  clinicName: string
): Promise<DrivePublishedFile> {
  const { body, contentType } = buildMultipartDrivePayload(
    {
      name: fileName,
      mimeType: 'text/html',
      description: `Strona demonstracyjna praktyki lekarskiej: ${clinicName}`,
    },
    htmlContent
  );

  const fields = encodeURIComponent('id,name,webViewLink,webContentLink,modifiedTime,size,shared');
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${fields}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
      },
      body,
    }
  );

  return handleDriveResponse<DrivePublishedFile>(res);
}

export async function uploadFormattedDocToDrive(
  accessToken: string,
  clinicName: string,
  htmlContent: string
): Promise<DrivePublishedFile> {
  const cleanTitle = `${clinicName.trim() || 'Medica Nova'} — Strona WWW Demo (Podgląd)`;
  const { body, contentType } = buildMultipartDrivePayload(
    {
      name: cleanTitle,
      mimeType: 'application/vnd.google-apps.document',
      description: `Sformatowany podgląd strony demonstracyjnej gabinetu: ${clinicName}`,
    },
    htmlContent
  );

  const fields = encodeURIComponent('id,name,webViewLink,webContentLink,modifiedTime,size,shared');
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=${fields}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
      },
      body,
    }
  );

  return handleDriveResponse<DrivePublishedFile>(res);
}

export async function updateHtmlOnDrive(
  accessToken: string,
  fileId: string,
  fileName: string,
  htmlContent: string
): Promise<DrivePublishedFile> {
  const { body, contentType } = buildMultipartDrivePayload(
    {
      name: fileName,
      mimeType: 'text/html',
    },
    htmlContent
  );

  const fields = encodeURIComponent('id,name,webViewLink,webContentLink,modifiedTime,size,shared');
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=${fields}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
      },
      body,
    }
  );

  return handleDriveResponse<DrivePublishedFile>(res);
}

export async function shareDriveFileAnyoneWithLink(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    }
  );

  await handleDriveResponse<unknown>(res);
}

export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await handleDriveResponse<void>(res);
}
