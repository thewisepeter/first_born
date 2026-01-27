'use client';

import { HeartHandshake, Users, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { PartnerRequest } from '../../../components/partnership/PartnerRequest';
import { PartnerSignIn } from '../../../components/partnership/PartnerSignIn';

export default function PartnershipLanding() {
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

          {/* Partnership Testimonials Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              What Partners Are Saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-purple-50 to-[#F5F0E1] p-6 rounded-xl border border-purple-100">
                <p className="text-gray-700 italic mb-4">
                  "Since partnering with First Born Ministries, I've seen remarkable breakthroughs
                  in my business and family life. There's a supernatural grace that comes with
                  partnership."
                </p>
                <p className="text-sm text-gray-600 font-medium">— Sarah K., Partner since 2021</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-[#F5F0E1] p-6 rounded-xl border border-purple-100">
                <p className="text-gray-700 italic mb-4">
                  "The weekly teachings and Spirit World broadcasts have transformed my spiritual
                  walk. Partnering has been one of the best decisions I've made."
                </p>
                <p className="text-sm text-gray-600 font-medium">— David M., Partner since 2020</p>
              </div>
            </div>
          </div>

          {/* Call To Action */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Take the Next Step</h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Whether you're ready to become a partner or need to access your partner dashboard, we
              welcome you.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Partner Sign Up Button */}
              <div className="w-full sm:w-auto">
                <PartnerRequest
                  variant="default"
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 w-full sm:w-auto"
                />
              </div>

              {/* Partner Sign In Button */}
              <div className="w-full sm:w-auto">
                <PartnerSignIn
                  variant="outline"
                  size="lg"
                  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 w-full sm:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
