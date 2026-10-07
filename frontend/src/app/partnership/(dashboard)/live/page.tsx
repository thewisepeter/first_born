'use client';

import Link from 'next/link';
import { CalendarDays, PlayCircle, Radio } from 'lucide-react';
import { useLivestream } from '../../../../hooks/useLivestream';

export default function LivePage() {
  const { status, loading, error } = useLivestream();
  const isLive = Boolean(status?.is_live && status.embed_url);
  const nextBroadcast = status?.next_broadcast_at ? new Date(status.next_broadcast_at) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-[#F5F0E1]">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
            <Radio className="h-4 w-4" aria-hidden="true" /> Live broadcast
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Join us live
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Watch the latest broadcast and stay connected wherever you are.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl" role="status">
            <p className="text-gray-600">Checking broadcast status…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl" role="alert">
            <h2 className="text-2xl font-bold text-gray-900">Broadcast status is unavailable</h2>
            <p className="mt-3 text-gray-600">Please check back shortly.</p>
          </div>
        ) : isLive ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-purple-700 to-[#B28930] px-6 py-5 text-white">
              <h2 className="text-xl font-bold sm:text-2xl">{status?.title || 'Live broadcast'}</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" /> Live Now
              </span>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={status!.embed_url!}
                title={status?.title || 'Live broadcast'}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-2xl sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Radio className="h-10 w-10" aria-hidden="true" />
            </div>
            <h2 className="mt-7 text-3xl font-bold text-gray-900">We’re currently offline</h2>
            {status?.offline_message && (
              <p className="mx-auto mt-4 max-w-xl whitespace-pre-line text-gray-600">
                {status.offline_message}
              </p>
            )}
            {nextBroadcast && !Number.isNaN(nextBroadcast.getTime()) && (
              <div className="mx-auto mt-7 inline-flex max-w-full items-start gap-3 rounded-xl bg-[#F5F0E1] px-5 py-4 text-left text-purple-900">
                <CalendarDays
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#B28930]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">Next scheduled broadcast</p>
                  <time dateTime={status!.next_broadcast_at!} className="text-sm">
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    }).format(nextBroadcast)}
                  </time>
                </div>
              </div>
            )}
            <div className="mt-8">
              <Link
                href="/prophecies"
                className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
              >
                <PlayCircle className="h-5 w-5" aria-hidden="true" /> Check out these videos
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
