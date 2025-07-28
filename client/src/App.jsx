import { useEffect, useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';

const THEME_KEY = 'theme';

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem(THEME_KEY) || 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Code Boy</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
        >
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
