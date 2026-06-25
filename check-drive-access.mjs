#!/usr/bin/env node
/**
 * Drive access health check.
 *
 * Scans src/App.jsx for Google Drive file IDs in makeDriveVideos([...])
 * blocks and verifies that each file is publicly accessible via the
 * embed iframe.
 *
 * Run from the project root:
 *     node check-drive-access.mjs
 *
 * Output:
 *   - prints per-file status as it goes
 *   - writes a structured summary to drive-access-report.json
 *
 * No external dependencies. Works with Node 18+ (uses global fetch).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const APP_PATH = 'src/App.jsx';
const REPORT_PATH = 'drive-access-report.json';

const CONCURRENCY = 6;
const TIMEOUT_MS  = 12000;

// ANSI colours for the terminal
const c = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
};

// ─── 1. Parse App.jsx, pull out all makeDriveVideos([...]) entries ─────────────

function parseProjectVideos(source) {
  const startMarker = 'const projectVideos = {';
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error('could not find projectVideos object in App.jsx');

  // Find the matching closing brace by tracking depth
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx + startMarker.length - 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error('could not find end of projectVideos object');

  const block = source.slice(startIdx, endIdx + 1);

  // Each project is `key: makeDriveVideos([ ['ID', 'label'], ... ])`
  // Walk it manually for robustness
  const projectRe = /(\w+)\s*:\s*makeDriveVideos\(\s*\[([\s\S]*?)\]\s*\)/g;
  const entryRe   = /\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g;

  const projects = [];
  let m;
  while ((m = projectRe.exec(block)) !== null) {
    const [, project, arrBody] = m;
    const files = [];
    let e;
    entryRe.lastIndex = 0;
    while ((e = entryRe.exec(arrBody)) !== null) {
      files.push({ fileId: e[1], label: e[2] });
    }
    projects.push({ project, files });
  }
  return projects;
}

// ─── 2. Check one file by fetching the iframe preview URL ─────────────────────

async function checkFile(fileId) {
  const url = `https://drive.google.com/file/d/${fileId}/preview`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Pretend we're a browser; Drive serves different HTML otherwise.
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const text = await res.text();
    return classify(res.status, res.url, text);
  } catch (err) {
    return { ok: false, reason: 'network', detail: err.message };
  } finally {
    clearTimeout(timer);
  }
}

function classify(status, finalUrl, body) {
  if (status === 404) return { ok: false, reason: 'not_found',    detail: 'HTTP 404' };
  if (status === 403) return { ok: false, reason: 'forbidden',    detail: 'HTTP 403' };
  if (status >= 500)  return { ok: false, reason: 'server_error', detail: `HTTP ${status}` };

  if (finalUrl.includes('accounts.google.com')) {
    return { ok: false, reason: 'login_required', detail: 'redirected to sign-in' };
  }

  // Drive returns 200 even for restricted files; sniff the HTML
  if (/Sign in to continue|Войти в аккаунт/.test(body)) {
    return { ok: false, reason: 'login_required', detail: 'sign-in page' };
  }
  if (/Request access|Запросить доступ/.test(body)) {
    return { ok: false, reason: 'restricted', detail: 'access request page' };
  }
  if (/File not found|Файл не найден|Sorry, the file you have requested does not exist/.test(body)) {
    return { ok: false, reason: 'not_found', detail: 'file deleted' };
  }
  if (/has been moved to the trash|перемещён в корзину/i.test(body)) {
    return { ok: false, reason: 'trashed', detail: 'in trash' };
  }
  // Good preview pages embed a `<title>FILENAME - Google Drive</title>` and
  // a `videoplayback` or `lottie` reference.
  if (/<title>[^<]+- Google Drive<\/title>/.test(body)) {
    return { ok: true, reason: 'public', detail: 'preview page reachable' };
  }

  // Default: assume OK if we got HTML back without a known error marker.
  return { ok: true, reason: 'assumed_ok', detail: `HTTP ${status}, no error markers` };
}

// ─── 3. Concurrency helper ───────────────────────────────────────────────────

async function runPool(tasks, size) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

// ─── 4. Main ─────────────────────────────────────────────────────────────────

const REASON_LABELS = {
  public:          { c: c.green,  emoji: '✓', desc: 'Доступен' },
  assumed_ok:      { c: c.green,  emoji: '✓', desc: 'Доступен (предположительно)' },
  restricted:      { c: c.red,    emoji: '✗', desc: 'НЕТ ДОСТУПА — нужно "Anyone with the link"' },
  login_required:  { c: c.red,    emoji: '✗', desc: 'Требует входа в Google' },
  not_found:       { c: c.red,    emoji: '✗', desc: 'Файл не найден (удалён?)' },
  trashed:         { c: c.red,    emoji: '✗', desc: 'В корзине' },
  forbidden:       { c: c.red,    emoji: '✗', desc: 'HTTP 403 (запрещено)' },
  server_error:    { c: c.yellow, emoji: '!', desc: 'Ошибка сервера Drive' },
  network:         { c: c.yellow, emoji: '!', desc: 'Сетевая ошибка' },
};

async function main() {
  const source = await readFile(APP_PATH, 'utf-8');
  const projects = parseProjectVideos(source);
  const totalFiles = projects.reduce((s, p) => s + p.files.length, 0);

  console.log(`${c.bold}Drive access health-check${c.reset}`);
  console.log(`${c.dim}${projects.length} проектов, ${totalFiles} файлов${c.reset}\n`);

  const start = performance.now();

  const checks = [];
  for (const { project, files } of projects) {
    for (const file of files) {
      checks.push({ project, file });
    }
  }

  // Pretty header
  const PROJ_W = 14;
  const LABEL_W = 24;

  const tasks = checks.map(({ project, file }, idx) => async () => {
    const result = await checkFile(file.fileId);
    const meta = REASON_LABELS[result.reason] ?? { c: c.dim, emoji: '?', desc: result.reason };
    const projStr  = project.padEnd(PROJ_W).slice(0, PROJ_W);
    const labelStr = file.label.padEnd(LABEL_W).slice(0, LABEL_W);
    const idShort  = file.fileId.slice(0, 12) + '…';
    const progress = `${(idx + 1).toString().padStart(2)}/${checks.length}`;
    console.log(
      `${c.dim}${progress}${c.reset}  ${meta.c}${meta.emoji}${c.reset}  ` +
      `${c.bold}${projStr}${c.reset}  ${labelStr}  ${c.dim}${idShort}${c.reset}  ` +
      `${meta.c}${meta.desc}${c.reset}`
    );
    return {
      project, fileId: file.fileId, label: file.label,
      ok: result.ok, reason: result.reason, detail: result.detail,
    };
  });

  const results = await runPool(tasks, CONCURRENCY);
  const seconds = ((performance.now() - start) / 1000).toFixed(1);

  // Summary by status
  const byReason = {};
  for (const r of results) {
    byReason[r.reason] = (byReason[r.reason] ?? 0) + 1;
  }
  const broken = results.filter(r => !r.ok);

  console.log('\n' + '─'.repeat(80));
  console.log(`${c.bold}Итого:${c.reset}  ${results.length} файлов за ${seconds} сек`);
  for (const [reason, n] of Object.entries(byReason)) {
    const meta = REASON_LABELS[reason] ?? { c: c.dim, desc: reason };
    console.log(`  ${meta.c}${(meta.emoji ?? '·')} ${reason.padEnd(16)} ${n}${c.reset}  ${c.dim}${meta.desc}${c.reset}`);
  }

  if (broken.length) {
    console.log(`\n${c.red}${c.bold}Нужно починить (${broken.length}):${c.reset}`);
    // Group broken files by project for the user's convenience
    const byProject = {};
    for (const r of broken) {
      (byProject[r.project] ??= []).push(r);
    }
    for (const [project, items] of Object.entries(byProject)) {
      console.log(`\n  ${c.bold}${project}${c.reset}`);
      for (const r of items) {
        const meta = REASON_LABELS[r.reason] ?? { c: c.dim, desc: r.reason };
        console.log(`    ${meta.c}${meta.emoji}${c.reset}  ${r.label.padEnd(20)}  ${c.dim}https://drive.google.com/file/d/${r.fileId}/view${c.reset}`);
        console.log(`        ${c.dim}${meta.desc}${c.reset}`);
      }
    }
  } else {
    console.log(`\n${c.green}${c.bold}Все файлы доступны.${c.reset}`);
  }

  await writeFile(REPORT_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalFiles: results.length,
    durationSec: Number(seconds),
    summary: byReason,
    results,
  }, null, 2));
  console.log(`\n${c.dim}Полный отчёт: ${REPORT_PATH}${c.reset}`);
}

main().catch(err => {
  console.error(`${c.red}Ошибка:${c.reset}`, err);
  process.exit(1);
});
