import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatCircle, X, List } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDocsPage = location.pathname.startsWith('/docs');

  useEffect(() => {
    if (isDocsPage) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDocsPage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname.startsWith('/docs')) {
        navigate('/#' + targetId);
    } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setIsMenuOpen(false);
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };


  const navLinks = [
    { name: 'Features', href: '#features', targetId: 'features' },
    { name: 'Modules', href: '#interactive-modules', targetId: 'interactive-modules' },
    { name: 'Pricing', href: '#pricing', targetId: 'pricing' },
    { name: 'FAQ', href: '#faq', targetId: 'faq' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`p-2 rounded-lg transition-colors ${isScrolled ? 'bg-primary' : isDocsPage ? 'bg-primary' : 'bg-white/20'}`}
              animate={{ rotate: isScrolled ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
                <ChatCircle className={`transition-colors ${isScrolled ? 'text-white' : isDocsPage ? 'text-white' : 'text-white'}`} size={20} />
            </motion.div>
            <h3 className={`text-xl font-bold transition-colors ${isScrolled ? 'text-foreground' : isDocsPage ? 'text-foreground' : 'text-white'}`}>
              Reflect.
            </h3>
          </motion.button>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.targetId)}
                className={`text-sm font-semibold transition-colors ${isScrolled ? 'text-muted-foreground hover:text-primary' : isDocsPage ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'} relative`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              onClick={handleLogin}
              className={`text-sm font-semibold transition-colors ${isScrolled ? 'text-muted-foreground hover:text-primary' : isDocsPage ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              Log in
            </motion.button>
            <motion.button
              onClick={handleGetStarted}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover-glow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${isScrolled ? 'text-foreground' : isDocsPage ? 'text-foreground' : 'text-white'} p-2 rounded-lg hover:bg-white/10 transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <List size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`lg:hidden overflow-hidden ${isScrolled ? 'bg-white/95' : isDocsPage ? 'bg-white/95' : 'bg-black/20'} backdrop-blur-lg`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              className="px-6 pt-2 pb-6 space-y-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.targetId)}
                  className={`block text-base font-semibold transition-colors ${isScrolled ? 'text-muted-foreground hover:text-primary' : isDocsPage ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (index * 0.05) }}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                className="border-t border-border/20 pt-4 flex flex-col space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                 <button 
                   onClick={handleLogin}
                   className={`text-base font-semibold transition-colors ${isScrolled ? 'text-muted-foreground hover:text-primary' : isDocsPage ? 'text-muted-foreground hover:text-primary' : 'text-white/80 hover:text-white'}`}
                 >
                  Log in
                </button>
                <motion.button
                  onClick={handleGetStarted}
                  className="rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 text-center transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
