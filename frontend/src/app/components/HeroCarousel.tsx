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

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Welcome to Grace Church',
    subtitle: 'Pastor John Smith',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face',
    description: 'Join us every Sunday as we worship together and grow in faith',
  },
  {
    id: 2,
    title: 'Youth Conference 2024',
    subtitle: 'February 15-17',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
    description: 'Three days of worship, learning, and fellowship for young people',
  },
  {
    id: 3,
    title: 'Community Outreach',
    subtitle: 'Serving Our Neighborhood',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop',
    description: 'Making a difference in our community through love and service',
  },
  {
    id: 4,
    title: 'Easter Celebration',
    subtitle: 'March 31st',
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&h=600&fit=crop',
    description: 'Celebrate the resurrection with special services and activities',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

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
