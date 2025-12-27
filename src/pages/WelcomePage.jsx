import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaBook, FaChartLine, FaClock, FaEnvelope, FaGraduationCap, FaLaptop, FaLightbulb, FaUsers } from 'react-icons/fa';

const WelcomePage = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

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
      <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="space-x-4">
              <button onClick={() => scrollToSection('hero')} className="hover:underline">Home</button>
              <button onClick={() => scrollToSection('features')} className="hover:underline">Key Features</button>
              <button onClick={() => scrollToSection('about')} className="hover:underline">About</button>
              <button onClick={() => scrollToSection('contact-form')} className="hover:underline">Contact</button>
              <button onClick={() => scrollToSection('contribute')} className="hover:underline">Contribute</button>
              <Link to="/login" className="hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="hero" className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary-600 to-primary-400 text-white">
        <div className="text-center space-y-6">
          <img
            src="/regman-logo.png"
            alt="RegMan Logo"
            className="mx-auto w-32 h-32"
          />
          <h1 className="text-5xl font-bold">Welcome to RegMan</h1>
          <p className="text-lg max-w-2xl mx-auto">
            RegMan is your comprehensive student management system. Easily manage
            academic plans, courses, enrollments, and more with our intuitive platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-200 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaBook className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">Manage Courses</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Create, update, and organize courses effortlessly.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaGraduationCap className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">Track Progress</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor academic progress and stay on top of your goals.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaClock className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">Book Office Hours</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Schedule meetings with instructors seamlessly.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition">
            <FaChartLine className="text-primary-600 text-4xl mb-4" />
            <h4 className="text-xl font-semibold mb-2">Analytics Dashboard</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Gain insights into academic and platform data.
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-16 bg-gray-100 dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-8">About RegMan</h2>
        <p className="max-w-4xl mx-auto text-center text-lg text-gray-700 dark:text-gray-300">
          {/*RegMan is designed to simplify student management for both administrators and students.*/}
          {/*From managing courses to tracking academic progress, our platform provides all the tools*/}
                  {/*you need to succeed.*/}
                  We are a team of passionate developers who have seen firsthand
                  how fragmented and complicated university management systems can be.
                  RegMan is our innovative solution designed to streamline academic workflows,
                  making it easier than ever to manage courses, enrollments, schedules,
                  and academic performance. Our goal is to provide students, instructors,
                  and administrators with a seamless, intuitive platform that brings
                  everything together in one place, so you can focus on what really matters:
                  learning and teaching.
        </p>
      </div>

      {/* Contribute Section */}
      <div id="contribute" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Contribute to RegMan</h2>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com/RegManApp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            View on GitHub
          </a>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScI48XI-hfc5MmUgzFcTkhh5eqAGOYcZVM42DBUNn9y3G47Wg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
          >
            Submit Ideas
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <div id="contact-form" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <form className="max-w-3xl mx-auto space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Your Email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Your Message"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition"
        >
          <FaArrowUp />
        </button>
      )}

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-gray-400">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <img src="/regman-logo.png" alt="RegMan Logo" className="w-12 h-12" />
          <div className="space-x-4">
            <button onClick={() => scrollToSection('hero')} className="hover:underline">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:underline">Key Features</button>
            <button onClick={() => scrollToSection('about')} className="hover:underline">About</button>
            <button onClick={() => scrollToSection('contact-form')} className="hover:underline">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
