import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-white text-slate-800 font-mont overflow-hidden">
      <Header />

      <main className="flex-grow">
        {/* Hero Section - Enhanced with glassmorphism and dynamic elements */}
        <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white py-24 px-6 md:px-16 text-center overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-5"></div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
              <span className="text-accent text-sm font-medium">✨ Now Live in Beta</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
              Start Your
              <span className="block bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
                Online Store
              </span>
              Today with Moohaar
            </h1>
            
            <p className="font-nastaliq text-2xl md:text-3xl mt-4 text-accent/90 mb-8 drop-shadow-sm">
              ویبسائٹ آج اور ابھی
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group bg-accent hover:bg-highlight text-primary font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg flex items-center gap-2">
                Get Started Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl border border-white/20 transition-all duration-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Demo
              </button>
            </div>
            
            <div className="flex justify-center items-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Setup in 5 minutes
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Modern card design with hover effects */}
        <section className="py-20 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Why Choose Moohaar?
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Built for modern entrepreneurs who want to launch fast and scale smart
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Mobile First</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Optimized for a seamless shopping experience on any device. Your customers will love the smooth, responsive interface.
                  </p>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Bank-Level Security</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Built with enterprise-grade security practices to keep your store and customer data completely safe and protected.
                  </p>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Lightning Fast</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Your store loads in milliseconds with our optimized infrastructure. Keep customers engaged with blazing-fast performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Step-by-step with modern design */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                How Moohaar Works
              </h2>
              <p className="text-xl text-slate-600">
                Three simple steps to your online success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection lines for desktop */}
              <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary to-accent transform -translate-y-1/2 z-0"></div>
              
              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-blue-600 text-white rounded-3xl font-bold text-2xl mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Create Your Account</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Sign up in seconds and get immediate access to your personalized dashboard with all the tools you need.
                </p>
              </div>

              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-yellow-400 text-primary rounded-3xl font-bold text-2xl mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Launch in Minutes</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Choose from premium templates and start adding products with our intuitive drag-and-drop interface.
                </p>
              </div>

              <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl font-bold text-2xl mb-6 shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Start Selling</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Share your store link across all channels and watch your business grow with real-time analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Modern card layout with avatars */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Loved by Entrepreneurs
              </h2>
              <p className="text-xl text-slate-600">
                Join thousands of successful online store owners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Ahmed Khan</div>
                    <div className="text-sm text-slate-500">Fashion Store Owner</div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "Moohaar made it incredibly easy to get online and start selling. The interface is intuitive and the results speak for themselves!"
                </p>
                <div className="flex text-accent mt-4">
                  {'★'.repeat(5)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-yellow-400 rounded-full flex items-center justify-center text-primary font-bold mr-4">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Sarah Ali</div>
                    <div className="text-sm text-slate-500">Handmade Crafts</div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "I launched my store in a day and got my first order within hours. The mobile experience is absolutely fantastic!"
                </p>
                <div className="flex text-accent mt-4">
                  {'★'.repeat(5)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Muhammad Hassan</div>
                    <div className="text-sm text-slate-500">Electronics Store</div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "The interface is beautifully simple and the support team is amazing. My revenue has grown 300% since switching to Moohaar!"
                </p>
                <div className="flex text-accent mt-4">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Premium design with urgency */}
        <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
            <div className="inline-flex items-center bg-accent/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-accent/30">
              <span className="text-accent text-sm font-medium">🚀 Limited Time: Beta Access</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Join the Moohaar Revolution
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Build your store in minutes, not days. Join thousands of entrepreneurs already growing with Moohaar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-accent hover:bg-highlight text-primary font-bold px-10 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg flex items-center gap-3">
                Start Building Now
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="text-white/80 text-sm">
                <span className="block">✨ Free forever plan available</span>
                <span className="text-accent">No hidden fees, cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}