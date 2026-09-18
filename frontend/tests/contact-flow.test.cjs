const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(relativePath, globals = {}) {
  const source = readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const context = {
    exports: {},
    require,
    process: { env: { NEXT_PUBLIC_API_URL: 'http://localhost:8000' } },
    console: { error() {} },
    ...globals,
  };
  vm.runInNewContext(outputText, context);
  return context.exports;
}

const csrfPath = 'src/app/lib/csrf.ts';
const contactPath = 'src/app/api/contactmessages/contact/route.ts';
const payload = {
  fullName: 'Visitor',
  email: 'visitor@example.com',
  phone: '+256700000000',
  message: 'Please contact me.',
};

function request() {
  return new Request('http://localhost:3000/api/contactmessages/contact/', {
    method: 'POST',
    headers: {
      Cookie: 'csrftoken=test-token',
      'X-CSRFToken': 'test-token',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

test('uses the exact existing CSRF cookie without fetching', async () => {
  const csrf = loadModule(csrfPath, {
    document: { cookie: 'othercsrftoken=wrong; csrftoken=current-token' },
    fetch() {
      throw new Error('Unexpected fetch');
    },
  });
  assert.equal(await csrf.ensureCsrfToken(), 'current-token');
});

test('submission waits for shared initialization when the cookie arrives late', async () => {
  const document = { cookie: '' };
  let finish;
  let calls = 0;
  const csrf = loadModule(csrfPath, {
    document,
    fetch(url, options) {
      calls++;
      assert.equal(url, '/api/csrf/');
      assert.equal(options.credentials, 'include');
      assert.equal(options.cache, 'no-store');
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  });
  const initial = csrf.ensureCsrfToken();
  const submission = csrf.ensureCsrfToken();
  assert.equal(calls, 1);
  document.cookie = 'csrftoken=new-token';
  finish({ ok: true });
  assert.deepEqual(await Promise.all([initial, submission]), ['new-token', 'new-token']);
});

test('retries initialization after a backend error', async () => {
  const document = { cookie: '' };
  let calls = 0;
  const csrf = loadModule(csrfPath, {
    document,
    async fetch() {
      if (++calls === 1) return { ok: false };
      document.cookie = 'csrftoken=recovered-token';
      return { ok: true };
    },
  });
  await assert.rejects(csrf.ensureCsrfToken(), /Unable to initialize/);
  assert.equal(await csrf.ensureCsrfToken(), 'recovered-token');
});

test('does not proceed when the browser rejects the cookie', async () => {
  const csrf = loadModule(csrfPath, {
    document: { cookie: '' },
    fetch: async () => ({ ok: true }),
  });
  await assert.rejects(csrf.ensureCsrfToken(), /Unable to set the CSRF cookie/);
});

test('CSRF proxy forwards existing cookies, response status and new cookie without caching', async () => {
  const route = loadModule('src/app/api/csrf/route.ts', {
    async fetch(url, options) {
      assert.equal(url, 'http://localhost:8000/api/csrf/');
      assert.equal(options.headers.Cookie, 'csrftoken=test-token');
      assert.equal(options.cache, 'no-store');
      return Response.json(
        { detail: 'CSRF cookie set' },
        { headers: { 'Set-Cookie': 'csrftoken=test-token; Path=/; SameSite=Lax' } }
      );
    },
  });
  const response = await route.GET(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('set-cookie'), /csrftoken=test-token/);
});

test('CSRF proxy preserves backend failure status', async () => {
  const route = loadModule('src/app/api/csrf/route.ts', {
    fetch: async () => Response.json({ detail: 'Unavailable' }, { status: 503 }),
  });
  assert.equal((await route.GET(request())).status, 503);
});

test('contact proxy forwards form data and CSRF credentials and preserves success', async () => {
  const route = loadModule(contactPath, {
    async fetch(url, options) {
      assert.equal(url, 'http://localhost:8000/api/contactmessages/contact/');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Cookie, 'csrftoken=test-token');
      assert.equal(options.headers['X-CSRFToken'], 'test-token');
      assert.deepEqual(JSON.parse(options.body), payload);
      return Response.json({ message: 'Contact message submitted successfully' }, { status: 201 });
    },
  });
  const response = await route.POST(request());
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { message: 'Contact message submitted successfully' });
});

test('contact proxy preserves validation and CSRF errors', async () => {
  for (const status of [400, 403]) {
    const route = loadModule(contactPath, {
      fetch: async () => Response.json({ detail: 'Request rejected' }, { status }),
    });
    const response = await route.POST(request());
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { detail: 'Request rejected' });
  }
});

test('contact proxy handles a stopped backend and non-JSON failures', async () => {
  const unavailable = loadModule(contactPath, {
    fetch: async () => {
      throw new Error('Connection refused');
    },
  });
  assert.equal((await unavailable.POST(request())).status, 503);
  const failed = loadModule(contactPath, {
    fetch: async () => new Response('Server error', { status: 500 }),
  });
  const response = await failed.POST(request());
  assert.equal(response.status, 500);
  assert.match((await response.json()).detail, /could not process/);
});
