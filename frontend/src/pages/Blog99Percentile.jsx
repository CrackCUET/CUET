import React from 'react';
import { Link } from 'react-router-dom';

export default function Blog99Percentile() {
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
          <span className="text-sm font-medium text-blue-600">Strategy</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight">How to Score 99+ Percentile in CUET — A Complete Strategy Guide</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Feb 22, 2025</span>
            <span>12 min read</span>
            <span>By Crack CUET Team</span>
          </div>
        </div>

        <img src="https://static.prod-images.emergentagent.com/jobs/5b2b1e68-49ec-49e1-a862-004fc1e6e798/images/7607728828a77bdeaf3ceb4b5f266c93fd02db8de9678f3bd66525925f5d95b1.png"
          alt="Student celebrating 99 percentile in CUET" className="w-full rounded-xl mb-8" />

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
          <p>
            Scoring in the 99th percentile in CUET isn't about being a genius — it's about <strong>having the right strategy, consistent practice, and smart revision</strong>. Every year, thousands of students score above 99 percentile, and the majority of them follow a remarkably similar preparation pattern.
          </p>
          <p>
            This guide breaks down the exact approach — month by month, subject by subject — that has helped students secure admissions into SRCC, St. Stephen's, Hindu College, and other top DU colleges.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Understanding the CUET Scoring System</h2>
          <p>Before diving into strategy, let's understand what you're up against:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>50 questions per subject</strong>, attempt any 40 (for domain subjects)</li>
            <li><strong>+5 marks for correct answer</strong>, -1 for incorrect (negative marking)</li>
            <li><strong>Total: 250 marks per subject</strong>, 60 minutes per paper</li>
            <li><strong>99 percentile ≈ 210-230+ marks</strong> depending on the subject and year</li>
            <li>That means you need <strong>42-46 correct out of 40 attempted</strong> — essentially near-perfect accuracy on chosen questions</li>
          </ul>
          <p>
            The key insight: <strong>CUET rewards accuracy over speed</strong>. You have 50 questions, need to answer only 40. The winning strategy is picking the right 40 and getting them all correct.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The 90-Day Battle Plan</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Phase 1: Foundation (Days 1-30)</h3>
          <p><strong>Goal:</strong> Complete NCERT syllabus, build conceptual clarity.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Read NCERT textbooks for all your chosen subjects — <strong>every line matters</strong> in CUET</li>
            <li>Make short notes for each chapter (handwritten preferred for retention)</li>
            <li>Solve NCERT back-exercise questions</li>
            <li>Take <strong>1 diagnostic mock test per subject</strong> to identify your baseline</li>
            <li>Use Crack CUET's free mocks to get your starting percentile</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Phase 2: Deep Practice (Days 31-60)</h3>
          <p><strong>Goal:</strong> Build speed, accuracy, and exam temperament.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Take <strong>2-3 mock tests per week</strong> across your subjects</li>
            <li>After each mock: <strong>spend 2x the test time reviewing solutions</strong></li>
            <li>Maintain an <strong>error log</strong> — note every wrong answer with the correct concept</li>
            <li>Focus on your <strong>weakest topics first</strong> (use analytics from Crack CUET to identify these)</li>
            <li>Practice assertion-reason and case-based questions specifically — these are CUET favourites</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Phase 3: Peak Performance (Days 61-90)</h3>
          <p><strong>Goal:</strong> Simulate real exam conditions, eliminate errors.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Take <strong>full-length mocks every alternate day</strong></li>
            <li>Simulate exact exam timing: 60 minutes, no breaks, no phone</li>
            <li>Target: <strong>consistently score 220+ in mocks</strong> before the actual exam</li>
            <li>Review your error log weekly — patterns will emerge</li>
            <li>Practice the <strong>"skip and return" technique</strong>: skip tough questions immediately, come back after finishing easy ones</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Subject-Wise Tips</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">English</h3>
          <p>
            English is often the differentiator. Focus on reading comprehension speed — practice reading 300-word passages in under 2 minutes. For vocabulary, learn 10 new words daily from previous CUET papers. Grammar rules (subject-verb agreement, tenses, voice) are free marks if you know the rules.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">Domain Subjects (Economics, History, Political Science, etc.)</h3>
          <p>
            <strong>NCERT is your Bible.</strong> 80-90% of CUET questions come directly from NCERT textbooks. Read each chapter at least 3 times. Focus on:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Key definitions and concepts (often asked as direct MCQs)</li>
            <li>Diagrams and flowcharts (frequently tested)</li>
            <li>Match-the-following from tables and lists in NCERT</li>
            <li>Year-specific data and events (for History and Economics)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">General Aptitude Test (GAT)</h3>
          <p>
            GAT covers logical reasoning, quantitative aptitude, and general knowledge. Practice number series, coding-decoding, and blood relations daily. For quantitative, focus on percentages, profit-loss, and time-work — these appear every year.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The Mock Test Secret</h2>
          <p>
            Here's what separates 95th percentile scorers from 99th percentile scorers: <strong>how they use mock tests</strong>.
          </p>
          <p>
            Average students take mocks and check their score. Top scorers take mocks and:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Analyse every wrong answer</strong> — understand WHY the correct option is correct</li>
            <li><strong>Analyse questions they guessed correctly</strong> — lucky guesses won't repeat on exam day</li>
            <li><strong>Track their weak topics</strong> using analytics — then study those topics before the next mock</li>
            <li><strong>Time themselves per section</strong> — identify if they're spending too long on passages vs. direct questions</li>
            <li><strong>Practise question selection</strong> — in CUET, you have 50 questions but attempt 40. Choosing the right 40 is a skill</li>
          </ol>

          <p>
            This is exactly why we built Crack CUET with detailed topic-wise analytics and question-level solutions. Every mock you take shows you exactly where to improve next.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Common Mistakes to Avoid</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Starting mocks too late</strong> — begin at least 60 days before the exam</li>
            <li><strong>Ignoring negative marking</strong> — leave questions you're unsure about. -1 adds up fast</li>
            <li><strong>Over-relying on coaching material</strong> — NCERT should be primary, everything else secondary</li>
            <li><strong>Not practising under timed conditions</strong> — exam pressure is real, simulate it</li>
            <li><strong>Studying all subjects equally</strong> — spend more time on weak subjects, maintain strong ones</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Start your 99 percentile journey today</h3>
            <p className="text-gray-600 mb-4">Take a free diagnostic mock on Crack CUET to find your current level. Then follow this 90-day plan to reach 99+.</p>
            <Link to="/auth" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Take Your Free Mock Now
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
