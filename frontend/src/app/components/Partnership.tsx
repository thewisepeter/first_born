'use client';

import { HeartHandshake, Users, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function Partnership() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Partnership</h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Giving is a powerful force that makes a place for us among the great and can change
              the direction of our lives. Partnership is a special type of giving. Partnership
              through weekly or monthly dedicated giving, is a special form of giving that shows a
              commitment and dedication to the cause of God placed upon Prophet Namara Ernest
            </p>
          </div>

          {/* What Is Partnership */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <HeartHandshake className="h-6 w-6 mr-3" />
                  What Partnership Is
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Partnership is a covenant decision to align with the vision, grace, and assignment
                  God is advancing through Prophet Namara Ernest. It is more than just support — it
                  is participation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-[#B28930]">
                  <ShieldCheck className="h-6 w-6 mr-3" />
                  Benefit Of Partnership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  When you partner, you not only bless the people that are being touched by the
                  ministry, but you start a supernatural flow for your finances by partaking in the
                  anointing, vision and blessings that are in full flow in the ministry.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Users className="h-6 w-6 mr-3" />
                  Standing With the Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Partners help advance the work of God through their financial giving.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call To Action */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Take the Next Step</h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              If God is leading you to stand with this vision, you are welcome to learn more about
              partnership and what it represents.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8"
              >
                Learn More About Partnership
              </Button>

              <Button size="lg" className="bg-[#B28930] hover:bg-[#9A7328] text-white px-8">
                Partner Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
