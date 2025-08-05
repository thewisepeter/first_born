'use client';

import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, Users, Radio, Youtube, Facebook, Twitter, Instagram, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Pastor Hero Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Pastor Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&crop=face"
                  alt="Pastor John Smith"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#B28930] rounded-full opacity-20" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-600 rounded-full opacity-20" />
            </div>

            {/* Pastor Bio */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Meet Pastor John Smith
                </h1>
                <h2 className="text-2xl text-[#B28930] mb-6">Senior Pastor & Founder</h2>
              </div>

              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  Pastor John Smith has been serving God's people for over 25 years, bringing a heart of compassion 
                  and a passion for biblical truth to every aspect of ministry. He founded Grace Church in 1998 
                  with a vision to create a community where people could encounter God's love and grow in their faith.
                </p>
                
                <p>
                  With a Master of Divinity from Seminary University and a Doctor of Ministry focused on pastoral 
                  leadership, Pastor John combines theological depth with practical wisdom. He is known for his 
                  engaging preaching style that makes complex biblical concepts accessible to all.
                </p>

                <p>
                  Beyond the pulpit, Pastor John is a devoted husband to Sarah and father to three children. 
                  He enjoys reading, hiking, and spending quality time with the church family. His heart's desire 
                  is to see every person discover their God-given purpose and live it out boldly.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>25+ Years in Ministry</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Church Founder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Church Information Tiles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Church & Ministry</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover more about Grace Church, our history, and the various ways we connect with our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Church History */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Our History</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Founded in 1998, Grace Church started with just 25 members in a small community center. 
                  Today, we're a thriving congregation of over 1,200 members.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>1998:</strong> Church Founded</p>
                  <p><strong>2003:</strong> First Building</p>
                  <p><strong>2010:</strong> Youth Center Added</p>
                  <p><strong>2018:</strong> Community Outreach Hub</p>
                </div>
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Radio Ministry */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B28930] to-[#9A7328] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Radio Ministry</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  "Faith & Hope Radio" broadcasts every Sunday morning at 8:00 AM on KGOD 99.5 FM, 
                  reaching thousands across our region.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>Station:</strong> KGOD 99.5 FM</p>
                  <p><strong>Time:</strong> Sundays 8:00 AM</p>
                  <p><strong>Reach:</strong> 50-mile radius</p>
                  <p><strong>Listeners:</strong> 10,000+ weekly</p>
                </div>
                <Button variant="outline" className="w-full border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white">
                  Listen Online
                </Button>
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
                  Watch our weekly sermons, special events, and inspiring testimonies on our YouTube channel 
                  with over 5,000 subscribers.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>Subscribers:</strong> 5,000+</p>
                  <p><strong>Videos:</strong> 200+ sermons</p>
                  <p><strong>Views:</strong> 100,000+ total</p>
                  <p><strong>Upload:</strong> Every Sunday</p>
                </div>
                <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                  Visit Channel
                </Button>
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
                  Stay connected with our church family through our active social media presence across 
                  multiple platforms.
                </p>
                <div className="flex justify-center space-x-4 my-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                    <Twitter className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>Facebook: 3,000+ followers</p>
                  <p>Instagram: 1,500+ followers</p>
                  <p>Twitter: 800+ followers</p>
                </div>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  Follow Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To create a loving community where people can encounter Jesus Christ, grow in their faith, 
                and discover their God-given purpose while serving others with compassion and grace.
              </p>
              <div className="border-l-4 border-[#B28930] pl-4">
                <p className="text-[#B28930] font-semibold italic">
                  "Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."
                </p>
                <p className="text-sm text-gray-600 mt-2">— Matthew 28:19</p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To be a beacon of hope in our community, where every person feels valued, loved, and empowered 
                to live out their faith boldly, transforming lives and communities for God's glory.
              </p>
              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-purple-600 font-semibold italic">
                  "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future."
                </p>
                <p className="text-sm text-gray-600 mt-2">— Jeremiah 29:11</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}