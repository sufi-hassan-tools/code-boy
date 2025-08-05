import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleGetStartedClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleCreateStoreClick = () => {
    if (isLoggedIn) {
      navigate('/create-store');
    } else {
      navigate('/signup');
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-mont overflow-x-hidden">

      <Header/>

      {/* ---------- HERO ---------- */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white py-36 px-6 text-center isolate">
        {/* subtle animated orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-16 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"/>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"/>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-accent text-sm font-medium">
            Now Live in Beta
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-[80px] font-black leading-none tracking-tighter mt-6">
            Start Your
            <span className="block bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
              Online Store
            </span>
            Today with Moohaar
          </h1>

          <p className="font-nastaliq text-3xl mt-4 text-accent/90">
            ویبسائٹ آج اور ابھی
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={handleGetStartedClick}
              className="group bg-accent text-primary font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started Free
              <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-white/70 text-sm tracking-wide">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              No credit card
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Setup in 5 minutes
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900">Why Choose Moohaar?</h2>
          <p className="text-slate-600 text-center mt-3 max-w-xl mx-auto">Built for modern entrepreneurs who want to launch fast and scale smart.</p>

          <div className="mt-20 grid md:grid-cols-3 gap-10">
            {[
              { icon:'📱', title:'Mobile First', text:'Layouts that feel native everywhere.' },
              { icon:'🔐', title:'Bank-Level Security', text:'SOC 2 & ISO 27001 compliant.' },
              { icon:'⚡', title:'Lightning Fast', text:'Edge-rendered, sub-second loads.' },
            ].map((f,i)=>(
              <div key={i} className="group p-8 rounded-3xl border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 mt-3">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900">How Moohaar Works</h2>
          <p className="text-slate-600 text-center mt-3">Three simple steps to online success.</p>

          <div className="mt-16 grid md:grid-cols-3 gap-10 relative">
            <div className="absolute top-1/2 left-1/3 right-1/3 h-px bg-slate-300 hidden md:block"/>
            {[
              { step:'01', title:'Create Account', desc:'Signup and open your dashboard instantly.' },
              { step:'02', title:'Launch in Minutes', desc:'Pick a template, add products, go live.' },
              { step:'03', title:'Start Selling', desc:'Share your link and watch revenue grow.' },
            ].map((s,i)=>(
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                  {s.step}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-slate-600 mt-2 max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900">Loved by Entrepreneurs</h2>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { name:'Ahmed Khan', role:'Fashion Store', quote:'Moohaar made it incredibly easy to get online and start selling.' },
              { name:'Sarah Ali', role:'Handmade Crafts', quote:'I launched in a day and got my first order within hours.' },
              { name:'Muhammad Hassan', role:'Electronics Store', quote:'Revenue up 300 % since migrating to Moohaar.' },
            ].map((t,i)=>(
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <p className="text-slate-700 italic">“{t.quote}”</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600"/>
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white py-36 px-6 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white/20 rounded-full blur-3xl"/>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"/>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block bg-accent/20 backdrop-blur-sm rounded-full px-5 py-2 text-accent text-sm font-medium">
            Limited-Time Beta Access
          </span>
          <h2 className="text-5xl md:text-6xl font-black mt-6">Join the Moohaar Revolution</h2>
          <p className="text-lg md:text-xl text-white/80 mt-4 max-w-xl mx-auto">
            Build your store in minutes, not days. Thousands are already scaling with Moohaar.
          </p>
          <button 
            onClick={handleCreateStoreClick}
            className="mt-10 px-10 py-5 bg-accent text-primary font-bold rounded-2xl shadow-lg hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1 text-lg"
          >
            Claim your free store →
          </button>
          <p className="text-white/70 text-sm mt-4">Free forever plan • No hidden fees</p>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
