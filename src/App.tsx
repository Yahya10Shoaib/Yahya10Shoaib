import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PageTransition } from './components/PageTransition';
import { Home } from './pages/Home';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import './styles/global.css';

type Theme = 'light' | 'dark';

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function NavLinks({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <a href="#skills" onClick={onClose}>Skills</a>
      <a href="#projects" onClick={onClose}>Projects</a>
      <a href="#experience" onClick={onClose}>Experience</a>
      <a href="/Resume_Yahya_Shoaib.pdf" download onClick={onClose}>Resume</a>
      <a href="#contact" onClick={onClose}>Contact</a>
    </>
  );
}

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('theme') as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
              <div className="app-wrap">
                <nav className={`main-nav${navOpen ? ' main-nav-open' : ''}`}>
                  <Link
                    to="/"
                    className="nav-logo"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      closeNav();
                    }}
                  >
                    YS.
                  </Link>

                  {navOpen && (
                    <button
                      type="button"
                      className="nav-overlay"
                      onClick={closeNav}
                      aria-label="Close menu"
                    />
                  )}

                  <div className="nav-links">
                    <NavLinks onClose={closeNav} />
                  </div>

                  <div className="nav-actions">
                    <button
                      type="button"
                      className="nav-theme-btn"
                      onClick={toggleTheme}
                      aria-label={
                        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
                      }
                      aria-pressed={theme === 'dark'}
                    >
                      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>

                    <button
                      type="button"
                      className="nav-hamburger"
                      onClick={() => setNavOpen((o) => !o)}
                      aria-expanded={navOpen}
                      aria-label={navOpen ? 'Close menu' : 'Open menu'}
                    >
                      <span className="nav-hamburger-bar" />
                      <span className="nav-hamburger-bar" />
                      <span className="nav-hamburger-bar" />
                    </button>
                  </div>
                </nav>

                <Home />
              </div>
            </PageTransition>
          }
        />
        <Route path="/admin" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
