import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiHome,
  FiImage,
  FiBriefcase,
  FiInbox,
  FiSend,
  FiMessageCircle,
  FiBell,
  FiSettings,
  FiCompass,
  FiBookmark,
  FiUsers,
  FiFlag,
  FiLogOut,
  FiInstagram,
  FiTwitter,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api';
import { Avatar } from './ui';
import logo from '../assets/logo.jpeg';

// ==================== Public Navbar ====================

export function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath = user?.role === 'BRAND' ? '/brand' : user?.role === 'INFLUENCER' ? '/influencer' : '/admin';

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Categories', href: '#categories' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-sm backdrop-blur-xl' : 'bg-transparent'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Connectify" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-semibold text-ink">Connectify</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink/60 transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to={dashboardPath} className="btn-primary !py-2.5">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !py-2.5">
                Join Connectify
              </Link>
            </>
          )}
        </div>

        <button className="p-2 text-ink md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <FiMenu size={22} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="ml-auto flex h-full w-72 flex-col gap-6 bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="ml-auto p-1" onClick={() => setOpen(false)}>
                <FiX size={22} />
              </button>
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base font-medium text-ink/70">
                  {l.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                {user ? (
                  <Link to={dashboardPath} className="btn-primary">
                    Go to dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary">
                      Log in
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Join Connectify
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ==================== Public Footer ====================

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-mist/60">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Connectify" className="h-8 w-8 rounded-full object-cover" />
              <span className="font-display text-lg font-semibold">Connectify</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink/50">
              The collaboration marketplace where brands and creators find each other, negotiate, and work — in one workspace.
            </p>
            <div className="mt-4 flex gap-3 text-ink/40">
              <FiInstagram className="hover:text-brand-pink" />
              <FiTwitter className="hover:text-brand-purple" />
            </div>
          </div>
          <FooterCol title="Product" items={['Features', 'How it works', 'Categories', 'Pricing']} />
          <FooterCol title="Company" items={['About', 'Careers', 'Blog', 'Contact']} />
          <FooterCol title="Legal" items={['Privacy', 'Terms', 'Community guidelines']} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink/5 pt-6 text-xs text-ink/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Connectify. All rights reserved.</span>
          <span>Brands × Creators</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-ink/40">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="text-sm text-ink/60 hover:text-ink">
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

// ==================== Dashboard shell ====================

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
}

const influencerNav: NavItem[] = [
  { label: 'Dashboard', to: '/influencer', icon: <FiHome />, end: true },
  { label: 'Portfolio', to: '/influencer/portfolio', icon: <FiImage /> },
  { label: 'Campaigns', to: '/influencer/campaigns', icon: <FiBriefcase /> },
  { label: 'Applications', to: '/influencer/applications', icon: <FiSend /> },
  { label: 'Requests', to: '/influencer/requests', icon: <FiInbox /> },
  { label: 'Messages', to: '/influencer/messages', icon: <FiMessageCircle /> },
  { label: 'Notifications', to: '/influencer/notifications', icon: <FiBell /> },
  { label: 'Settings', to: '/influencer/settings', icon: <FiSettings /> },
];

const brandNav: NavItem[] = [
  { label: 'Dashboard', to: '/brand', icon: <FiHome />, end: true },
  { label: 'Discover', to: '/brand/discover', icon: <FiCompass /> },
  { label: 'Campaigns', to: '/brand/campaigns', icon: <FiBriefcase /> },
  { label: 'Saved Creators', to: '/brand/saved', icon: <FiBookmark /> },
  { label: 'Messages', to: '/brand/messages', icon: <FiMessageCircle /> },
  { label: 'Notifications', to: '/brand/notifications', icon: <FiBell /> },
  { label: 'Settings', to: '/brand/settings', icon: <FiSettings /> },
];

const adminNav: NavItem[] = [
  { label: 'Overview', to: '/admin', icon: <FiHome />, end: true },
  { label: 'Users', to: '/admin/users', icon: <FiUsers /> },
  { label: 'Reports', to: '/admin/reports', icon: <FiFlag /> },
];

function useNavForRole() {
  const { user } = useAuth();
  if (user?.role === 'BRAND') return brandNav;
  if (user?.role === 'ADMIN') return adminNav;
  return influencerNav;
}

function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const nav = useNavForRole();
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();

  const displayName = profile && 'name' in profile ? profile.name : profile && 'brandName' in profile ? profile.brandName : user?.email;
  const photo = profile && 'profilePhotoUrl' in profile ? profile.profilePhotoUrl : profile && 'logoUrl' in profile ? profile.logoUrl : undefined;

  const content = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 px-2 py-1">
        <img src={logo} alt="Connectify" className="h-8 w-8 rounded-full object-cover" />
        <span className="font-display text-lg font-semibold">Connectify</span>
      </Link>

      <nav className="mt-8 flex-1 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-gradient text-white shadow-glow' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink/5 bg-mist/70 p-3">
        <Avatar src={photo as string | undefined} name={displayName || 'U'} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
          <p className="truncate text-xs text-ink/40">{user?.email}</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="p-1.5 text-ink/40 hover:text-brand-pink"
          aria-label="Log out"
          title="Log out"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-ink/5 bg-white/70 p-5 lg:block">{content}</aside>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="h-full w-72 bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    notificationApi
      .list(1)
      .then((res) => setUnread(res.data.meta?.unreadCount || 0))
      .catch(() => undefined);
  }, []);

  const notifPath = user?.role === 'BRAND' ? '/brand/notifications' : user?.role === 'INFLUENCER' ? '/influencer/notifications' : '/admin';

  return (
    <div className="flex items-center justify-between border-b border-ink/5 bg-white/60 px-5 py-3.5 backdrop-blur-xl lg:justify-end">
      <button className="p-2 text-ink lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <FiMenu size={20} />
      </button>
      <Link to={notifPath} className="relative rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink">
        <FiBell size={19} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Link>
    </div>
  );
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-mist/40">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
