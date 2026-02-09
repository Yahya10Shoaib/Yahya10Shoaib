import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PageTransition } from './components/PageTransition';
import { Home } from './pages/Home';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import './styles/global.css';

function NavContent({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <a href="#skills" onClick={onClose}>Skills</a>
      <a href="#projects" onClick={onClose}>Projects</a>
      <a href="#experience" onClick={onClose}>Experience</a>
      <a href="/resume.pdf" download onClick={onClose}>Resume</a>
      <a href="#contact" onClick={onClose}>Contact</a>
    </>
  );
}

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
              <div className="app-wrap">
                <nav className={`main-nav ${navOpen ? 'main-nav-open' : ''}`}>
                  <Link to="/" className="nav-logo" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); closeNav(); }}>
                    YS
                  </Link>
                  {navOpen && (
                    <button
                      type="button"
                      className="nav-overlay"
                      onClick={closeNav}
                      aria-label="Close menu"
                    />
                  )}
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
                  <div className="nav-links">
                    <NavContent onClose={closeNav} />
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
