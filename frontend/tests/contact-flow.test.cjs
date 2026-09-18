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

test('Prophet proxy forwards session, CSRF, origin and message to its dedicated endpoint', async () => {
  const route = loadModule('src/app/api/contactmessages/prophet/route.ts', {
    async fetch(url, options) {
      assert.equal(url, 'http://localhost:8000/api/contactmessages/prophet/');
      assert.equal(options.headers.Cookie, 'sessionid=test-session; csrftoken=test-token');
      assert.equal(options.headers['X-CSRFToken'], 'test-token');
      assert.equal(options.headers.Origin, 'http://localhost:3000');
      assert.deepEqual(JSON.parse(options.body), payload);
      return Response.json({ message: 'Sent' });
    },
  });
  const req = new Request('http://localhost:3000/api/contactmessages/prophet/', {
    method: 'POST',
    headers: {
      Cookie: 'sessionid=test-session; csrftoken=test-token',
      'X-CSRFToken': 'test-token',
      Origin: 'http://localhost:3000',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  assert.equal((await route.POST(req)).status, 200);
});

test('Prophet proxy preserves permission, validation and mail failure statuses', async () => {
  for (const status of [400, 403, 503]) {
    const route = loadModule('src/app/api/contactmessages/prophet/route.ts', {
      fetch: async () => Response.json({ detail: 'Unable to send' }, { status }),
    });
    const response = await route.POST(request());
    assert.equal(response.status, status);
    assert.equal((await response.json()).detail, 'Unable to send');
  }
});

test('session check forwards browser cookies through the same-origin proxy without caching', async () => {
  const route = loadModule('src/app/api/auth/me/route.ts', {
    async fetch(url, options) {
      assert.equal(url, 'http://localhost:8000/api/auth/me/');
      assert.equal(options.headers.Cookie, 'sessionid=local-session');
      assert.equal(options.cache, 'no-store');
      return Response.json({
        id: 7,
        email: 'partner@example.com',
        first_name: 'Test',
        last_name: 'Partner',
        is_partner: true,
      });
    },
  });
  const response = await route.GET(
    new Request('http://127.0.0.1:3000/api/auth/me/', {
      headers: { Cookie: 'sessionid=local-session' },
    })
  );
  const data = await response.json();
  assert.equal(data.authenticated, true);
  assert.equal(data.user.is_partner, true);
  assert.equal(data.user.first_name, 'Test');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('session check preserves expired-session response', async () => {
  const route = loadModule('src/app/api/auth/me/route.ts', {
    fetch: async () => Response.json({ detail: 'Not authenticated' }, { status: 403 }),
  });
  assert.equal((await route.GET(request())).status, 403);
});

test('login forwards the session and rotated CSRF cookies to the browser', async () => {
  const route = loadModule('src/app/api/auth/login/route.ts', {
    async fetch() {
      const response = Response.json({ user: { id: 7 } });
      response.headers.append(
        'Set-Cookie',
        'sessionid=local-session; HttpOnly; Path=/; SameSite=Lax'
      );
      response.headers.append('Set-Cookie', 'csrftoken=rotated-token; Path=/; SameSite=Lax');
      return response;
    },
  });
  const response = await route.POST(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.match(response.headers.getSetCookie()[0], /sessionid=local-session/);
  assert.match(response.headers.getSetCookie()[1], /csrftoken=rotated-token/);
});
