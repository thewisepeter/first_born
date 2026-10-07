'use client';

import { HeroCarousel } from './components/HeroCarousel';
import { TestimoniesCarousel } from './components/TestimoniesCarousel';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />
      <TestimoniesCarousel />
    </div>
  );
}
