'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string; // your serializer should return the image URL
  description: string;
}

export function HeroCarousel() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch data from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/blog/heroslide/');
        if (!res.ok) throw new Error('Failed to fetch slides');
        const data: HeroSlide[] = await res.json();
        setHeroSlides(data);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // auto-slide every 5s
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return <div className="h-[70vh] flex items-center justify-center text-white">Loading...</div>;
  }

  if (heroSlides.length === 0) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-white">
        No slides available
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
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <h2 className="text-2xl md:text-3xl text-[#B28930] mb-6">{slide.subtitle}</h2>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">{slide.description}</p>
                <Button
                  size="lg"
                  className="bg-[#B28930] hover:bg-[#9A7328] text-white px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
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

      {/* Dots Indicator */}
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
    </div>
  );
}
