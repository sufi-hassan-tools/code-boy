import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <div className="bg-[#1C2B64] text-white text-center py-16 px-4">
        <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4">
          Start Your Online Store Today with Moohaar
        </h1>
        <p className="text-lg sm:text-xl mb-6 urdu">ویبسائٹ آج اور ابھی</p>
        <Link
          to="/auth"
          className="inline-block px-6 py-3 bg-[#FBECB2] text-[#1C2B64] font-semibold rounded-full transition hover:bg-[#f5e08d]"
        >
          Get Started Free
        </Link>
      </div>

      {/* FEATURES SECTION */}
      <div className="bg-[#E2E9ED] py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-4xl mb-2">📱</span>
            <h3 className="text-xl font-bold mb-1">Mobile First</h3>
            <p className="text-gray-700">
              Optimized for a seamless shopping experience on any device.
            </p>
          </div>
          <div className="mb-10">
            <span className="text-4xl mb-2">🔒</span>
            <h3 className="text-xl font-bold mb-1">Secure</h3>
            <p className="text-gray-700">
              Built with best practices to keep your store and data safe.
            </p>
          </div>
          <div>
            <span className="text-4xl mb-2">⚡</span>
            <h3 className="text-xl font-bold mb-1">Fast</h3>
            <p className="text-gray-700">
              Your store loads quickly so customers stay engaged.
            </p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">How Moohaar Works</h2>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h4 className="text-lg font-semibold">1. Create your free account</h4>
            <p className="text-gray-700">Sign up in seconds and get immediate access to your dashboard.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold">2. Launch your store in minutes</h4>
            <p className="text-gray-700">Choose a template and start adding products right away.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold">3. Start selling online</h4>
            <p className="text-gray-700">Share your store link and watch the orders roll in.</p>
          </div>
        </div>
      </div>

      {/* USER TESTIMONIALS */}
      <div className="bg-[#E2E9ED] py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">What Our Early Users Say</h2>
        <div className="max-w-xl mx-auto space-y-4">
          <blockquote className="italic">"Moohaar made it so easy to start and sell!"</blockquote>
          <blockquote className="italic">"The interface is simple and the support team is amazing!"</blockquote>
          <blockquote className="italic">"I launched my store in a day and got my first order in hours."</blockquote>
        </div>
      </div>

      {/* FINAL CTA SECTION */}
      <div className="bg-[#1C2B64] text-white text-center py-16 px-4">
        <h2 className="text-2xl font-bold mb-4">Join the Moohaar revolution today – Build your store in minutes</h2>
        <Link
          to="/auth"
          className="inline-block mt-4 px-6 py-3 bg-[#FBECB2] text-[#1C2B64] font-semibold rounded-full transition hover:bg-[#f5e08d]"
        >
          Get Started Now
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#1C2B64] text-white text-center py-8 px-4">
        <div className="mb-4">
          <h3 className="text-lg font-bold">Moohaar</h3>
          <p className="urdu">ویبسائٹ آج اور ابھی</p>
        </div>
        <div className="flex justify-center space-x-4 text-sm">
          <Link to="/home" className="hover:underline">Home</Link>
          <Link to="/pricing" className="hover:underline">Pricing</Link>
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link to="/templates" className="hover:underline">Templates</Link>
          <Link to="/support" className="hover:underline">Support</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
        <div className="mt-4 text-sm">
          <p>Contact: support@moohaar.pk | +92 300 1234567</p>
          <p>© Moohaar 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}