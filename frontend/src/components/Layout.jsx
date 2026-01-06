import { useState, Fragment } from 'react';
import { Transition } from '@headlessui/react';

// You can replace these with a library like lucide-react if you have one
const MenuIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const SearchIcon = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const NavLink = ({ href, children }) => (
    <a href={href} className="block px-4 py-2 text-base text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 rounded-md">
        {children}
    </a>
);

function SidebarContent({ user, onLogout, searchTerm, onSearchChange }) {
    return (
        <nav className="flex flex-col flex-1 p-4">
            <h2 className="px-4 pt-2 pb-4 text-2xl font-semibold tracking-tight text-zinc-50">SecureNotes</h2>
            
            <div className="px-2 py-2 space-y-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        autoComplete="new-password"
                        className="w-full pl-10 pr-4 py-2 text-base bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <NavLink href="#">Dashboard</NavLink>
            </div>

            <div className="mt-auto p-4 space-y-4">
                 {user && (
                    <div className="text-center text-sm text-zinc-500">
                        Signed in as <span className="font-medium text-zinc-400">{user.name}</span>
                    </div>
                )}
                <button 
                    onClick={onLogout}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default function Layout({ children, user, onLogout, searchTerm, onSearchChange }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            {/* --- Desktop Sidebar --- */}
            <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:border-r md:border-zinc-800">
                <div className="flex flex-grow flex-col overflow-y-auto bg-zinc-900">
                    <SidebarContent user={user} onLogout={onLogout} searchTerm={searchTerm} onSearchChange={onSearchChange} />
                </div>
            </aside>

            {/* --- Mobile Drawer & Backdrop --- */}
            <Transition.Root show={isDrawerOpen} as={Fragment}>
                <div>
                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div 
                            className="fixed inset-0 bg-zinc-950/80 z-30" 
                            onClick={() => setIsDrawerOpen(false)}
                        />
                    </Transition.Child>

                    {/* Drawer */}
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <div className="fixed inset-y-0 left-0 w-64 z-40">
                             <div className="flex h-full flex-col overflow-y-auto bg-zinc-900 border-r border-zinc-800">
                                <SidebarContent user={user} onLogout={onLogout} searchTerm={searchTerm} onSearchChange={onSearchChange} />
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Transition.Root>

            <div className="md:pl-64">
                 {/* --- Top Navbar for Mobile --- */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/50 px-4 backdrop-blur-sm md:hidden">
                    <h1 className="text-xl font-semibold tracking-tight">SecureNotes</h1>
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-50"
                        onClick={() => setIsDrawerOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
