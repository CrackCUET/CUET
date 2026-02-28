import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to Crack CUET. By accessing or using our platform at CrackCUET.com ("the Platform"), you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using any part of the Platform, you confirm that you have read, understood, and agree to these Terms and Conditions, our Privacy Policy, and our Refund Policy.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">2. Description of Service</h2>
          <p>
            Crack CUET is an online mock test platform designed to help students prepare for the Common University Entrance Test (CUET). We provide AI-generated practice tests, performance analytics, and leaderboard-based rankings across multiple subjects.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You must not share your account with others or create multiple accounts.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Subscription Plans & Payments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free users receive 1 mock test per subject as a demo to evaluate the platform.</li>
            <li>Paid plans (Pro and Premium) are billed monthly and provide increased mock test limits and features.</li>
            <li>All payments are processed securely through Razorpay. We do not store your payment card details.</li>
            <li>All purchases are final and non-refundable. Please refer to our <Link to="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</Link> for details.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Platform for any unlawful purpose.</li>
            <li>Attempt to gain unauthorised access to our systems or other user accounts.</li>
            <li>Copy, reproduce, distribute, or sell any content from the Platform, including questions, solutions, and analytics data.</li>
            <li>Use automated tools, bots, or scripts to access the Platform or extract content.</li>
            <li>Manipulate leaderboard rankings through fraudulent means.</li>
            <li>Impersonate any person or entity while using the Platform.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Intellectual Property</h2>
          <p>
            All content on the Platform — including mock test questions, solutions, explanations, analytics, design, and branding — is the intellectual property of Crack CUET. You may not reproduce, distribute, or commercially exploit any content without our written permission.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">7. AI-Generated Content</h2>
          <p>
            Our mock test questions are generated using artificial intelligence. While we strive for accuracy and quality, AI-generated content may occasionally contain errors. We do not guarantee that all questions are error-free. If you find any inaccuracies, please report them to us at info@CrackCUET.com.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">8. Leaderboard & Rankings</h2>
          <p>
            Leaderboard rankings are calculated based on your mock test scores and may include synthetic entries for competitive benchmarking. Rankings are for motivational purposes and do not constitute any guarantee of actual CUET exam performance.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">9. Limitation of Liability</h2>
          <p>
            Crack CUET is a practice platform and does not guarantee any specific score, rank, or admission outcome in the actual CUET exam. We provide mock tests as a preparation aid only. We are not liable for any direct, indirect, or consequential damages arising from the use of our Platform.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">10. Modifications</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated date. Continued use of the Platform after changes constitutes acceptance of the revised terms.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">11. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">12. Contact Us</h2>
          <p>
            For any questions or concerns regarding these Terms, please contact us at <strong>info@CrackCUET.com</strong>.
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
