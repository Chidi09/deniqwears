import React from 'react';
import { COMMUNITY_POSTS } from '../data/products';
import { Instagram } from 'lucide-react';

export const CommunitySection: React.FC = () => {
  return (
    <section id="community-section" className="max-w-[1344px] mx-auto px-5 md:px-12 py-20 md:py-28 border-t border-[#D8D4CC]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#D8D4CC]">
        <div>
          <span className="text-xs tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
            COMMUNITY ARCHIVE
          </span>
          <h3 className="font-serif text-3xl md:text-4xl text-[#171714] mt-1">
            SEEN IN DENIQ
          </h3>
        </div>
        <a
          href="https://instagram.com/deniqwears"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-2 text-xs tracking-[0.16em] uppercase font-medium text-[#171714] hover:text-[#681F2C] transition-colors mt-2 sm:mt-0"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>@deniqwears</span>
        </a>
      </div>

      {/* 6 Curated High-Art-Direction Community Posts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {COMMUNITY_POSTS.map((post) => (
          <div
            key={post.id}
            className="group relative aspect-square overflow-hidden bg-[#FAF9F6] border border-[#D8D4CC]"
          >
            <img
              src={post.image}
              alt={`${post.handle} wearing ${post.product}`}
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle Overlay on hover */}
            <div className="absolute inset-0 bg-[#171714]/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-[#FAF9F6]">
              <span className="text-xs font-medium tracking-wide">
                {post.handle}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#D8D4CC]">
                {post.location}
              </span>
              <span className="text-[10px] text-[#B78D91] mt-0.5 truncate">
                {post.product}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
