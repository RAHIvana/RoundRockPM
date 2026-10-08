import type { PageId, NavItem } from '../types';

const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'properties', label: 'Properties' },
  { id: 'contact', label: 'Contact' },
];

interface NavbarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Navbar({ current, onNavigate }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => onNavigate('home')}>
        🏠 <span>Round Rock Property Management</span>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-btn${current === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
