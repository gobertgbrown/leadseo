import React, { useState, useEffect } from 'react';
import { BlogPost, BlogCategory } from '../types.js';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Search,
  Share2,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BlogViewProps {
  initialSlug?: string | null;
  onNavigateAudit: () => void;
  onNavigateLanding: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  initialSlug,
  onNavigateAudit,
  onNavigateLanding,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/categories'),
      ]);
      const postsData = await postsRes.json();
      const catsData = await catsRes.json();

      if (postsData.posts) {
        setPosts(postsData.posts);
        if (initialSlug) {
          const match = postsData.posts.find((p: BlogPost) => p.slug === initialSlug);
          if (match) setActivePost(match);
        }
      }
      if (catsData.categories) {
        setCategories(catsData.categories);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadPost = async (post: BlogPost) => {
    setActivePost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      fetch(`/api/blogs/${post.slug}`);
    } catch {
      // Ignore
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory !== 'all' && post.category_id !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="blog-insights-view" className="min-h-screen bg-[#faf8ff] pb-20">
      {/* Blog Hero Header */}
      <div className="bg-gradient-to-b from-[#131b2e] to-[#1f293d] text-white py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-3">
            <button onClick={onNavigateLanding} className="hover:underline">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#a5b4fc]">LeadPulse Insights & SEO Guides</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Technical SEO, Cold Outreach & B2B Lead Gen Playbooks
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
            In-depth teardowns, algorithm update analyses, and proven strategies to acquire high-value
            B2B clients using precision web crawling and site auditing.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Search & Categories Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-md border border-[#eaedff] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setActivePost(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#faf8ff] text-[#464555] hover:bg-[#eaedff]'
              }`}
            >
              All Articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActivePost(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#faf8ff] text-[#464555] hover:bg-[#eaedff]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#595768]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
            />
          </div>
        </div>

        {/* ================= FULL POST READER VIEW ================= */}
        {activePost ? (
          <article className="bg-white rounded-3xl shadow-sm border border-[#eaedff] overflow-hidden mb-12">
            <div className="p-6 sm:p-10 border-b border-[#eaedff]">
              <button
                onClick={() => setActivePost(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#3525cd] hover:underline mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Articles</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-[#eaedff] text-[#3525cd] text-xs font-bold rounded-full uppercase">
                  {activePost.category_name}
                </span>
                <span className="text-xs text-[#595768] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activePost.read_time}</span>
                </span>
                <span className="text-xs text-[#595768] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{activePost.views} views</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mb-4 leading-tight">
                {activePost.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-[#595768]">
                <div className="w-8 h-8 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-bold">
                  {activePost.author[0]}
                </div>
                <div>
                  <div className="font-bold text-[#131b2e]">{activePost.author}</div>
                  <div>Published on {new Date(activePost.published_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="w-full max-h-96 overflow-hidden bg-[#faf8ff]">
              <img
                src={activePost.featured_image}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-10 max-w-3xl mx-auto">
              <div className="text-base text-[#131b2e] leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {activePost.content}
              </div>

              {/* Call-to-action banner inside article */}
              <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#eef2ff] to-[#f5f3ff] border border-[#d6e0ff]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#131b2e] mb-1">
                      Ready to diagnose your own website's SEO health?
                    </h4>
                    <p className="text-xs text-[#464555] mb-4">
                      Run our automated technical crawler to uncover critical SERP errors, robots.txt
                      misconfigurations, and structured schema gaps instantly.
                    </p>
                    <button
                      onClick={onNavigateAudit}
                      className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3525cd]/20 transition-all"
                    >
                      Run Instant Technical SEO Audit →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ) : (
          /* ================= BLOG POSTS GRID ================= */
          <div>
            {isLoading ? (
              <div className="text-center py-16 text-sm text-[#595768]">Loading articles...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#eaedff]">
                <BookOpen className="w-12 h-12 text-[#c7c4d8] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#131b2e] mb-1">No articles found</h3>
                <p className="text-xs text-[#595768]">Try selecting a different category or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handleReadPost(post)}
                    className="group bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#c7c4d8] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-[#faf8ff]">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-xs text-[#3525cd] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                          {post.category_name}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3 text-[11px] text-[#777587] mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.read_time}</span>
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-[#131b2e] group-hover:text-[#3525cd] transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-[#595768] line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-[#faf8ff] text-xs font-bold text-[#3525cd]">
                      <span>Read Full Guide</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
