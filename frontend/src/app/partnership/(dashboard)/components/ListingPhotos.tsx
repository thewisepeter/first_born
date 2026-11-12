'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, Store, X } from 'lucide-react';
import type { ListingImage } from '../../../../services/marketplace';

export type Photo = { saved: ListingImage } | { file: File; key: string };

function Preview({ photo, index }: { photo: Photo; index: number }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!('file' in photo)) return;
    const preview = URL.createObjectURL(photo.file);
    setUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [photo]);
  const src = 'saved' in photo ? photo.saved.url : url;
  return src ? (
    <img
      src={src}
      alt={`Listing photo ${index + 1}`}
      className="absolute inset-0 h-full w-full object-cover"
    />
  ) : null;
}

export function ListingPhotos({
  photos,
  onChange,
  disabled,
}: {
  photos: Photo[];
  onChange: (value: Photo[]) => void;
  disabled: boolean;
}) {
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const remaining = 3 - photos.length;
  function select(files: File[]) {
    if (disabled || !files.length) return;
    if (files.length > remaining) return setError('Choose at most three images in total.');
    for (const file of files) {
      const mime = /\.jpe?g$/i.test(file.name)
        ? 'image/jpeg'
        : /\.png$/i.test(file.name)
          ? 'image/png'
          : '';
      if (!mime || (file.type && file.type !== mime))
        return setError('Choose a JPG, JPEG or PNG photo.');
      if (file.size > 5 * 1024 * 1024) return setError('Each photo must be 5 MiB or smaller.');
    }
    setError('');
    onChange([...photos, ...files.map((file) => ({ file, key: crypto.randomUUID() }))]);
  }
  const tile = (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        select(Array.from(e.dataTransfer.files));
      }}
      className={`flex w-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-1 text-center text-purple-700 hover:border-purple-400 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-600 ${dragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'} ${photos.length ? 'aspect-square text-xs' : 'py-5 text-sm'}`}
    >
      {photos.length ? (
        <>
          <Plus aria-hidden="true" size={18} />
          <span>Add another photo</span>
        </>
      ) : (
        <>
          <ImagePlus aria-hidden="true" className="mb-1 h-6 w-6" />
          <span className="font-semibold">Add listing photos</span>
          <span className="text-gray-600">Click to upload or drag and drop</span>
          <span className="text-xs text-gray-500">JPG, JPEG or PNG · Up to 5 MiB each</span>
        </>
      )}
    </button>
  );
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-2">
      <legend className="text-sm font-medium text-gray-800">Listing photos (optional)</legend>
      <input
        ref={input}
        type="file"
        hidden
        multiple
        accept="image/jpeg,image/png"
        disabled={!remaining}
        aria-label="Choose listing photos"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files || []);
          event.currentTarget.value = '';
          select(files);
        }}
      />
      <p aria-live="polite" className="flex flex-wrap justify-between gap-1 text-xs text-gray-500">
        <span>Maximum 3 photos</span>
        <span className="font-medium text-purple-700">
          {remaining} {remaining === 1 ? 'slot' : 'slots'} remaining
        </span>
      </p>
      {!photos.length ? (
        tile
      ) : (
        <ol className="grid min-w-0 grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <li
              key={'saved' in photo ? photo.saved.id : photo.key}
              className="relative aspect-square min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
            >
              <Preview photo={photo} index={index} />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-purple-800 px-1.5 py-0.5 text-xs font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white text-gray-700 shadow hover:text-red-700 focus-visible:ring-2 focus-visible:ring-purple-600"
                onClick={() => {
                  setError('');
                  onChange(photos.filter((_, i) => i !== index));
                }}
              >
                <X aria-hidden="true" size={15} />
              </button>
            </li>
          ))}
          {remaining > 0 && <li className="min-w-0">{tile}</li>}
        </ol>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function Cover({ sources, title }: { sources: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  return sources[index] ? (
    <img
      src={sources[index]}
      alt={title}
      className="w-full h-full object-cover"
      onError={() => setIndex(index + 1)}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Store aria-label="No listing photo" className="h-10 w-10 text-gray-300" />
    </div>
  );
}

export function ListingCover({
  listing,
}: {
  listing: { images?: ListingImage[]; image: string | null; image_url: string; title: string };
}) {
  const sources = Array.from(
    new Set([listing.images?.[0]?.url, listing.image, listing.image_url].filter(Boolean))
  ) as string[];
  return <Cover key={JSON.stringify(sources)} sources={sources} title={listing.title} />;
}
