import React from 'react';

export const EditorialBreak: React.FC = () => {
  return (
    <section 
      id="editorial-break"
      className="relative w-full min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden my-12 border-y border-[#D8D4CC]"
    >
      {/* Background Photography with deep contrast tint */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1800&auto=format&fit=crop"
          alt="Deniqwears Brand Campaign Editorial Note"
          className="w-full h-full object-cover object-[center_30%] filter brightness-[0.78] contrast-[1.08]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#171714]/30" />
      </div>

      {/* Floating Content Box */}
      <div className="relative z-10 max-w-[900px] mx-auto px-6 py-16 text-center text-[#FAF9F6] flex flex-col items-center">
        <div className="w-8 h-px bg-[#D8D4CC]/60 mb-6" />

        <blockquote className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight font-normal text-balance max-w-[820px]">
          “She doesn&apos;t dress for the room. <br className="hidden sm:inline" />
          <span className="italic">She changes it.”</span>
        </blockquote>

        <div className="mt-8 flex items-center space-x-3 text-xs uppercase tracking-[0.3em] text-[#FAF9F6]/90 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#681F2C]" />
          <span>DENIQ NOTES — ISSUE 01</span>
        </div>
      </div>
    </section>
  );
};
