import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeftOnRectangleIcon,
  TableCellsIcon,
  UserIcon, // icône pour Admin
} from '@heroicons/react/24/outline';
import logoRam from '../assets/logo_ram.png';

const SIDEBAR_CLOSED = 56;
const SIDEBAR_OPEN = 220;

const COLORS = {
  ramRed: '#C4002A',
  ramRedHover: '#B81F32',
  ivory: '#F5F6FA',
  gray: '#ECECEC',
  text: '#22262A',
  badgeBg: '#FAF8F6'
};

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const badge = auth.currentUser?.email?.split('@')[0];
  const open = true;

  useEffect(() => {
    const checkAdmin = () => {
      const userEmail = auth.currentUser?.email || '';
      setIsAdmin(userEmail.toLowerCase() === 'admin123@ram.com');
    };
    checkAdmin();
  }, []);

  const menu = [
    {
      label: 'Vols',
      path: '/',
      icon: TableCellsIcon,
    },
  ];

  if (isAdmin) {
    menu.push({
      label: 'Admin',
      path: '/admin',
      icon: UserIcon,
    });
  }

  useEffect(() => {
    document.body.style.transition = "padding-left 0.22s cubic-bezier(.4,0,.2,1)";
  }, []);

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 select-none shadow-none flex flex-col justify-between"
      style={{
        width: SIDEBAR_OPEN,
        background: COLORS.ivory,
        borderRight: `1.5px solid ${COLORS.gray}`,
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
        fontFamily: 'Montserrat, Arial, sans-serif',
        boxShadow: "none",
        overflowX: 'hidden',
      }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      {/* Top: Logo + Staff + Badge */}
      <div className="flex flex-col items-center w-full pt-5">
        {/* Logo carré, cliquable, plus grand en open */}
        <div className="flex items-center justify-center mb-1 w-full">
          <div
            className={`
              flex items-center justify-center cursor-pointer
              ${open ? 'w-14 h-14' : 'w-9 h-9'}
              bg-white border border-[#ececec]
              transition-all duration-200
              rounded-none
              shadow-none
              select-none
            `}
            style={{ marginBottom: open ? 10 : 4 }}
            onClick={() => navigate('/')}
            tabIndex={0}
            title="Accueil"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') navigate('/');
            }}
            role="button"
            aria-label="Accueil"
          >
            <img
              src={logoRam}
              alt="Logo RAM"
              className={`${open ? 'w-10 h-10' : 'w-5 h-5'} object-contain`}
              draggable={false}
            />
          </div>
        </div>

        {/* Staff RAM (uniquement quand open) */}
        <div
          style={{
            height: open ? 18 : 0,
            width: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "height 0.19s cubic-bezier(.4,0,.2,1)"
          }}
        >
          {open && (
            <span
              className={`uppercase text-[11px] font-bold tracking-widest`}
              style={{
                color: COLORS.ramRed,
                letterSpacing: '1.8px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                textAlign: 'center',
                width: '100%',
                whiteSpace: 'nowrap',
                opacity: 1,
              }}
            >
              STAFF RAM
            </span>
          )}
        </div>

        {/* Badge (toujours visible, jamais déplacé) */}
        <span
          className="text-[12px] px-1 py-[2.5px] mt-1 mb-1 w-full"
          style={{
            background: COLORS.badgeBg,
            color: COLORS.ramRed,
            border: `1.2px solid #ebc4c7`,
            borderRadius: 2,
            fontWeight: 600,
            textAlign: 'center',
            fontFamily: 'Montserrat, Arial, sans-serif',
            maxWidth: open ? 140 : 48,
            fontSize: open ? 12 : 10,
            letterSpacing: open ? "0.6px" : "0.3px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            margin: '0 auto',
            opacity: badge ? 1 : 0,
            transition: 'max-width 0.2s, font-size 0.2s, opacity 0.18s'
          }}
          title={badge}
        >
          {badge}
        </span>

        {/* Séparateur fin */}
        <div className="w-full border-b border-[#ececec] my-2" style={{ height: 0 }} />

        {/* MENU - position y fixe */}
        <nav
          className="w-full flex flex-col items-center"
          style={{
            marginTop: 14,
            marginBottom: 0,
            minHeight: 60,
            justifyContent: 'flex-start'
          }}
        >
          {menu.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  flex items-center
                  ${open ? 'w-[170px] px-3 justify-start' : 'w-9 justify-center'}
                  h-11
                  border-l-4
                  ${active
                    ? 'border-[#C4002A] bg-white text-[#C4002A]'
                    : 'border-transparent bg-transparent text-[#1A1A1A]'
                  }
                  hover:bg-[#F8E6EA] hover:text-[#B81F32]
                  font-semibold transition-all duration-150
                  group
                  rounded-none
                `}
                style={{
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '15px',
                  minHeight: 44
                }}
              >
                <Icon className={`h-6 w-6 mr-0 ${open ? 'mr-3' : ''} ${active ? 'text-[#C4002A]' : 'text-[#B81F32]'}`} />
                {open && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Déconnexion toujours bien placée */}
      <div
        className="flex flex-col items-center w-full"
        style={{
          marginBottom: 16,
          marginTop: 0,
          justifyContent: "flex-end",
        }}
      >
        <div className="w-full border-t border-[#ececec] mb-2" />
        <button
          onClick={async () => {
            await signOut(auth);
            navigate('/login');
          }}
          className={`
            flex items-center
            ${open ? 'w-[170px] px-3 justify-start' : 'w-9 justify-center'}
            h-10
            text-[#C4002A] font-bold
            bg-white hover:bg-[#F8E6EA]
            border-l-4 border-transparent
            transition-all duration-150
            rounded-none
          `}
          style={{
            fontFamily: 'Montserrat, Arial, sans-serif',
            minHeight: 40
          }}
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-0" />
          {open && (
            <span className="ml-3">Déconnexion</span>
          )}
        </button>
      </div>
    </aside>
  );
}
