import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FileStack, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="relative border-b border-paper-line">
      <div className="mx-auto flex h-[73px] max-w-5xl items-center justify-between px-6">
        <NavLink to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <FileStack className="h-5 w-5 text-pen" strokeWidth={2.25} />
          <span className="font-display text-lg font-medium tracking-tight">Elevatr</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            History
          </NavLink>
          <NavLink to="/chat" className={linkClass}>
            Career Chat
          </NavLink>

          {user ? (
            <div className="flex items-center gap-4 border-l border-paper-line pl-6">
              <span className="max-w-[10rem] truncate text-sm text-ink-soft">
                {user.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                title="Log out"
                className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-pen"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-paper-line pl-6">
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="flex items-center justify-center rounded-md p-2 text-ink-soft sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="absolute inset-x-0 top-[73px] z-20 flex flex-col gap-1 border-b border-paper-line bg-paper px-6 py-4 sm:hidden">
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>
            <span className="block py-2">Home</span>
          </NavLink>
          <NavLink to="/history" className={linkClass} onClick={closeMenu}>
            <span className="block py-2">History</span>
          </NavLink>
          <NavLink to="/chat" className={linkClass} onClick={closeMenu}>
            <span className="block py-2">Career Chat</span>
          </NavLink>

          <div className="mt-2 border-t border-paper-line pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="truncate text-sm text-ink-soft">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-pen"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper"
                >
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
