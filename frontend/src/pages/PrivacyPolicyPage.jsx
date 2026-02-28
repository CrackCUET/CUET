import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2025</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            At Crack CUET ("we", "us", or "our"), we are committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform at CrackCUET.com.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
            <li><strong>Profile Data:</strong> Subject preferences, target degree, dream colleges, and other onboarding details you choose to provide.</li>
            <li><strong>Usage Data:</strong> Mock test attempts, scores, time spent, answers submitted, and performance analytics.</li>
            <li><strong>Contact Information:</strong> Name, email, phone number, and message content when you use our contact form.</li>
            <li><strong>Payment Information:</strong> Transaction details processed through our third-party payment gateway (Razorpay). We do not store your card or bank details directly.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our mock test platform and services.</li>
            <li>To personalise your dashboard, leaderboard experience, and performance analytics.</li>
            <li>To process your subscription payments and manage your plan.</li>
            <li>To communicate with you regarding your account, updates, and support requests.</li>
            <li>To improve our question quality, platform features, and user experience.</li>
            <li>To display your name and score on subject leaderboards (visible to other users).</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">3. Data Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We may share your data only in the following cases:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With payment processors (Razorpay) to facilitate transactions.</li>
            <li>With AI service providers (Google Gemini) solely for generating mock test questions — no personal data is sent to these services.</li>
            <li>If required by law or to protect our legal rights.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">4. Data Security</h2>
          <p>
            We implement industry-standard security measures including encrypted passwords, secure HTTPS connections, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">5. Data Retention</h2>
          <p>
            We retain your account data and test performance history for as long as your account is active. If you wish to delete your account and associated data, please contact us at info@CrackCUET.com.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">6. Cookies</h2>
          <p>
            We use essential cookies and local storage to maintain your login session and preferences. We do not use third-party tracking cookies for advertising purposes.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and download your personal data.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your account and data.</li>
            <li>Withdraw consent for optional data processing.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <strong>info@CrackCUET.com</strong>.
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
