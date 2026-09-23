import React from 'react';

export const EditorialBreak: React.FC = () => {
  return (
    <section 
      id="editorial-break"
      className="relative w-full min-h-[440px] md:min-h-[520px] flex items-center justify-center overflow-hidden my-12 border-y border-[#D8D4CC]"
    >
      {/* Typographic backdrop — no photography needed */}
      <div className="absolute inset-0 bg-[#171714]" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(104,31,44,0.55),transparent_70%)]" />
        <span className="absolute -right-10 -bottom-24 font-serif italic text-[420px] md:text-[620px] leading-none text-[#FAF9F6]/[0.04] select-none">
          D
        </span>
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
