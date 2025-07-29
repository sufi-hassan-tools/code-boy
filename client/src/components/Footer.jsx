import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white font-mont">
      <div className="py-6 px-4 md:px-12 flex flex-col md:flex-row md:justify-between items-center md:items-start text-center md:text-left space-y-6 md:space-y-0 md:space-x-8">
        {/* Logo & Tagline */}
        <div>
          <h2 className="text-lg font-bold uppercase">Moohaar</h2>
          <p className="text-sm text-accent font-nastaliq">ویبسائٹ آج اور ابھی</p>
          <div className="flex justify-center md:justify-start space-x-4 mt-2">
            <a href="#" aria-label="Facebook" className="hover:text-accent">📘</a>
            <a href="#" aria-label="Twitter" className="hover:text-accent">🐦</a>
            <a href="#" aria-label="Instagram" className="hover:text-accent">📸</a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            <li><Link to="/" className="hover:text-accent">Home</Link></li>
            <li><Link to="/templates" className="hover:text-accent">Templates</Link></li>
            <li><Link to="/pricing" className="hover:text-accent">Pricing</Link></li>
            <li><Link to="/support" className="hover:text-accent">Support</Link></li>
            <li><Link to="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-accent">Terms</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p>
            <a href="mailto:support@moohaar.pk" className="hover:text-accent">
              support@moohaar.pk
            </a>
          </p>
          <p>
            <a href="https://wa.me/923001234567" className="hover:text-accent">
              +92 300 1234567
            </a>
          </p>
        </div>
      </div>
      <div className="text-center py-4 text-xs text-accent">
        © Moohaar 2025. All rights reserved.
      </div>
    </footer>
  );
}
