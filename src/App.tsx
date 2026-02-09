import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PageTransition } from './components/PageTransition';
import { Home } from './pages/Home';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
              <div className="app-wrap">
                <nav className="main-nav">
                  <Link to="/" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    YS
                  </Link>
                  <div className="nav-links">
                    <a href="#skills">Skills</a>
                    <a href="#projects">Projects</a>
                    <a href="#experience">Experience</a>
                    <a href="#contact">Contact</a>
                    {/* <Link to="/admin" className="nav-admin">Admin</Link> */}
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
