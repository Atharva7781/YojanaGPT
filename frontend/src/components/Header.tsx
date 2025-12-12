import React, { useState, useEffect } from 'react';
import { FiHome, FiCompass, FiInfo, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { checkStatus } from '../api/recommend';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [schemeCount, setSchemeCount] = useState<number | null>(null);
  const [failCount, setFailCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    let mounted = true;
    const probe = () => {
      checkStatus()
        .then((res) => {
          if (!mounted) return;
          setApiStatus('ready');
          if (typeof res.schemes_rows === 'number') setSchemeCount(res.schemes_rows);
          setFailCount(0);
        })
        .catch(() => {
          if (!mounted) return;
          setFailCount((prev) => {
            const next = prev + 1;
            setApiStatus(next >= 2 ? 'error' : 'loading');
            return next;
          });
        });
    };
    probe();
    const id = setInterval(probe, 2000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const navItems = [
    { name: 'Home', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Explore', icon: <FiCompass className="w-5 h-5" /> },
    { name: 'About', icon: <FiInfo className="w-5 h-5" /> },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">YG</span>
              </motion.div>
              <motion.h1
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
              >
                YojanaGPT
              </motion.h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href="#"
                  className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                    item.name === 'Home' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100/50'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
            <div className="hidden md:flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  apiStatus === 'ready'
                    ? 'bg-green-100 text-green-800'
                    : apiStatus === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {apiStatus === 'ready' ? 'API: Ready' : apiStatus === 'error' ? 'API: Error' : 'API: Loading'}
                {schemeCount !== null && apiStatus === 'ready' && <span className="ml-2">({schemeCount})</span>}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-20 px-4 md:hidden"
        >
          <nav className="flex flex-col space-y-2 px-2 pt-2 pb-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href="#"
                className="flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-100/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      )}
      
      {/* Add padding to account for fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;
