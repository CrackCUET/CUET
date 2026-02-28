import React from 'react';
import { Link } from 'react-router-dom';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo-full.png" alt="Crack CUET" className="h-8" />
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">Back to Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
            <p className="text-amber-800 font-medium">
              All purchases on Crack CUET are final. We do not offer refunds on any subscription plan once payment has been processed.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">1. No Refund Policy</h2>
          <p>
            Once a subscription (Pro or Premium) has been purchased, the payment is non-refundable. This applies to all plans regardless of how many mock tests have been attempted during the subscription period.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">2. Try Before You Buy</h2>
          <p>
            We strongly encourage all students to take advantage of our <strong>free demo</strong> before purchasing any paid plan. Every user gets <strong>1 free mock test per subject</strong> — completely free, no credit card required. This allows you to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Experience the full mock test interface and question quality.</li>
            <li>Review detailed solutions and explanations after submission.</li>
            <li>Check your performance analytics and leaderboard ranking.</li>
            <li>Evaluate whether the platform meets your preparation needs.</li>
          </ul>
          <p>
            We provide this free tier specifically so that you can make an informed decision before subscribing. Please use the free mocks to evaluate our platform thoroughly.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Subscription Details</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Pro Plan (₹999/month):</strong> 8 mocks per subject per month across all 15 subjects.</li>
            <li><strong>Premium Plan (₹1,499/month):</strong> 10 mocks per subject per month with advanced analytics.</li>
          </ul>
          <p>
            Subscriptions are billed monthly. You may cancel your subscription at any time to prevent future charges, but no refund will be issued for the current billing period.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Exceptions</h2>
          <p>
            In rare cases of technical issues that prevent access to the platform for an extended period (e.g., server outages lasting more than 48 continuous hours), we may, at our sole discretion, extend your subscription period or offer credit towards future subscriptions. This is not guaranteed and will be evaluated on a case-by-case basis.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about this policy or believe there are exceptional circumstances, please reach out to us at <strong>info@CrackCUET.com</strong>. We are happy to help.
          </p>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-6 mt-12">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 Crack CUET. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
