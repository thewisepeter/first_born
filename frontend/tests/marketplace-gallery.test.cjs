const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const vm = require('node:vm');

test('listing routes deliver multipart and JSON writes to the Django WSGI parser', async (t) => {
  const { spawn } = require('node:child_process');
  const { once } = require('node:events');
  const python =
    process.env.DJANGO_PYTHON || path.resolve(__dirname, '../../backend/.venv/bin/python');
  const server = spawn(python, [path.join(__dirname, 'fixtures/marketplace-upstream.py')], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const closed = once(server, 'exit');
  t.after(async () => {
    server.kill();
    await closed;
  });
  const port = await Promise.race([
    once(server.stdout, 'data').then(([s]) => Number(String(s).trim())),
    closed.then(() => {
      throw Error('Django fixture exited');
    }),
  ]);
  const base = 'http://127.0.0.1:' + port;
  function load(file, imports = {}) {
    const context = {
      exports: {},
      require: (id) => imports[id],
      Headers,
      Response,
      fetch,
      Blob,
      FormData,
      process: { env: { NEXT_PUBLIC_API_URL: base } },
    };
    vm.runInNewContext(
      ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src', file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
      }).outputText,
      context
    );
    return context.exports;
  }
  const helper = load('app/api/marketplace/forwardWrite.ts');
  const { listingFormData } = load('services/marketplace.ts');
  const fields = {
    title: 'Tea',
    description: 'Fresh tea',
    listing_type: 'product',
    category: '2',
    price: '20',
    currency: 'UGX',
    location: 'Kampala',
    tags: '["tea","fresh"]',
    contact_method: 'phone',
    contact_info: '+256700000000',
  };
  for (const method of ['POST', 'PATCH']) {
    const route = load(
      'app/api/marketplace/listings/' + (method === 'PATCH' ? '[id]/' : '') + 'route.ts',
      { 'next/server': {}, '../forwardWrite': helper, '../../forwardWrite': helper }
    );
    for (const kind of ['multipart', 'json', 'invalid']) {
      const photos = [new File(['photo one'], 'a.png', { type: 'image/png' })];
      if (method === 'PATCH') photos.push(new File(['photo two'], 'b.jpg', { type: 'image/jpeg' }));
      const data = listingFormData({
        ...fields,
        type: 'product',
        contactMethod: 'phone',
        contactInfo: fields.contact_info,
        tags: 'tea, fresh',
        newImages: photos,
      });
      const headers = {
        cookie: 'sessionid=test',
        'x-csrftoken': 'token',
        origin: 'http://localhost:3000',
        referer: 'http://localhost:3000/partnership/marketplace',
      };
      if (kind !== 'multipart') headers['content-type'] = 'application/json';
      const req = new Request('http://localhost:3000/api/marketplace/listings/', {
        method,
        headers,
        body: kind === 'multipart' ? data : JSON.stringify(kind === 'invalid' ? {} : fields),
      });
      const res = await route[method](req, { params: { id: '19' } });
      const body = await res.json();
      if (kind === 'invalid') {
        assert.equal(res.status, 400);
        assert.deepEqual(body, { title: ['This field is required.'] });
        continue;
      }
      assert.equal(res.status, 200, JSON.stringify(body));
      assert.deepEqual(body.fields, fields);
      assert.deepEqual(
        body.images,
        kind === 'multipart'
          ? await Promise.all(
              photos.map(async (f) => [f.name, Buffer.from(await f.arrayBuffer()).toString('hex')])
            )
          : []
      );
      for (const [key, value] of Object.entries(body.headers))
        assert.equal(value, req.headers.get(key));
      assert.equal(body.method, method);
      assert.equal(body.path, '/api/marketplace/listings/' + (method === 'PATCH' ? '19/' : ''));
      assert.ok(Number(body.length) > 0);
    }
  }
});

const chrome = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && fs.existsSync(p));
test(
  'partner form gallery selection, validation, retry, cleanup and card fallbacks in Chrome',
  { skip: !chrome && 'Set CHROME_BIN to a local Chrome executable' },
  async (t) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'marketplace-ui-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const bundled = require('next/dist/compiled/webpack/webpack');
    bundled.init();
    const loader = path.join(dir, 'typescript.cjs');
    fs.writeFileSync(
      loader,
      `const ts=require(${JSON.stringify(require.resolve('typescript'))});module.exports=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext}}).outputText;`
    );
    const compiler = bundled.webpack({
      mode: 'development',
      devtool: false,
      entry: path.resolve(__dirname, 'fixtures/marketplace-gallery.jsx'),
      output: { path: dir, filename: 'app.js' },
      resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs'] },
      module: { rules: [{ test: /\.[jt]sx?$/, exclude: /node_modules/, use: loader }] },
    });
    await new Promise((resolve, reject) =>
      compiler.run((e, stats) =>
        compiler.close(() =>
          e || stats.hasErrors()
            ? reject(e || new Error(stats.toString({ all: false, errors: true })))
            : resolve()
        )
      )
    );
    const html = path.join(dir, 'test.html');
    fs.writeFileSync(
      html,
      '<meta charset="utf-8"><div id="app"></div><pre id="result">pending</pre><script src="app.js"></script>'
    );
    const dom = execFileSync(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--disable-background-networking',
        '--no-first-run',
        '--user-data-dir=' + path.join(dir, 'profile'),
        '--virtual-time-budget=8000',
        '--dump-dom',
        pathToFileURL(html).href,
      ],
      { encoding: 'utf8', timeout: 45000, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    assert.equal(dom.match(/<pre id="result"[^>]*>([\s\S]*?)<\/pre>/)?.[1], 'PASS');
  }
);
