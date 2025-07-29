import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-white text-deep font-mont">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20 px-6 text-center md:px-16">
          <h1 className="text-3xl md:text-5xl font-extrabold">
            Start Your Online Store Today with Moohaar
          </h1>
          <p className="font-nastaliq text-xl mt-2 text-accent">ویبسائٹ آج اور ابھی</p>
          <button className="bg-accent text-primary font-semibold px-6 py-3 mt-6 rounded-full hover:bg-highlight">
            Get Started
          </button>
        </section>

        {/* Features Section */}
        <section className="flex flex-col md:flex-row justify-center items-center gap-6 p-6 md:p-12">
          <div className="text-center max-w-xs">
            <div className="text-4xl mb-2">🔧</div>
            <h3 className="font-bold">Free Until Sales</h3>
            <p className="text-sm text-gray-700">
              Start selling without upfront costs and pay only when you make a sale.
            </p>
          </div>
          <div className="text-center max-w-xs">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-bold">Launch Fast</h3>
            <p className="text-sm text-gray-700">
              Our simple setup gets your store online in minutes.
            </p>
          </div>
          <div className="text-center max-w-xs">
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-bold">Mobile First</h3>
            <p className="text-sm text-gray-700">
              Designed to look stunning on any device, big or small.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
