import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/stores', label: 'Stores' },
    { to: '/products', label: 'Products' },
    { to: '/contact', label: 'Contact' },
    { to: '/auth', label: 'Login/Register' },
  ];

  return (
    <header className="bg-[#1C2B64] text-white dark:bg-[#0E0D0D]">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="font-bold text-lg">
          <span>Moohaar</span>
          <span className="font-nastaliq hidden sm:block text-sm">
            ویبسائٹ آج اور ابھی
          </span>
        </Link>
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <nav
          className={`${open ? 'block' : 'hidden'} absolute top-full left-0 w-full bg-[#1C2B64] md:static md:block md:w-auto`}
        >
          <ul className="md:flex md:space-x-6">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:text-[#FBECB2] ${isActive ? 'text-[#FBECB2]' : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
