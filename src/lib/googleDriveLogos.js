// ─── GOOGLE DRIVE LOGOS MODULE ────────────────────────────────────────────────
//
// Готовый модуль для подключения Google Drive API.
//
// НАСТРОЙКА:
//   1. Google Cloud Console → APIs & Services → Library → включите "Google Drive API"
//   2. Credentials → Create API Key (ограничьте по HTTP-referrer вашего домена)
//   3. Создайте .env.local в корне проекта:
//        VITE_GDRIVE_FOLDER_ID=ваш_folder_id
//        VITE_GDRIVE_API_KEY=ваш_api_key
//   4. FOLDER_ID — ID папки в Drive (из URL: drive.google.com/drive/folders/FOLDER_ID)
//   5. Раскомментируйте fetchLogosFromDrive ниже
//   6. В PartnersSection.jsx раскомментируйте вызов useEffect с API
//
// ──────────────────────────────────────────────────────────────────────────────

const LOGO_KEYWORDS   = ['logo', 'логотип', 'лого', 'brand', 'фирменный', 'айдентика'];
const IMAGE_MIME_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

// Ключевые слова, которые убираем из названия папки при генерации имени компании
const GENERIC_SUFFIXES = /\s*(проект|project|ролик|ролики|видео|video|съёмка|реклама|рекламный|презентация|docs?|photo|фото|материалы|архив)\s*$/gi;
const LEADING_NUMBERS  = /^\d+[\s_\-\.]+/;

export function isLogoFile(fileName, mimeType) {
  if (!IMAGE_MIME_TYPES.includes(mimeType)) return false;
  const lower = fileName.toLowerCase();
  return LOGO_KEYWORDS.some(kw => lower.includes(kw));
}

export function extractCompanyName(folderName) {
  return folderName
    .replace(LEADING_NUMBERS, '')
    .replace(GENERIC_SUFFIXES, '')
    .trim()
    || folderName.trim();
}

// ─── MAIN FETCH FUNCTION ──────────────────────────────────────────────────────
// Раскомментируйте когда будут готовы API-ключи.
//
// export async function fetchLogosFromDrive(folderId, apiKey) {
//   const BASE = 'https://www.googleapis.com/drive/v3';
//   const seen    = new Set();
//   const results = [];
//
//   async function scanFolder(parentId) {
//     let pageToken = null;
//     do {
//       const params = new URLSearchParams({
//         q:        `'${parentId}' in parents and trashed = false`,
//         key:      apiKey,
//         fields:   'nextPageToken, files(id, name, mimeType)',
//         pageSize: '1000',
//         ...(pageToken ? { pageToken } : {}),
//       });
//       const res  = await fetch(`${BASE}/files?${params}`);
//       const data = await res.json();
//
//       if (!data.files) {
//         console.error('[googleDriveLogos] Drive API error:', data);
//         break;
//       }
//
//       for (const file of data.files) {
//         if (file.mimeType === FOLDER_MIME_TYPE) {
//           // Рекурсивно обходим подпапки
//           await scanFolder(file.id);
//         } else if (isLogoFile(file.name, file.mimeType) && !seen.has(file.id)) {
//           seen.add(file.id);
//           results.push({
//             id:                  file.id,
//             companyName:         extractCompanyName(file.name.replace(/\.[^.]+$/, '')),
//             logoUrl:             `https://drive.google.com/uc?export=view&id=${file.id}`,
//             isGeneratedFallback: false,
//             wide:                false,
//           });
//         }
//       }
//       pageToken = data.nextPageToken ?? null;
//     } while (pageToken);
//   }
//
//   await scanFolder(folderId);
//   return results;
// }
//
// ─── ИСПОЛЬЗОВАНИЕ В КОМПОНЕНТЕ ───────────────────────────────────────────────
//
// import { fetchLogosFromDrive } from '../lib/googleDriveLogos';
// import { PARTNER_LOGOS } from '../data/partnersLogos';
//
// const FOLDER_ID = import.meta.env.VITE_GDRIVE_FOLDER_ID;
// const API_KEY   = import.meta.env.VITE_GDRIVE_API_KEY;
//
// const [logos, setLogos] = useState(PARTNER_LOGOS);
//
// useEffect(() => {
//   if (!FOLDER_ID || !API_KEY) return;
//   fetchLogosFromDrive(FOLDER_ID, API_KEY)
//     .then(driveLogos => {
//       // Дедупликация: Drive логотипы заменяют заглушки с тем же именем
//       const byName = new Map(driveLogos.map(l => [l.companyName.toLowerCase(), l]));
//       const merged = PARTNER_LOGOS.map(local =>
//         byName.get(local.companyName.toLowerCase()) ?? local
//       );
//       // Добавляем логотипы из Drive, которых нет в локальном списке
//       driveLogos.forEach(dl => {
//         if (!merged.find(m => m.id === dl.id)) merged.push(dl);
//       });
//       setLogos(merged);
//     })
//     .catch(err => console.warn('[googleDriveLogos] Using local fallback:', err));
// }, []);
// ──────────────────────────────────────────────────────────────────────────────
