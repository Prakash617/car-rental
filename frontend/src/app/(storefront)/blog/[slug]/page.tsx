"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Eye,
  User,
  Share2,
  Bookmark,
  Car,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Sparkles,
  MapPin
} from "lucide-react";
import { BlogPost } from "@/types";
import { fetchBlogPostBySlug, fetchBlogPosts } from "@/lib/api/blog";

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetchBlogPostBySlug(slug)
      .then((data) => {
        setPost(data);
      })
      .catch(() => {
        // Fallback demo content if offline or loading error
        setPost({
          id: "1",
          title: "Top 7 Scenic Road Trips from Kathmandu with a Chauffeur",
          slug: slug,
          category: "Travel Guide",
          tags: "Kathmandu, Pokhara, Chitwan, Road Trips, Nepal Tourism",
          author_name: "Apex Travel Desk",
          author_avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          read_time_minutes: 6,
          cover_image:
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
          excerpt:
            "Explore Nepal’s breathtaking mountain vistas and lush valleys without the stress of driving. Discover the top scenic routes from Kathmandu.",
          content: `Nepal offers some of the most dramatic driving routes on the planet. From winding Himalayan switchbacks to misty sub-tropical valleys, road trips here are unforgettable adventures.

### 1. Kathmandu to Pokhara (Prithvi Highway)
The iconic 200 km highway follows the roaring Trishuli and Marsyangdi rivers. Stop at Malekhu for famous local fish, cross suspension footbridges, and soak in views of Manaslu and the Annapurna range as you descend into the valley of lakes.

### 2. Kathmandu to Nagarkot & Dhulikhel Sunrise Circuit
Only 32 km east of Kathmandu, this drive winds through terraced pine hills. Booking a private chauffeured car allows you to reach the Nagarkot lookout tower comfortably before 5:00 AM for an unobstructed Himalayan sunrise stretching from Dhaulagiri to Everest.

### 3. Kathmandu to Chitwan National Park (Wildlife Expedition)
Trade mountain cold for the warm jungles of the Terai. The highway down through Mugling to Narayanghat and Sauraha takes about 5 to 6 hours. Enjoy jungle safaris, bird-watching, and elephant encounters.

### 4. Kathmandu to Kalinchowk (Snow & Shrine Tour)
For snow lovers and pilgrims, the drive to Kuri Village via Charikot offers dramatic cliffs and cable car access to the Kalinchowk Bhagwati temple perched at 3,842 meters. High ground-clearance 4WD vehicles like Mahindra Scorpio are strongly recommended for this route.

### Why Chauffeured Car Rental is Essential in Nepal
Nepal’s mountainous topography requires defensive driving, gear braking, and acute familiarity with highway blind turns. With a verified Apex chauffeur, you sit back, enjoy curated music, and photograph the Himalayas at your leisure.`,
          is_published: true,
          views_count: 248,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Also fetch other posts for related widget
    fetchBlogPosts()
      .then((all) => {
        if (all) {
          setRelatedPosts(all.filter((p) => p.slug !== slug).slice(0, 3));
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8 text-slate-500 text-sm">
        <div className="animate-pulse space-y-4 max-w-lg w-full">
          <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-10 bg-slate-200 rounded-lg w-full" />
          <div className="h-64 bg-slate-200 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Article not found</h2>
        <p className="text-xs text-slate-500 mt-1">This blog article may have been moved or removed.</p>
        <Link
          href="/blog"
          className="mt-4 px-4 py-2 bg-[#e11d2e] text-white rounded-xl text-xs font-bold"
        >
          Return to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 pb-20">
      {/* 1. Article Top Header */}
      <div className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#e11d2e] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          {/* Category & Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="px-3 py-1 bg-red-50 border border-red-200 text-[#e11d2e] font-extrabold uppercase tracking-wider rounded-lg text-[10px]">
              {post.category}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {post.read_time_minutes} min read
            </span>
            {post.views_count > 0 && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {post.views_count} views
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author Row & Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-xs">
                    {post.author_name[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{post.author_name}</div>
                <div className="text-[11px] text-slate-500">Apex Contributor</div>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Body Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Cover Hero Image */}
        {post.cover_image && (
          <div className="rounded-3xl overflow-hidden shadow-md bg-slate-100 max-h-[500px]">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Lead Excerpt Callout */}
        {post.excerpt && (
          <div className="bg-red-50/60 border-l-4 border-[#e11d2e] p-5 rounded-r-2xl">
            <p className="text-sm sm:text-base font-medium text-slate-800 italic leading-relaxed">
              &ldquo;{post.excerpt}&rdquo;
            </p>
          </div>
        )}

        {/* Article Markdown/HTML Body */}
        <article className="prose prose-slate max-w-none space-y-6 text-slate-800 text-sm sm:text-base leading-relaxed">
          {post.content.split("\n\n").map((block, idx) => {
            const trimmed = block.trim();
            if (trimmed.startsWith("### ")) {
              return (
                <h3
                  key={idx}
                  className="text-lg sm:text-xl font-extrabold text-slate-900 pt-4 pb-1 border-b border-slate-100"
                >
                  {trimmed.replace("### ", "")}
                </h3>
              );
            }
            if (trimmed.startsWith("- ")) {
              const items = trimmed.split("\n").map((li) => li.replace("- ", ""));
              return (
                <ul key={idx} className="space-y-2 list-disc list-inside text-slate-700">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-slate-700 font-normal leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* Tags */}
        {post.tags && (
          <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Tags:
            </span>
            {post.tags.split(",").map((tag, i) => (
              <Link
                key={i}
                href={`/blog?search=${encodeURIComponent(tag.trim())}`}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs hover:border-[#388ddd] hover:text-[#388ddd] transition-colors"
              >
                #{tag.trim()}
              </Link>
            ))}
          </div>
        )}

        {/* Quick Car Rental CTA Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e11d2e]">
              <Sparkles className="w-3.5 h-3.5" /> Book This Journey Today
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Need a Verified Car &amp; Driver for this Route?
            </h3>
            <p className="text-xs text-slate-600">
              Pick from Sedans, Scorpio 4WDs, or Electric Hiaces. Fixed rates in NPR with 10% advance booking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/search"
              className="w-full sm:w-auto px-6 py-3 bg-[#e11d2e] hover:bg-[#b01524] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Search Cars</span>
            </Link>

            <a
              href="tel:+9779741816117"
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-slate-900">More Travel Stories &amp; Guides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="h-36 w-full overflow-hidden bg-slate-100">
                    <img
                      src={rel.cover_image || ""}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#e11d2e]">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#388ddd] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{rel.read_time_minutes} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
