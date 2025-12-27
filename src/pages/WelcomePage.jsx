import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaBook, FaChartLine, FaClock, FaEnvelope, FaGraduationCap, FaLaptop, FaLightbulb, FaUsers } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';

const WelcomePage = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { t } = useTranslation();
  const { isRtl } = useDirection();

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    setShowScrollToTop(window.scrollY > 300);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navigation Bar */}
      {/*<nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">*/}
      {/*  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*    <div className="flex justify-center items-center h-16">*/}
      {/*      <div className="space-x-4">*/}
      {/*        <button onClick={() => scrollToSection('hero')} className="hover:underline">Home</button>*/}
      {/*        <button onClick={() => scrollToSection('features')} className="hover:underline">Key Features</button>*/}
      {/*        <button onClick={() => scrollToSection('about')} className="hover:underline">About</button>*/}
      {/*        <button onClick={() => scrollToSection('contact-form')} className="hover:underline">Contact</button>*/}
      {/*        <button onClick={() => scrollToSection('contribute')} className="hover:underline">Contribute</button>*/}
      {/*        <Link to="/login" className="hover:underline">Login</Link>*/}
      {/*        <Link to="/register" className="hover:underline">Register</Link>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
          {/*</nav>*/}
            <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex items-center h-16 ${isRtl ? 'flex-row-reverse' : ''}`}>

                      {/* Left spacer / Logo */}
                      <div className="flex-1">
                          {/* Optional logo or title */}
                          <span className="font-bold text-lg">{t('app.name')}</span>
                      </div>

                      {/* Center navigation */}
                        <div className={`flex space-x-6 ${isRtl ? 'space-x-reverse' : ''}`}>
                          <button onClick={() => scrollToSection('hero')} className="hover:underline transition-colors duration-200 ease-out">
                            {t('welcome.nav.home')}
                          </button>
                          <button onClick={() => scrollToSection('features')} className="hover:underline transition-colors duration-200 ease-out">
                            {t('welcome.nav.features')}
                          </button>
                          <button onClick={() => scrollToSection('about')} className="hover:underline transition-colors duration-200 ease-out">
                            {t('welcome.nav.about')}
                          </button>
                          <button onClick={() => scrollToSection('contact-form')} className="hover:underline transition-colors duration-200 ease-out">
                            {t('welcome.nav.contact')}
                          </button>
                          <button onClick={() => scrollToSection('contribute')} className="hover:underline transition-colors duration-200 ease-out">
                            {t('welcome.nav.contribute')}
                          </button>
                      </div>

                      {/* Right auth buttons */}
                        <div className={`flex-1 flex ${isRtl ? 'justify-start' : 'justify-end'} space-x-4 ${isRtl ? 'space-x-reverse' : ''}`}>
                          <Link
                              to="/login"
                            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200 ease-out"
                          >
                            {t('welcome.actions.login')}
                          </Link>

                          {/* Only include Register if needed */}
                          <Link
                              to="/register"
                              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-out"
                          >
                              {t('welcome.actions.register')}
                          </Link>
                      </div>

                  </div>
              </div>
          </nav>


      {/* Hero Section */}
      <div id="hero" className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary-600 to-primary-400 text-white">
        <div className="text-center space-y-6 motion-safe:animate-fade-up">
          <img
            src="/regman-logo.png"
            alt={t('welcome.logoAlt')}
            className="mx-auto w-32 h-32"
          />
          <h1 className="text-5xl font-bold">{t('welcome.hero.title')}</h1>
          <p className="text-lg max-w-2xl mx-auto">
            {t('welcome.hero.subtitle')}
          </p>
          <div className={`flex justify-center space-x-4 ${isRtl ? 'space-x-reverse' : ''}`}>
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 ease-out"
            >
              {t('welcome.actions.login')}
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 ease-out"
            >
              {t('welcome.actions.register')}
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">{t('welcome.features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaBook className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">{t('welcome.features.cards.manageCourses.title')}</h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('welcome.features.cards.manageCourses.body')}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaGraduationCap className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">{t('welcome.features.cards.trackProgress.title')}</h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('welcome.features.cards.trackProgress.body')}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaClock className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">{t('welcome.features.cards.bookOfficeHours.title')}</h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('welcome.features.cards.bookOfficeHours.body')}
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaChartLine className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">{t('welcome.features.cards.analytics.title')}</h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('welcome.features.cards.analytics.body')}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 bg-gray-100 dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-8">{t('welcome.about.title')}</h2>
        <p className="max-w-4xl mx-auto text-center text-lg text-gray-700 dark:text-gray-300">
          {/*RegMan is designed to simplify student management for both administrators and students.*/}
          {/*From managing courses to tracking academic progress, our platform provides all the tools*/}
                  {/*you need to succeed.*/}
                  {t('welcome.about.body')}
        </p>
      </div>

      {/* Contribute Section */}
      <div id="contribute" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">{t('welcome.contribute.title')}</h2>
        <div className={`flex justify-center space-x-4 ${isRtl ? 'space-x-reverse' : ''}`}>
          <a
            href="https://github.com/RegManApp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 ease-out"
          >
            {t('welcome.contribute.viewOnGithub')}
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScI48XI-hfc5MmUgzFcTkhh5eqAGOYcZVM42DBUNn9y3G47Wg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors duration-200 ease-out"
          >
            {t('welcome.contribute.submitIdeas')}
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <div id="contact-form" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">{t('welcome.contact.title')}</h2>
        <form className="max-w-3xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">{t('welcome.contact.nameLabel')}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={t('welcome.contact.namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('welcome.contact.emailLabel')}</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={t('welcome.contact.emailPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('welcome.contact.messageLabel')}</label>
            <textarea
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={t('welcome.contact.messagePlaceholder')}
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 ease-out"
            >
              {t('welcome.contact.submit')}
            </button>
          </div>
        </form>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          aria-label={t('welcome.scrollToTop')}
          className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors duration-200 ease-out`}
        >
          <FaArrowUp />
        </button>
      )}

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-gray-400">
        <div className={`max-w-6xl mx-auto flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
          <img src="/regman-logo.png" alt={t('welcome.logoAlt')} className="w-12 h-12" />
          <div className={`space-x-4 ${isRtl ? 'space-x-reverse' : ''}`}>
            <button onClick={() => scrollToSection('hero')} className="hover:underline transition-colors duration-200 ease-out">{t('welcome.nav.home')}</button>
            <button onClick={() => scrollToSection('features')} className="hover:underline transition-colors duration-200 ease-out">{t('welcome.nav.features')}</button>
            <button onClick={() => scrollToSection('about')} className="hover:underline transition-colors duration-200 ease-out">{t('welcome.nav.about')}</button>
            <button onClick={() => scrollToSection('contact-form')} className="hover:underline transition-colors duration-200 ease-out">{t('welcome.nav.contact')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
