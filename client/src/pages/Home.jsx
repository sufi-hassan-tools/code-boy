import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-softLight text-deep font-mont">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20 px-6 md:px-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold">
            Start Your Online Store Today with Moohaar
          </h1>
          <p className="font-nastaliq tracking-wide text-gold text-lg md:text-xl mt-2 pb-2">ویبسائٹ آج اور ابھی</p>
          <button className="bg-accent text-primary font-bold px-6 py-3 mt-6 rounded-full hover:bg-gold hover:scale-105 transition-all duration-300">
            Get Started Free
          </button>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-10 md:py-12 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 mb-2 text-primary mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
            <h3 className="font-semibold">Mobile First</h3>
            <p className="text-sm text-gray-600">
              Optimized for a seamless shopping experience on any device.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 mb-2 text-info mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <h3 className="font-semibold">Secure</h3>
            <p className="text-sm text-gray-600">
              Built with best practices to keep your store and data safe.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 mb-2 text-primary mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <h3 className="font-semibold">Fast</h3>
            <p className="text-sm text-gray-600">
              Your store loads quickly so customers stay engaged.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="flex flex-col items-center bg-softLight py-10 md:py-12">
          <h2 className="text-2xl font-semibold">How Moohaar Works</h2>
          <div className="flex flex-col items-center max-w-sm mx-auto mt-6">
            <h3 className="font-semibold">1. Create your free account</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Sign up in seconds and get immediate access to your dashboard.
            </p>
          </div>
          <div className="flex flex-col items-center max-w-sm mx-auto mt-6">
            <h3 className="font-semibold">2. Launch your store in minutes</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Choose a template and start adding products right away.
            </p>
          </div>
          <div className="flex flex-col items-center max-w-sm mx-auto mt-6">
            <h3 className="font-semibold">3. Start selling online</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Share your store link and watch the orders roll in.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white py-10 md:py-12 px-6">
          <h2 className="text-center text-2xl font-semibold">What Our Early Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="shadow-md border rounded-lg p-4 text-sm">
              <p className="italic text-gray-600">"Moohaar made it so easy to get online and start selling!"</p>
              <p className="mt-2 font-semibold">- Ahmed A.</p>
            </div>
            <div className="shadow-md border rounded-lg p-4 text-sm">
              <p className="italic text-gray-600">"I launched my store in a day and got my first order in hours."</p>
              <p className="mt-2 font-semibold">- Sara B.</p>
            </div>
            <div className="shadow-md border rounded-lg p-4 text-sm">
              <p className="italic text-gray-600">"The interface is simple and the support team is amazing."</p>
              <p className="mt-2 font-semibold">- Kamran C.</p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-primary text-white text-center py-10 md:py-12">
          <h2 className="text-2xl font-semibold">
            Join the Moohaar revolution today – Build your store in minutes
          </h2>
          <button className="bg-accent text-primary font-bold px-6 py-3 mt-4 rounded-full hover:bg-gold hover:scale-105 transition-all duration-300">
            Get Started Now
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
