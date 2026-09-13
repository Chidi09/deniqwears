import React from 'react';
import { ArrowLeft, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { ActivePage } from '../types';

interface AboutPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div id="about-deniq-page" className="min-h-screen bg-[#F4F1EB] pt-8 pb-32">
      <div className="max-w-[1344px] mx-auto px-5 md:px-12">
        {/* Back Link */}
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.16em] text-[#56554F] hover:text-[#171714] mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Hero Section */}
        <div className="py-12 md:py-20 border-b border-[#D8D4CC]">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#681F2C]">
            Brand Manifesto
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-[#171714] mt-2 max-w-[900px] leading-[1.04]">
            Contemporary fashion boutique × editorial magazine × private showroom.
          </h1>
          <p className="text-[#56554F] text-lg md:text-xl font-light max-w-[620px] mt-6 leading-relaxed">
            Deniqwears was founded in Lagos, Nigeria, to challenge the formulaic sameness of modern retail. We create clothes for the entrance — unhurried, architectural, and deeply intentional.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 md:py-24 border-b border-[#D8D4CC]">
          <div className="lg:col-span-6 space-y-6 text-[#56554F] text-base md:text-lg font-light leading-relaxed">
            <h3 className="font-serif text-3xl text-[#171714]">
              Not generic luxury. Real presence.
            </h3>
            <p>
              We reject the predictable boutique formula of beige cards, centered serif headings, rounded buttons everywhere, and endless product grids. Deniqwears pairs editorial imagery with restrained, decisive commerce UI.
            </p>
            <p>
              Our color palette is anchored in Canvas (#F4F1EB), Ink (#171714), and signature Oxblood (#681F2C)—a rich accent that preserves tension and prevents the brand from becoming another black-and-cream fashion facade.
            </p>
            <p>
              Every garment is cut from double-faced Japanese satins, virgin wool blends, and structured cotton twills, engineered to drape with natural authority.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] bg-[#FAF9F6] border border-[#D8D4CC] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
                alt="Deniqwears Atelier Fitting in Lagos"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#171714]/70 backdrop-blur-xs p-3 text-white text-xs uppercase tracking-wider flex justify-between">
                <span>Atelier Fitting 01</span>
                <span>Victoria Island, Lagos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Atelier & Showroom Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="space-y-3 p-6 bg-[#FAF9F6] border border-[#D8D4CC]">
            <MapPin className="w-5 h-5 text-[#681F2C]" />
            <h4 className="font-serif text-2xl text-[#171714]">The Flagship</h4>
            <p className="text-xs text-[#56554F] leading-relaxed">
              Plot 14 Oko Awo Street<br />
              Victoria Island, Lagos<br />
              Nigeria
            </p>
          </div>

          <div className="space-y-3 p-6 bg-[#FAF9F6] border border-[#D8D4CC]">
            <Clock className="w-5 h-5 text-[#681F2C]" />
            <h4 className="font-serif text-2xl text-[#171714]">Showroom Hours</h4>
            <p className="text-xs text-[#56554F] leading-relaxed">
              Monday – Friday: 10:00 – 19:00<br />
              Saturday: 11:00 – 18:00<br />
              Sunday: By Private Booking
            </p>
          </div>

          <div className="space-y-3 p-6 bg-[#FAF9F6] border border-[#D8D4CC]">
            <Mail className="w-5 h-5 text-[#681F2C]" />
            <h4 className="font-serif text-2xl text-[#171714]">Client Concierge</h4>
            <p className="text-xs text-[#56554F] leading-relaxed">
              concierge@deniqwears.com<br />
              +234 1 291 0048<br />
              WhatsApp: +234 818 000 3344
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
