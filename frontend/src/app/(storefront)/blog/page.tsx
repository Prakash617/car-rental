"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  Tag,
  Compass,
  Car,
  ChevronRight,
  Flame,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import { BlogPost } from "@/types";
import { fetchBlogPosts } from "@/lib/api/blog";

const CATEGORIES = [
  { id: "all", label: "All Stories" },
  { id: "Travel Guide", label: "Travel Guides" },
  { id: "Travel Tips", label: "Tips & Safety" },
  { id: "Wedding & Events", label: "Wedding & Events" },
  { id: "Fleet Guide", label: "Fleet & Electric Vehicles" },
];

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Top 7 Scenic Road Trips from Kathmandu with a Chauffeur",
    slug: "top-7-scenic-road-trips-from-kathmandu",
    category: "Travel Guide",
    tags: "Kathmandu, Pokhara, Chitwan, Road Trips, Nepal Tourism",
    author_name: "Apex Travel Desk",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    read_time_minutes: 6,
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Explore Nepal’s breathtaking mountain vistas and lush valleys without the stress of driving. Discover the top scenic routes from Kathmandu.",
    content: "Full guide to scenic routes...",
    is_published: true,
    views_count: 248,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Why Hiring a Car with Driver in Nepal is Cheaper & Safer than Self-Driving",
    slug: "hiring-car-with-driver-vs-self-drive-nepal",
    category: "Travel Tips",
    tags: "Car Rental Tips, Safety, Nepal Travel, Chauffeur",
    author_name: "Bikash Adhikari",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    read_time_minutes: 5,
    cover_image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Self-drive in Nepal involves high security deposits, liability risks, and complex highway navigation. Here is why chauffeured rental is the smart choice.",
    content: "Detailed breakdown of savings and safety...",
    is_published: true,
    views_count: 312,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Complete Guide to Wedding Car Decoration & Convoy Hire in Kathmandu",
    slug: "guide-to-wedding-car-decoration-kathmandu",
    category: "Wedding & Events",
    tags: "Wedding, Vivaha, Marriage Car, Luxury Fleet",
    author_name: "Prerana Shrestha",
    author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    read_time_minutes: 7,
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    excerpt: "From fresh floral arrangements to VIP bride & groom luxury sedans, here is how to book the perfect marriage car package in Nepal.",
    content: "Everything about wedding car styling...",
    is_published: true,
    views_count: 184,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Electric Hiace vs Diesel Van: Which is Best for Nepal Group Travel?",
    slug: "electric-hiace-vs-diesel-van-nepal",
    category: "Fleet Guide",
    tags: "Electric Vehicles, EV Hiace, Group Travel, Green Mobility",
    author_name: "Apex Tech Desk",
    author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    read_time_minutes: 4,
    cover_image: "https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1200&q=80",
    excerpt: "With Nepal’s clean hydroelectric grid expanding, EV micro-buses are dominating highway transit. Here is a head-to-head comparison.",
    content: "Comparison of EV vs Diesel Hiace...",
    is_published: true,
    views_count: 420,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts()
      .then((data) => {
        if (data && data.length > 0) {
          setPosts(data);
        }
      })
      .catch(() => {
        // Fallback to static default posts
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        (post.tags && post.tags.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-slate-200/80 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-[#e11d2e] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-semibold">Blog &amp; Travel Insights</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#e11d2e] text-xs font-bold tracking-wide">
                <Flame className="w-3.5 h-3.5 text-[#e11d2e]" />
                <span>Apex Travel Journal &amp; Car Guides</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Road Trip Stories, Nepal Routes &amp; Vehicle Guides
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Expert road insights from professional chauffeurs, scenic highway itineraries, wedding convoy tips, and smart vehicle rental advice across Nepal.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full lg:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, destinations..."
                className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#388ddd] focus:border-[#388ddd] outline-none text-slate-900 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#e11d2e] text-white shadow-md shadow-red-500/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No blog articles found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn&apos;t find any stories matching your query. Try resetting your search filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post Card (Hero Spotlight) */}
            {featuredPost && (
              <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Image Side */}
                  <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[380px] overflow-hidden bg-slate-100">
                    <img
                      src={
                        featuredPost.cover_image ||
                        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#e11d2e] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm">
                        Featured Story
                      </span>
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(featuredPost.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {featuredPost.read_time_minutes} min read
                        </span>
                      </div>

                      <Link href={`/blog/${featuredPost.slug}`}>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#e11d2e] transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200">
                          {featuredPost.author_avatar ? (
                            <img
                              src={featuredPost.author_avatar}
                              alt={featuredPost.author_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-xs font-bold">
                              {featuredPost.author_name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {featuredPost.author_name}
                          </div>
                          <div className="text-[10px] text-slate-500">Editorial Contributor</div>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-[#e11d2e] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Read Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Regular Grid */}
            {regularPosts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#388ddd]" /> Latest Articles &amp; Road Notes
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {filteredPosts.length} stories
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                    >
                      {/* Card Thumbnail */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="relative h-48 w-full overflow-hidden bg-slate-100 block"
                      >
                        <img
                          src={
                            post.cover_image ||
                            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-xs">
                          {post.category}
                        </span>
                      </Link>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>
                              {new Date(post.published_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>&bull;</span>
                            <span>{post.read_time_minutes} min read</span>
                          </div>

                          <Link href={`/blog/${post.slug}`}>
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-[#e11d2e] transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                          </Link>

                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 font-normal">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author & Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200">
                              {post.author_avatar ? (
                                <img
                                  src={post.author_avatar}
                                  alt={post.author_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-[10px] font-bold">
                                  {post.author_name[0]}
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                              {post.author_name}
                            </span>
                          </div>

                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-xs font-bold text-[#388ddd] group-hover:text-[#e11d2e] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 3. Promotional Road Trip CTA Banner */}
        <section className="bg-gradient-to-r from-[#0b1329] via-[#101b3b] to-[#1e293b] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#e11d2e]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Fleet &bull; 10% Advance Booking</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Hit the Highway Across Nepal?
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Rent sedans, 4WD Scorpios, luxury marriage cars, or electric Hiace vans with experienced drivers. Transparent rates in NPR with zero hidden surcharges.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/search"
                className="px-6 py-3 bg-[#e11d2e] hover:bg-[#b01524] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
              >
                <Car className="w-4 h-4" />
                <span>Search Available Vehicles</span>
              </Link>

              <a
                href="tel:+9779741816117"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call Hotline (+977 974 181 6117)</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
