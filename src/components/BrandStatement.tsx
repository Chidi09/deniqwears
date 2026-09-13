import React from 'react';

export const BrandStatement: React.FC = () => {
  return (
    <section 
      id="brand-statement"
      className="max-w-[1344px] mx-auto px-5 md:px-12 py-24 md:py-36 text-center flex flex-col items-center justify-center border-t border-[#D8D4CC]"
    >
      <div className="max-w-[760px] space-y-6">
        <span className="text-[11px] uppercase tracking-[0.35em] font-semibold text-[#56554F]">
          DENIQWEARS
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#171714] leading-[1.12] tracking-tight text-balance">
          Designed for women who <br />
          don’t need permission <br />
          <span className="italic font-normal">to be noticed.</span>
        </h2>

        <div className="pt-4">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[#681F2C]">
            LAGOS · NIGERIA
          </p>
        </div>
      </div>
    </section>
  );
};
