import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogSRCCAdmission() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center"><img src="/logo-full.png" alt="Crack CUET" className="h-8" /></Link>
          <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-900">All Blogs</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-sm font-medium text-blue-600">Admissions</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight">How to Get Admission into SRCC, St. Stephen's & Hindu College via CUET</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Feb 18, 2025</span>
            <span>10 min read</span>
            <span>By Crack CUET Team</span>
          </div>
        </div>

        <img src="https://static.prod-images.emergentagent.com/jobs/5b2b1e68-49ec-49e1-a862-004fc1e6e798/images/bdc8a61aa53485572707c58e4780d3e2399b5a930f91f1b45bef2083b2ac6b47.png"
          alt="Delhi University North Campus colleges" className="w-full rounded-xl mb-8" />

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            Every year, lakhs of students dream of walking through the gates of Delhi University's North Campus. <strong>SRCC, St. Stephen's, Hindu College, Hansraj, Miranda House</strong> — these aren't just colleges, they're institutions that shape careers. And since 2022, there's only one way in: <strong>CUET</strong>.
          </p>
          <p>
            This guide covers everything — expected cutoffs, subject combinations, preparation strategy, and insider tips from students who made it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Understanding CUET-Based Admissions at DU</h2>
          <p>Here's how DU admissions work now:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>100% weightage to CUET scores</strong> — your Class 12 marks don't matter for admission (only minimum eligibility)</li>
            <li>You need to appear for: <strong>English (mandatory) + Domain subjects (relevant to your course) + General Test</strong></li>
            <li>Each college sets its own <strong>merit list based on CUET percentile</strong></li>
            <li>Top colleges like SRCC typically need <strong>98-99+ percentile</strong> in relevant subjects</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">College-Wise Breakdown</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">SRCC (Shri Ram College of Commerce)</h3>
          <p><strong>Most sought-after for:</strong> B.Com (Hons), B.A. (Hons) Economics</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Expected CUET cutoff:</strong> 98.5-99.5 percentile (B.Com Hons), 98-99 percentile (Economics)</li>
            <li><strong>Key subjects:</strong> English + Accountancy/Economics/Business Studies/Mathematics</li>
            <li><strong>What makes SRCC special:</strong> World-class alumni network (CEOs, IAS officers, entrepreneurs), stellar placement record, vibrant campus life</li>
            <li><strong>Insider tip:</strong> SRCC values well-rounded scores. Don't just ace one subject — aim for 95+ percentile in ALL your CUET subjects</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">St. Stephen's College</h3>
          <p><strong>Most sought-after for:</strong> B.A. (Hons) English, Economics, History, B.Sc programmes</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Expected CUET cutoff:</strong> 97-99 percentile (varies by course)</li>
            <li><strong>Important:</strong> St. Stephen's conducts its own <strong>interview round</strong> in addition to CUET scores (15% weightage to interview)</li>
            <li><strong>CUET score weightage:</strong> 85% CUET + 15% interview</li>
            <li><strong>Insider tip:</strong> Prepare for the interview — read widely, have opinions on current affairs. They value articulate, well-read students</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Hindu College</h3>
          <p><strong>Most sought-after for:</strong> B.A. (Hons) Economics, English, History, B.Com (Hons), B.Sc</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Expected CUET cutoff:</strong> 97-98.5 percentile</li>
            <li><strong>Admission:</strong> Purely CUET-based, no interview</li>
            <li><strong>What makes Hindu special:</strong> Known for academic excellence and liberal campus culture. The Economics department is legendary</li>
            <li><strong>Insider tip:</strong> Hindu College's cutoffs for B.Sc courses are slightly lower (94-96 percentile) — a realistic target for science students</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Other Top North Campus Colleges</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Hansraj College:</strong> 95-97 percentile. Excellent for Science and Commerce</li>
            <li><strong>Miranda House (Women):</strong> 96-98 percentile. Top-ranked women's college in India</li>
            <li><strong>Kirori Mal College:</strong> 93-96 percentile. Strong placement cell and societies</li>
            <li><strong>Ramjas College:</strong> 92-95 percentile. Great campus, active student culture</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The Winning Subject Combinations</h2>
          <p>Choose your CUET subjects strategically:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">For Commerce (B.Com/BBA)</h3>
          <p>English + Accountancy + Business Studies + Economics + Mathematics (bonus)</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">For Arts/Humanities (B.A.)</h3>
          <p>English + History + Political Science + Economics (or Geography/Sociology based on your strength)</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">For Science (B.Sc)</h3>
          <p>English + Physics + Chemistry + Mathematics/Biology + General Test</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Month-by-Month Preparation Timeline</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">3 Months Before CUET</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Complete NCERT revision for all subjects</li>
            <li>Take your first diagnostic mock test on Crack CUET (free)</li>
            <li>Identify your weakest subject — give it 40% of your study time</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">2 Months Before CUET</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Take 2-3 mocks per week across all subjects</li>
            <li>Focus on mock analysis: review every wrong answer</li>
            <li>Practice English reading comprehension daily (read editorials from The Hindu/Indian Express)</li>
            <li>Target: consistently scoring 200+ in each subject mock</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">1 Month Before CUET</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full-length mocks every alternate day</li>
            <li>Revise your error log — focus on recurring mistakes</li>
            <li>Practice question selection: choosing the right 40 out of 50 is a skill</li>
            <li>Target: consistently scoring 220+ to be competitive for top colleges</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">5 Things Toppers Do Differently</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>They start mock tests early</strong> — not 2 weeks before the exam, but 2-3 months before</li>
            <li><strong>They analyse mocks ruthlessly</strong> — spending more time on analysis than on taking the test itself</li>
            <li><strong>They focus on NCERT first</strong> — coaching material is supplementary, NCERT is primary</li>
            <li><strong>They practice question selection</strong> — in CUET, skipping hard questions is a strategy, not a weakness</li>
            <li><strong>They stay consistent</strong> — 3 hours of daily focused study beats 10 hours of cramming before exams</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Life at North Campus — What Awaits You</h2>
          <p>
            Getting into a North Campus college isn't just about a degree. It's about:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>World-class peers</strong> — your batchmates will go on to become IAS officers, entrepreneurs, journalists, and leaders</li>
            <li><strong>Incredible societies</strong> — from debating and dramatics to finance and consulting clubs</li>
            <li><strong>Placement opportunities</strong> — companies like McKinsey, Goldman Sachs, Deloitte, and Google recruit from these colleges</li>
            <li><strong>The Delhi experience</strong> — from Kamla Nagar street food to North Campus cafes, it's an unforgettable 3 years</li>
          </ul>
          <p>
            The hard work you put in now for CUET will pay dividends for the rest of your career. Every extra hour of practice, every mock test analysed, every weak topic strengthened — it all compounds.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your North Campus journey starts with one mock test</h3>
            <p className="text-gray-600 mb-4">Join 460+ students already preparing on Crack CUET. Take your first free mock and see where you stand.</p>
            <Link to="/auth" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Start Free on Crack CUET
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
