'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
}

export function HeroCarousel() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get API URL based on environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prophetnamara.org';

  // fetch data from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/blog/heroslide/`);

        if (!res.ok) throw new Error(`Failed to fetch slides: ${res.status}`);

        const data = await res.json();

        // Handle different response formats
        let slidesArray: HeroSlide[] = [];

        if (Array.isArray(data)) {
          // If API returns array directly
          slidesArray = data;
        } else if (data.results && Array.isArray(data.results)) {
          // If API returns paginated response
          slidesArray = data.results;
        } else if (data && typeof data === 'object') {
          // If API returns a single object, wrap it in array
          console.warn('API returned single object, wrapping in array');
          slidesArray = [data];
        } else {
          console.error('Unexpected API response format:', data);
          slidesArray = [];
        }

        setHeroSlides(slidesArray);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        setError(error instanceof Error ? error.message : 'Failed to load slides');
        setHeroSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, [API_URL]);

  // auto-slide every 5s
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [heroSlides]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gradient-to-r from-purple-900 to-purple-700">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gradient-to-r from-purple-900 to-purple-700">
        <div className="text-white text-center">
          <p className="text-red-300 mb-2">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (heroSlides.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gradient-to-r from-purple-900 to-purple-700">
        <div className="text-white text-center">
          <p>No slides available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide
              ? 'translate-x-0'
              : index < currentSlide
                ? '-translate-x-full'
                : 'translate-x-full'
          }`}
        >
          <div className="relative h-full">
            <ImageWithFallback
              src={slide.image}
              srcSet={`
    ${slide.image}?w=768 768w,
    ${slide.image}?w=1200 1200w,
    ${slide.image}?w=1920 1920w,
    ${slide.image}?w=2560 2560w
  `}
              sizes="100vw"
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-end justify-center pb-16">
              <div className="text-center text-white max-w-4xl px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <h2 className="text-2xl md:text-3xl text-white mb-6">{slide.subtitle}</h2>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">{slide.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows - only show if there's more than 1 slide */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - only show if there's more than 1 slide */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-[#B28930]' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
