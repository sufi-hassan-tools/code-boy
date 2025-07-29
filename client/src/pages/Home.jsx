import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-deep font-mont">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20 px-6 md:px-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold">
            Start Your Online Store Today with Moohaar
          </h1>
          <p className="font-nastaliq text-xl mt-2 text-accent">ویبسائٹ آج اور ابھی</p>
          <button className="bg-accent text-primary font-bold px-6 py-3 mt-6 rounded-full hover:bg-highlight">
            Get Started Free
          </button>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-12 text-center">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-semibold">Mobile First</h3>
            <p className="text-sm text-gray-600">
              Optimized for a seamless shopping experience on any device.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-semibold">Secure</h3>
            <p className="text-sm text-gray-600">
              Built with best practices to keep your store and data safe.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-semibold">Free Until First 10 Sales</h3>
            <p className="text-sm text-gray-600">
              Launch your store for free and pay only after your first ten sales.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="flex flex-col items-center bg-softLight py-12">
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
        <section className="bg-white py-12 px-6">
          <h2 className="text-center text-2xl font-semibold">What Our Early Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="shadow-md rounded-lg p-4 text-sm">
              "Moohaar made it so easy to get online and start selling!"
            </div>
            <div className="shadow-md rounded-lg p-4 text-sm">
              "I launched my store in a day and got my first order in hours."
            </div>
            <div className="shadow-md rounded-lg p-4 text-sm">
              "The interface is simple and the support team is amazing."
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-primary text-white text-center py-10">
          <h2 className="text-2xl font-semibold">
            Join the Moohaar revolution today – Build your store in minutes
          </h2>
          <button className="bg-accent text-primary font-bold px-6 py-3 mt-4 rounded-full hover:bg-highlight">
            Get Started Now
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
