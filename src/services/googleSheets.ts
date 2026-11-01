import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { FranchiseLead } from '../data/redGroomData';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
// Strictly keep OAuth access token in memory per Workspace security rules
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
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

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Fetches spreadsheet metadata first to discover the actual first sheet/tab name
 * (never hardcoding "Sheet1" per Workspace integration best practices).
 */
export async function getPrimarySheetTitle(
  spreadsheetId: string,
  accessToken: string
): Promise<{ spreadsheetTitle: string; firstSheetName: string }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error al leer metadatos de Google Sheets (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const spreadsheetTitle = data.properties?.title || 'Hoja de Prospectos RED GROOM';
  const firstSheetName = data.sheets?.[0]?.properties?.title || 'Prospectos';
  return { spreadsheetTitle, firstSheetName };
}

/**
 * Creates a brand new Google Spreadsheet for RED GROOM leads and formats the header row.
 */
export async function createLeadsSpreadsheet(
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `RED GROOM - Prospectos Microfranquicias (${new Date().toISOString().slice(0, 10)})`,
      },
      sheets: [
        {
          properties: {
            title: 'Prospectos',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`No se pudo crear la hoja de cálculo (${createRes.status}): ${errText}`);
  }

  const created = await createRes.json();
  const spreadsheetId: string = created.spreadsheetId;
  const spreadsheetUrl: string =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  const sheetName: string = created.sheets?.[0]?.properties?.title || 'Prospectos';

  const headerRow = [
    [
      'ID Registro',
      'Fecha y Hora',
      'Ciudad',
      'Nombre Completo',
      'WhatsApp',
      'Correo Electrónico',
      'Experiencia en Mascotas',
      'Dispone de Local',
      'Presupuesto Disponible',
      'Tiempo Estimado de Inicio',
      'Estado Comercial',
      'Notas',
    ],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(`${sheetName}!A1:L1`)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: headerRow }),
    }
  );

  return { spreadsheetId, spreadsheetUrl, sheetName };
}

/**
 * Appends a single lead or syncs all leads into the target Google Sheet.
 */
export async function syncLeadsToGoogleSheet(
  spreadsheetId: string,
  leads: FranchiseLead[],
  accessToken: string
): Promise<{ updatedRows: number; sheetName: string }> {
  const { firstSheetName } = await getPrimarySheetTitle(spreadsheetId, accessToken);

  const headerRow = [
    'ID Registro',
    'Fecha y Hora',
    'Ciudad',
    'Nombre Completo',
    'WhatsApp',
    'Correo Electrónico',
    'Experiencia en Mascotas',
    'Dispone de Local',
    'Presupuesto Disponible',
    'Tiempo Estimado de Inicio',
    'Estado Comercial',
    'Notas',
  ];

  const rows = leads.map((lead) => [
    lead.id,
    lead.createdAt,
    lead.city,
    lead.fullName,
    lead.whatsapp,
    lead.email,
    lead.hasPetExperience,
    lead.hasPremises,
    lead.availableBudget,
    lead.startTimeline,
    lead.status,
    lead.notes || '',
  ]);

  const values = [headerRow, ...rows];
  const range = `${firstSheetName}!A1:L${values.length}`;

  const putRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`Error al sincronizar prospectos (${putRes.status}): ${errText}`);
  }

  return { updatedRows: rows.length, sheetName: firstSheetName };
}

/**
 * Appends a single new lead to the connected Google Sheet if the user has an active token.
 */
export async function appendLeadToGoogleSheet(
  spreadsheetId: string,
  lead: FranchiseLead,
  accessToken: string
): Promise<boolean> {
  const { firstSheetName } = await getPrimarySheetTitle(spreadsheetId, accessToken);
  const row = [
    [
      lead.id,
      lead.createdAt,
      lead.city,
      lead.fullName,
      lead.whatsapp,
      lead.email,
      lead.hasPetExperience,
      lead.hasPremises,
      lead.availableBudget,
      lead.startTimeline,
      lead.status,
      lead.notes || '',
    ],
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(
      `${firstSheetName}!A:L`
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: row }),
    }
  );

  return res.ok;
}
