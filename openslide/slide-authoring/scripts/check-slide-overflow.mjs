#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const slideId = process.argv[2];
if (!slideId) {
  console.error('Usage: node check-slide-overflow.mjs <slide-id> [--url=http://127.0.0.1:5173]');
  process.exit(2);
}

const urlArg = process.argv.find((arg) => arg.startsWith('--url='));
const explicitBaseUrl = urlArg ? urlArg.slice('--url='.length).replace(/\/$/, '') : null;
const candidates = explicitBaseUrl
  ? [explicitBaseUrl]
  : Array.from({ length: 10 }, (_, i) => `http://127.0.0.1:${5173 + i}`);

function runAgentBrowser(args) {
  return execFileSync('agent-browser', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

async function findBaseUrl() {
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { signal: AbortSignal.timeout(700) });
      if (response.ok) return candidate;
    } catch {
      // Try the next common Vite port.
    }
  }
  throw new Error(`No OpenSlide dev server found. Tried: ${candidates.join(', ')}`);
}

function parsePageCount(snapshot) {
  const match = snapshot.match(/Notes page \d+\/(\d+)/) || snapshot.match(/01 \/ (\d+)/);
  if (!match) throw new Error('Could not detect page count from OpenSlide snapshot.');
  return Number(match[1]);
}

const measurementScript = String.raw`(() => {
  const SAFE_BOTTOM = 900;
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const canvases = [...document.querySelectorAll('[data-osd-canvas]')];
  const canvas = canvases
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0)
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.element;
  if (!canvas) return { ok: false, errors: ['Missing visible [data-osd-canvas].'] };

  const canvasRect = canvas.getBoundingClientRect();
  const scale = canvasRect.width / CANVAS_WIDTH;
  const toCanvas = (rect) => ({
    left: (rect.left - canvasRect.left) / scale,
    top: (rect.top - canvasRect.top) / scale,
    right: (rect.right - canvasRect.left) / scale,
    bottom: (rect.bottom - canvasRect.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  });

  const contentRoots = [...canvas.querySelectorAll('[data-slide-content]')];
  const pageRoots = [...canvas.querySelectorAll('[data-slide-page]')];
  const roots = contentRoots.length ? contentRoots : pageRoots.flatMap((page) => [...page.children].filter((child) => !child.closest('[data-slide-footer]')));
  if (!roots.length) return { ok: false, errors: ['No [data-slide-content] roots found. Add data-slide-content to main content wrappers.'] };

  const offenders = [];
  for (const root of roots) {
    const elements = [root, ...root.querySelectorAll('*')];
    for (const element of elements) {
      if (element.closest('[data-slide-footer]')) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      const rect = toCanvas(element.getBoundingClientRect());
      if (rect.width < 1 || rect.height < 1) continue;
      const text = (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90);
      const tag = element.tagName.toLowerCase();
      const label = element.getAttribute('data-slide-content') || element.getAttribute('data-overflow-label') || text || tag;
      if (rect.bottom > SAFE_BOTTOM || rect.top < -1 || rect.left < -1 || rect.right > CANVAS_WIDTH + 1 || rect.bottom > CANVAS_HEIGHT + 1) {
        offenders.push({ tag, label, rect: Object.fromEntries(Object.entries(rect).map(([key, value]) => [key, Math.round(value)])) });
      }
    }
  }

  return {
    ok: offenders.length === 0,
    safeBottom: SAFE_BOTTOM,
    canvas: { width: Math.round(canvasRect.width), height: Math.round(canvasRect.height), scale: Number(scale.toFixed(4)) },
    offenders: offenders.slice(0, 20),
  };
})()`;

try {
  const baseUrl = await findBaseUrl();
  const firstUrl = `${baseUrl}/s/${encodeURIComponent(slideId)}?p=1`;
  runAgentBrowser(['set', 'viewport', '1920', '1080']);
  runAgentBrowser(['open', firstUrl]);
  runAgentBrowser(['wait', '--load', 'networkidle']);
  const pageCount = parsePageCount(runAgentBrowser(['snapshot', '-i']));

  const failures = [];
  for (let page = 1; page <= pageCount; page += 1) {
    runAgentBrowser(['open', `${baseUrl}/s/${encodeURIComponent(slideId)}?p=${page}`]);
    runAgentBrowser(['wait', '350']);
    const raw = runAgentBrowser(['eval', measurementScript]);
    const parsed = JSON.parse(raw);
    if (!parsed.ok) failures.push({ page, ...parsed });
    else console.log(`page ${String(page).padStart(2, '0')}/${pageCount}: ok`);
  }

  if (failures.length) {
    console.error(`Overflow check failed for ${slideId}:`);
    for (const failure of failures) {
      console.error(`- page ${failure.page}: safeBottom=${failure.safeBottom}`);
      if (failure.errors) for (const error of failure.errors) console.error(`  ${error}`);
      for (const offender of failure.offenders || []) {
        console.error(`  ${offender.tag} bottom=${offender.rect.bottom} right=${offender.rect.right}: ${offender.label}`);
      }
    }
    process.exit(1);
  }

  console.log(`Overflow check passed for ${slideId} (${pageCount} pages).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
