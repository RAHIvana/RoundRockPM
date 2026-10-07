import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Properties from './pages/Portfolio';
import Contact from './pages/Contact';
import type { PageId } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':       return <Home onNavigate={setCurrentPage} />;
      case 'about':      return <About />;
      case 'services':   return <Services />;
      case 'properties': return <Properties />;
      case 'contact':    return <Contact />;
    }
  };

  return (
    <div className="app">
      <Navbar current={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">{renderPage()}</main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Round Rock Property Management · Full-Service Property Management · Austin, TX</p>
      </footer>
    </div>
  );
}
