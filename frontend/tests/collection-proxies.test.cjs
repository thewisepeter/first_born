const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

test(
  'Next routes both collection paths and aliases to the Django collection',
  { timeout: 90000 },
  async (t) => {
    const seen = [];
    const populated = '{"count":1,"next":null,"previous":null,"results":[{"id":7}]}';
    const empty = '{"count":0,"next":null,"previous":null,"results":[]}';
    const denied = '{"detail":"Authentication credentials were not provided."}';
    const type = 'application/json; charset=utf-8';
    const upstream = http.createServer((req, res) => {
      seen.push({ url: req.url, headers: req.headers, method: req.method });
      res.writeHead(req.headers.cookie ? 200 : 403, { 'Content-Type': type });
      res.end(!req.headers.cookie ? denied : req.url.includes('page_size=50') ? empty : populated);
    });
    upstream.listen(0, '127.0.0.1');
    await once(upstream, 'listening');
    t.after(() => {
      upstream.closeAllConnections();
      upstream.close();
    });

    // Run real Next routing in a temporary app, independent of the developer's .next cache.
    const root = path.resolve(__dirname, '..');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'collection-proxies-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
    for (const file of [
      'package.json',
      'tsconfig.json',
      'next.config.mjs',
      'src/app/api/_shared',
      'src/app/api/drives',
      'src/app/api/opportunities',
    ]) {
      fs.cpSync(path.join(root, file), path.join(dir, file), { recursive: true });
    }
    const child = spawn(
      process.execPath,
      [
        '-e',
        `
    const next = require('next')({ dev:true, dir:process.cwd() });
    const handle = next.getRequestHandler();
    next.prepare().then(() => {
      const server = require('http').createServer(handle);
      server.listen(0, '127.0.0.1', () => process.send(server.address().port));
    });
  `,
      ],
      {
        cwd: dir,
        stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
        env: {
          ...process.env,
          NEXT_TELEMETRY_DISABLED: '1',
          NEXT_PUBLIC_API_URL: 'http://127.0.0.1:' + upstream.address().port,
        },
      }
    );
    const exited = once(child, 'exit');
    // Stop and await the child before deleting its temporary project.
    t.after(async () => {
      child.kill('SIGKILL');
      await exited;
    });
    const port = await Promise.race([
      once(child, 'message').then(([port]) => port),
      exited.then(() => {
        throw Error('Next exited before listening');
      }),
    ]);
    for (const [name, size, filter] of [
      ['drives', 10, 'is_published'],
      ['opportunities', 5, 'is_active'],
    ]) {
      for (const route of [name + '/' + name, name]) {
        for (const [query, auth, body] of [
          [`page=1&page_size=${size}&${filter}=true`, true, populated],
          [`page=1&page_size=50&${filter}=true&future=A%2FB&future=C`, true, empty],
          ['', false, denied],
        ]) {
          const suffix = query ? '?' + query : '';
          const headers = auth
            ? { cookie: 'sessionid=test; csrftoken=test-csrf', authorization: 'Bearer fixture' }
            : {};
          if (auth && body === empty) headers['x-csrftoken'] = 'explicit';
          const before = seen.length;
          const response = await fetch(`http://127.0.0.1:${port}/api/${route}/${suffix}`, {
            headers,
          });
          assert.equal(response.status, auth ? 200 : 403);
          assert.equal(response.headers.get('content-type'), type);
          assert.equal(await response.text(), body);
          assert.equal(seen.length, before + 1);
          const req = seen.at(-1);
          assert.equal(req.method, 'GET');
          assert.equal(req.url, `/api/${name}/${name}/${suffix}`);
          assert.equal(req.headers.cookie, headers.cookie);
          assert.equal(req.headers.authorization, headers.authorization);
          assert.equal(
            req.headers['x-csrftoken'],
            auth ? headers['x-csrftoken'] || 'test-csrf' : undefined
          );
        }
      }
    }
  }
);
