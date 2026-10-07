const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');
function middleware() {
  const source = readFileSync(require('node:path').join(__dirname, '../src/middleware.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const context = { exports: {}, URL, require: () => ({ NextResponse }) };
  vm.runInNewContext(outputText, context);
  return context.exports.middleware;
}
test('dashboard requires a session cookie, including its root', () => {
  for (const path of ['/partnership', '/partnership/resources', '/partnership/live']) {
    const response = middleware()(new NextRequest(`https://prophetnamara.org${path}`, { headers: { cookie: 'csrftoken=csrf; analytics=1' } }));
    assert.equal(response.status, 307);
    const location = new URL(response.headers.get('location'));
    assert.equal(location.pathname, '/partnership/landing');
    assert.equal(location.searchParams.get('redirect'), path);
  }
});
test('valid session presence reaches dashboard authentication', () => {
  const response = middleware()(new NextRequest('https://prophetnamara.org/partnership', { headers: { cookie: 'sessionid=session' } }));
  assert.equal(response.headers.get('x-middleware-next'), '1');
});
test('public signup and unknown routes reach the router without login redirects', () => {
  for (const path of ['/partnership/landing', '/partnership/signup/token', '/partnership/unknown', '/partnership/login']) {
    const response = middleware()(new NextRequest(`https://prophetnamara.org${path}`));
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('x-middleware-next'), '1');
  }
});
test('permanent host and legacy redirects target the canonical origin', async () => {
  const { default: config } = await import('../next.config.mjs');
  const rules = await config.redirects();
  for (const [source, target] of [['/home', '/'], ['/audios', '/audio'], ['/partnership/login', '/partnership/landing']]) {
    const rule = rules.find((r) => r.source === source);
    assert.equal(rule.destination, `https://prophetnamara.org${target}`);
    assert.equal(rule.permanent, true);
  }
  const host = rules.find((r) => r.has);
  assert.equal(host.has[0].value, 'www.prophetnamara.org');
  assert.equal(host.destination, 'https://prophetnamara.org/:path*');
  assert.equal(host.permanent, true);
});

