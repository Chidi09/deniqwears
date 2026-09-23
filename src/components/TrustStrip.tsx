import React from 'react';
import { Ruler, RefreshCcw, ShieldCheck, Sparkles } from 'lucide-react';

interface TrustStripProps {
  returnPeriodDays: number;
  onOpenSizeGuide: () => void;
}

/** Quick reassurance under the hero: the questions shoppers ask before buying. */
export const TrustStrip: React.FC<TrustStripProps> = ({ returnPeriodDays, onOpenSizeGuide }) => {
  const items = [
    {
      icon: Ruler,
      title: 'Sizes 10–20',
      text: 'In every design',
      action: { label: 'See size chart', onClick: onOpenSizeGuide },
    },
    { icon: RefreshCcw, title: `${returnPeriodDays}-day returns`, text: 'Easy returns & exchanges' },
    { icon: ShieldCheck, title: 'Secure checkout', text: 'Your payment is protected' },
    { icon: Sparkles, title: 'New every month', text: 'Fresh designs, limited runs' },
  ];

  return (
    <section aria-label="Why shop with us" className="bg-[#FAF9F6] border-b border-[#D8D4CC]">
      <ul className="max-w-[1344px] mx-auto px-5 md:px-12 grid grid-cols-2 lg:grid-cols-4 divide-[#D8D4CC] lg:divide-x">
        {items.map(({ icon: Icon, title, text, action }) => (
          <li key={title} className="flex items-start gap-3 py-5 lg:px-6 first:lg:pl-0">
            <span className="shrink-0 w-10 h-10 rounded-full bg-[#1E2656] text-[#FAF9F6] flex items-center justify-center">
              <Icon className="w-[18px] h-[18px] stroke-[1.6]" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#171714]">{title}</p>
              <p className="text-xs text-[#56554F] leading-snug">{text}</p>
              {action && (
                <button
                  onClick={action.onClick}
                  className="text-xs text-[#681F2C] underline underline-offset-2 mt-0.5 hover:text-[#171714]"
                >
                  {action.label}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
