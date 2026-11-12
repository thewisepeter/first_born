import React from 'react';
import { createRoot } from 'react-dom/client';
import { PostListingModal } from '../../src/app/partnership/(dashboard)/components/PostListingModal';
import { ListingCover } from '../../src/app/partnership/(dashboard)/components/ListingPhotos';
import { listingFormData } from '../../src/services/marketplace';

const tick = () => new Promise((resolve) => setTimeout(resolve, 35));
const expect = (condition, message) => {
  if (!condition) throw Error(message);
};
const q = (selector) => document.querySelector(selector);
const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jzJkAAAAASUVORK5CYII=';
async function run() {
  const root = createRoot(q('#app'));
  const revoked = [];
  const revoke = URL.revokeObjectURL.bind(URL);
  URL.revokeObjectURL = (url) => {
    revoked.push(url);
    revoke(url);
  };
  const form = {
    type: 'product',
    title: 'Tea',
    description: 'Fresh tea',
    price: '20',
    currency: 'UGX',
    category: '2',
    location: 'Kampala',
    contactMethod: 'message',
    contactInfo: 'contact',
    tags: 'tea, fresh',
    existingImages: [{ id: 7, url: png, position: 0 }],
  };
  let closes = 0,
    reject = true,
    payload;
  root.render(
    <PostListingModal
      isOpen
      isEditing
      initialData={form}
      categories={[{ id: 2, name: 'Tea', category_type: 'product' }]}
      onClose={() => closes++}
      onSubmit={async (data) => {
        payload = listingFormData(data);
        if (reject) throw Error('Images: rejected by server\nTitle: Please review the title.');
      }}
    />
  );
  await tick();
  const pick = async (...files) => {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    const input = q('input[type=file]');
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await tick();
  };
  const file = (name) =>
    new File([Uint8Array.from(atob(png.split(',')[1]), (c) => c.charCodeAt(0))], name, {
      type: 'image/png',
    });
  expect(document.body.textContent.includes('2 slots remaining'), 'saved image uses one slot');
  expect(q('#contactInfo').value === 'contact', 'saved contact information');
  await pick(file('bad.gif'));
  expect(q('[role=alert]') && !q('img[src^="blob:"]'), 'reject invalid extension');
  await pick(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }));
  expect(q('[role=alert]').textContent.includes('5 MiB'), 'reject oversized selection');
  await pick(file('one.png'), file('two.png'), file('three.png'));
  expect(q('[role=alert]').textContent.includes('three'), 'reject overflow');
  expect(q('input[type=file]').hidden, 'native file control is hidden');
  const add = Array.from(document.querySelectorAll('button')).find((b) =>
    b.textContent.includes('Add another photo')
  );
  expect(!!add, 'compact add tile is available while slots remain');
  const drop = new DataTransfer();
  drop.items.add(file('one.png'));
  drop.items.add(file('two.png'));
  add.dispatchEvent(new DragEvent('drop', { dataTransfer: drop, bubbles: true, cancelable: true }));
  await tick();
  expect(
    q('input[type=file]').disabled && document.querySelectorAll('img[src^="blob:"]').length === 2,
    'preview both new photos'
  );
  document.querySelector('[aria-label="Remove photo 1"]').click();
  await tick();
  expect(
    document.body.textContent.includes('1 slot remaining') &&
      q('ol li').textContent.includes('Cover'),
    'new first photo becomes cover'
  );
  q('[aria-label="Remove photo 2"]').click();
  await tick();
  expect(revoked.length === 1, 'removed preview released');
  q('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  expect(
    !closes &&
      q('[role=alert]').textContent.includes('rejected') &&
      document.querySelectorAll('[role=alert] li').length === 2 &&
      q('#title').value === 'Tea' &&
      q('img[src^="blob:"]'),
    'rejected write preserves form and photo'
  );
  expect(
    payload.get('images').name === 'one.png' &&
      payload.get('remove_image_ids') === '7' &&
      payload.get('tags') === '["tea","fresh"]',
    'multipart edit payload'
  );
  for (const [key, value] of Object.entries({
    title: 'Tea',
    description: 'Fresh tea',
    listing_type: 'product',
    category: '2',
    price: '20',
    currency: 'UGX',
    location: 'Kampala',
    contact_method: 'message',
    contact_info: 'contact',
    tags: '["tea","fresh"]',
  }))
    expect(payload.get(key) === value, 'browser FormData contains ' + key);
  reject = false;
  q('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  expect(closes === 1, 'successful retry closes');
  const listing = {
    title: 'Tea',
    images: [{ id: 1, url: png + '#gallery', position: 0 }],
    image: png + '#legacy',
    image_url: png + '#external',
  };
  root.render(<ListingCover listing={listing} />);
  await tick();
  expect(
    revoked.length === 2 && q('img').src === listing.images[0].url,
    'cleanup and gallery cover'
  );
  for (const next of [listing.image, listing.image_url, null]) {
    q('img').dispatchEvent(new Event('error'));
    await tick();
    expect(
      next ? q('img')?.src === next : !!q('[aria-label="No listing photo"]'),
      'card fallback order'
    );
  }
  root.render(<PostListingModal isOpen onClose={() => {}} onSubmit={async () => {}} />);
  await tick();
  const empty = Array.from(document.querySelectorAll('button')).find((b) =>
    b.textContent.includes('Add listing photos')
  );
  expect(
    empty?.textContent.includes('Click to upload or drag and drop') &&
      empty.textContent.includes('JPG, JPEG or PNG · Up to 5 MiB each'),
    'empty upload instructions'
  );
  expect(
    q('fieldset').textContent.includes('Maximum 3 photos') &&
      q('fieldset').textContent.includes('3 slots remaining'),
    'empty slots'
  );
  let opens = 0;
  q('input[type=file]').addEventListener('click', (e) => {
    e.preventDefault();
    opens++;
  });
  empty.click();
  expect(opens === 1, 'custom button opens file picker');
}
run()
  .then(() => (document.querySelector('#result').textContent = 'PASS'))
  .catch((e) => (document.querySelector('#result').textContent = e.stack));
