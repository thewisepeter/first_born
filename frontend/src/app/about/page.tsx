'use client';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Calendar,
  Users,
  Radio,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
  Music,
  Music2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Link from 'next/link';

interface AboutProps {
  setCurrentPage: (page: string) => void;
}

export default function About({ setCurrentPage }: AboutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Prophet Hero Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Prophet Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <ImageWithFallback
                  src="/pn_abt.jpg"
                  alt="Prophet Namara Ernest"
                  className="w-full h-[500px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#B28930] rounded-full opacity-20" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-600 rounded-full opacity-20" />
            </div>

            {/* Prophet Bio */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Prophet Namara Ernest
                </h1>
                <h2 className="text-2xl text-[#B28930] mb-6">Founder</h2>
              </div>

              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  Prophet Namara Ernest is a prophet of God called to Preserve and Protect the
                  people of the Lord. He operates after the order of Prophet Elijah. Prophet Namara
                  began his walk with the Lord at the tender age of three, entering into a deep and
                  intimate relationship with God. Years later, on December 20th, 1998, he publicly
                  declared his commitment by giving his life to Christ.
                </p>

                <p>
                  His commission into ministry began in 2012 when the Lord spoke clearly to him
                  about his calling. However, the specific details of his assignment remained
                  unclear until June 24th, 2014, when his spiritual father, Prophet Elvis Mbonye,
                  confirmed the exact nature of his mission. Later, on February 2nd, 2016, the Lord
                  equipped him with divine weapons of power for the work ahead.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Founder First Born Ministries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1  gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Prophetic Mandate</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                A mandate can be simply defined as an official order or commission to do something.
                The mandate upon Prophet Namara’s life is to Preserve and Protect that which has
                been entrusted to him. His calling is in preserving and protecting those that the
                Lord brings to him and the grace is abundant.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                This grace is like salt that is used to preserve something and it will not go bad,
                fade away or rot. We are rest assured that as long as our heart is with the man of
                God, our destiny is preserved and protected.
              </p>
            </div>

            {/* Vision */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">First Born</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The Lord Jesus appeared to and instructed Prophet Namara Ernest to demonstrate ‘The
                Assembly of the Firstborn’.
              </p>
              <div className="border-l-4 border-[#B28930] pl-4">
                <p className="text-[#B28930] font-semibold italic">
                  "But you have come to Mount Zion and to the city of the living God, the heavenly
                  Jerusalem, to an innumerable company of angels, 23 to the general assembly and
                  church of the <strong>firstborn</strong> who are registered in heaven, to God the
                  Judge of all, to the spirits of just men made perfect"
                </p>
                <p className="text-sm text-gray-600 mt-2">— Hebrews 12:22-23</p>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Church Information Tiles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fellowship & Ministry</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover more about Prophet Namara, Firstborn Ministries and how you can connect with
              us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Church History */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">First Born Ministries</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  The Lord Jesus appeared to Prophet Namara Ernest and instructed him to establish
                  The Assembly of the Firstborn. In response, Firstborn Fellowship began meeting in
                  Kampala on February 17, 2015, to usher God’s children into a family that
                  recognizes Jesus as the Firstborn.
                </p>
                {/* <p className="text-gray-600">
                  What sets this ministry apart is the unique grace not only to teach but also to
                  impart the tangible reality of God's supernatural realm. At Prophet Namara Ernest
                  Ministries, we are advancing toward a dimension where the Lord’s anointing and
                  prosperity are at their fullest—raising a people who walk boldly and consistently
                  in the supernatural.
                </p> */}
                <Link
                  href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=First%20Born%20Fellowship&dates=20251206T173000/20251207T210000&recur=RRULE:FREQ=WEEKLY;BYDAY=SA"
                  target="_blank"
                >
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-3 transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Never Miss
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Spirit World */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B28930] to-[#9A7328] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Spirit World</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  In 2016, Prophet Namara Ernest began broadcasting the Spirit World program on
                  radio. It officially launched on Uganda’s 96.6 Spirit FM on December 9, 2019, and
                  continues to impact lives today. Click below to listen and be blessed.
                </p>
                {/* <p className="text-gray-600">
                  "Spirit World" broadcasts every <strong>Monday</strong> evening at{' '}
                  <strong>10:00 PM</strong> on <strong>Spirit FM 96.6</strong>, in Kampala Uganda.
                </p> */}
                <Link href="/audios">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage('Audio')}
                    className="w-full border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white transition-all duration-200"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Listen Online
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* YouTube Channel */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Youtube className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">YouTube Channel</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  The YouTube channel serves as a platform where various prophetic fulfillments,
                  testimonies, and key ministry moments are documented and shared. Through these
                  videos, be encouraged by the real-life testimonies of His faithfulness.
                </p>

                {/* <div className="border-l-4 border-[#B28930] pl-4">
                  <p className="text-[#B28930] font-semibold italic">
                    "Believe in the Lord your God, so shall ye be established, believe his prophets,
                    so shall ye prosper"
                  </p>
                  <p className="text-sm text-gray-600 mt-2">— 2 Chronicles 20:20</p>
                </div> */}

                <a
                  href="https://www.youtube.com/channel/UCjF4Z56eCPD-gnWO1TOmFMQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center justify-center px-4 py-2 rounded-md"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Visit Channel
                </a>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Social Media</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Stay connected, informed, and engaged with what God is doing through the ministry
                  in real time. Receive regular updates on ministry activities and
                  announcements.{' '}
                </p>
                <div className="flex justify-center space-x-4 my-4">
                  <a
                    href="https://www.facebook.com/ProphetNamara"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </a>

                  <a
                    href="https://x.com/ProphetNamara"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition"
                  >
                    <Twitter className="h-5 w-5 text-white" />
                  </a>

                  <a
                    href="https://www.instagram.com/prophetnamara/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </a>

                  <a
                    href="https://vm.tiktok.com/ZMSRsYWM1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-neutral-800 transition"
                  >
                    <Music2 className="h-5 w-5 text-white" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
