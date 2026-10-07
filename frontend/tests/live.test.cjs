const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');

function load(file, globals = {}, mocks = {}) {
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const context = {
    exports: {},
    require(id) { return mocks[id] || require(id); },
    process: { env: { NEXT_PUBLIC_API_URL: 'http://localhost:8000' } },
    ...globals,
  };
  vm.runInNewContext(outputText, context);
  return context.exports;
}

test('live proxy forwards the partner session without caching', async () => {
  const route = load('src/app/api/mediafiles/live/route.ts', {
    async fetch(url, options) {
      assert.equal(url, 'http://localhost:8000/api/mediafiles/live/');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.headers.Cookie, 'sessionid=test-session');
      return Response.json({ title: 'Sunday', is_live: true });
    },
  });
  const response = await route.GET(new Request('http://localhost/api/mediafiles/live/', {
    headers: { Cookie: 'sessionid=test-session' },
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).is_live, true);
});

test('live proxy reports backend failures', async () => {
  const route = load('src/app/api/mediafiles/live/route.ts', {
    fetch: async () => { throw new Error('offline'); },
  });
  assert.equal((await route.GET(new Request('http://localhost/api/mediafiles/live/'))).status, 503);
});

function renderPage(status, error = false) {
  const icon = () => React.createElement('span');
  const page = load('src/app/partnership/(dashboard)/live/page.tsx', {}, {
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    'lucide-react': { CalendarDays: icon, PlayCircle: icon, Radio: icon },
    '../../../../hooks/useLivestream': { useLivestream: () => ({ status, loading: false, error }) },
  });
  return renderToStaticMarkup(React.createElement(page.default));
}

test('live page embeds the configured video with an accessible title', () => {
  const html = renderPage({
    title: 'Sunday service', is_live: true,
    embed_url: 'https://www.youtube-nocookie.com/embed/abcdefghijk',
    next_broadcast_at: null, offline_message: '',
  });
  assert.match(html, /<iframe/);
  assert.match(html, /title="Sunday service"/);
  assert.match(html, /youtube-nocookie.com\/embed\/abcdefghijk/);
  assert.match(html, /Live Now/);
});

test('offline page shows schedule and previous messages', () => {
  const html = renderPage({
    title: 'Sunday service', is_live: false, embed_url: null,
    next_broadcast_at: '2026-10-04T10:00:00Z', offline_message: 'See you soon',
  });
  assert.match(html, /We’re currently offline/);
  assert.match(html, /Next scheduled broadcast/);
  assert.match(html, /See you soon/);
  assert.match(html, /href="\/prophecies"/);
  assert.doesNotMatch(html, /<iframe/);
});

test('unavailable status is not presented as offline', () => {
  const html = renderPage(null, true);
  assert.match(html, /Broadcast status is unavailable/);
  assert.doesNotMatch(html, /We’re currently offline/);
});
