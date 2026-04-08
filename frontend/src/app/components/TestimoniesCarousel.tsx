'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Quote, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';

interface Testimony {
  id: number;
  name: string;
  image: string;
  quote: string;
  role: string;
}

export function TestimoniesCarousel() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    // Fetch testimonies from API
    const fetchTestimonies = async () => {
      try {
        const res = await fetch('https://prophetnamara.org/api/blog/testimonies/');
        if (!res.ok) throw new Error('Failed to fetch testimonies');
        const data = await res.json();

        const testimoniesArray = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];

        setTestimonies(testimoniesArray);
      } catch (error) {
        console.error('Error fetching testimonies:', error);
      }
    };

    fetchTestimonies();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonies.length - itemsPerView);

  const nextTestimony = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevTestimony = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Testimonies</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear various testimonies of the workings of God in our midst.
          </p>
        </div>

        <div className="relative">
          {/* Testimonies Container */}
          <div className="overflow-hidden pb-12">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {testimonies.map((testimony) => (
                <div
                  key={testimony.id}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <ImageWithFallback
                          src={testimony.image}
                          alt={testimony.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-[#F5F0E1]"
                        />
                        <div className="absolute -top-2 -right-2 bg-purple-600 rounded-full p-1">
                          <Quote className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      <blockquote className="text-gray-700 mb-4 italic flex-grow">
                        "{testimony.quote}"
                      </blockquote>

                      <div className="mt-auto">
                        <div className="font-semibold text-gray-900">{testimony.name}</div>
                        <div className="text-sm text-purple-600">{testimony.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={prevTestimony}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl text-purple-600 p-3 rounded-full transition-all duration-200 hover:bg-purple-50"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={nextTestimony}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl text-purple-600 p-3 rounded-full transition-all duration-200 hover:bg-purple-50"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Dots Indicator */}
        {maxIndex > 0 && (
          <div className="flex flex-col items-center space-y-6 mt-12">
            {/* Dots only */}
            <div className="flex justify-center space-x-2">
              {Array.from({ length: maxIndex + 1 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Centered button with spacing from dots */}
            <div className="text-center">
              <Link href="/testimonies">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  <Users className="h-5 w-5 mr-2" />
                  See more testimonies
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
