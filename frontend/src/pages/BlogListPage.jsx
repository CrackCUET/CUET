import React from 'react';
import { Link } from 'react-router-dom';

const blogs = [
  {
    slug: 'best-cuet-mock-tests-2025',
    title: '7 Best CUET Mock Test Platforms in 2025 — Honest Comparison',
    excerpt: 'We compared the top CUET mock test platforms so you don\'t have to. Find out which one offers the most realistic exam simulation, AI-powered analytics, and value for money.',
    date: 'Feb 25, 2025',
    readTime: '8 min read',
    image: 'https://static.prod-images.emergentagent.com/jobs/5b2b1e68-49ec-49e1-a862-004fc1e6e798/images/edf6d057abd6e1cc1e3ab54f5e7874d115039bb9fed6e64e89bc3f4367eaeb28.png',
    category: 'Resources'
  },
  {
    slug: 'how-to-score-99-percentile-cuet',
    title: 'How to Score 99+ Percentile in CUET — A Complete Strategy Guide',
    excerpt: 'Toppers don\'t just study harder — they study smarter. Here\'s the exact 90-day strategy, subject-wise tips, and mock test routine that can get you into the 99th percentile.',
    date: 'Feb 22, 2025',
    readTime: '12 min read',
    image: 'https://static.prod-images.emergentagent.com/jobs/5b2b1e68-49ec-49e1-a862-004fc1e6e798/images/7607728828a77bdeaf3ceb4b5f266c93fd02db8de9678f3bd66525925f5d95b1.png',
    category: 'Strategy'
  },
  {
    slug: 'how-to-get-into-srcc-stephens-hindu-college',
    title: 'How to Get Admission into SRCC, St. Stephen\'s & Hindu College via CUET',
    excerpt: 'Dream of studying at North Campus? Here\'s everything you need to know about cutoffs, preparation strategy, and what it really takes to get into DU\'s most prestigious colleges.',
    date: 'Feb 18, 2025',
    readTime: '10 min read',
    image: 'https://static.prod-images.emergentagent.com/jobs/5b2b1e68-49ec-49e1-a862-004fc1e6e798/images/bdc8a61aa53485572707c58e4780d3e2399b5a930f91f1b45bef2083b2ac6b47.png',
    category: 'Admissions'
  }
];

export { blogs };

export default function BlogListPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo-full.png" alt="Crack CUET" className="h-8" />
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">Back to Home</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Crack CUET Blog</h1>
        <p className="text-lg text-gray-500 mb-10">Tips, strategies, and insights to help you ace CUET and get into your dream college.</p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link key={blog.slug} to={`/blog/${blog.slug}`} className="group" data-testid={`blog-card-${blog.slug}`}>
              <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="aspect-[3/2] overflow-hidden bg-gray-100">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-medium text-blue-600 mb-2">{blog.category}</span>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">{blog.title}</h2>
                  <p className="text-sm text-gray-500 mb-4 flex-1">{blog.excerpt}</p>
                  <div className="flex items-center text-xs text-gray-400 gap-3">
                    <span>{blog.date}</span>
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
