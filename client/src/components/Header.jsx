import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/templates', label: 'Templates' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/support', label: 'Support' },
  ];

  return (
    <header className="bg-white text-primary shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link to="/" className="leading-tight font-mont">
          <span className="block font-bold text-xl text-primary">Moohaar</span>
          <span className="block font-nastaliq tracking-wide text-gold text-lg md:text-xl pb-1">
            ویبسائٹ آج اور ابھی
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-6 font-mont" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className="hover:text-accent">
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center space-x-4 font-mont">
          <Link to="/login" className="hover:text-accent">Login</Link>
          <Link
            to="/create-store"
            className="px-4 py-2 rounded bg-highlight text-primary font-semibold hover:bg-gold hover:scale-105 transition-all duration-300"
          >
            Create Store
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden bg-white text-primary border-t`}> 
        <nav aria-label="Mobile navigation">
          <ul className="flex flex-col font-mont">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-accent/40"
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-accent/40">Login</Link>
            </li>
            <li>
              <Link
                to="/create-store"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 bg-highlight text-primary font-semibold hover:bg-gold hover:scale-105 transition-all duration-300"
              >
                Create Store
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
