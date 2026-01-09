import { Link } from 'react-router-dom';
import {
  FaBug,
  FaCalendarAlt,
  FaComments,
  FaGithub,
  FaLightbulb,
  FaLock,
  FaShieldAlt,
  FaBullhorn,
  FaClock,
  FaUsers,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const GITHUB_ORG_URL = 'https://github.com/RegManApp';
const GITHUB_FEATURE_REQUEST_URL =
  'https://github.com/RegManApp/RegMan.Frontend/issues/new?labels=enhancement&title=Feature%20request%3A%20';
const GITHUB_BUG_REPORT_URL =
  'https://github.com/RegManApp/RegMan.Frontend/issues/new?labels=bug&title=Bug%20report%3A%20';

const SectionHeader = ({ kicker, title, subtitle }) => (
  <div className="mx-auto max-w-3xl text-center">
    {kicker ? (
      <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{kicker}</p>
    ) : null}
    <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
    {subtitle ? (
      <p className="mt-3 text-base text-gray-600 dark:text-gray-300">{subtitle}</p>
    ) : null}
  </div>
);

const FeatureCard = ({ icon: Icon, title, body }) => (
  <div className="h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6">
    <div className="flex items-start gap-4">
      <div className="shrink-0 rounded-lg bg-primary-50 dark:bg-gray-900 p-3">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{body}</p>
      </div>
    </div>
  </div>
);

const ActionCard = ({ icon: Icon, title, body, href, ctaLabel }) => (
  <div className="h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6">
    <div className="flex items-start gap-4">
      <div className="shrink-0 rounded-lg bg-primary-50 dark:bg-gray-900 p-3">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{body}</p>
        <a
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  </div>
);

const WelcomePage = () => {
  const { isAuthenticated } = useAuth();

  const primaryCta = isAuthenticated
    ? { to: '/dashboard', label: 'Go to Dashboard' }
    : { to: '/login', label: 'Login / Get Started' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/regman-logo.png" alt="RegMan" className="h-8 w-8" />
              <span className="font-semibold">RegMan</span>
            </div>

            <nav className="flex items-center gap-3">
              <Link
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                to="/privacy-policy"
              >
                Privacy Policy
              </Link>
              <Link
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                to={primaryCta.to}
              >
                {primaryCta.label}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 1) Hero */}
      <section className="bg-gradient-to-b from-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-white/90">University registration, communication, and scheduling</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
              RegMan keeps academic workflows organized — end to end.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/90">
              A secure platform for office hours booking, announcements, chat, and calendar syncing
              that works across students, instructors, and administrators.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={primaryCta.to}
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 hover:bg-gray-100"
              >
                {primaryCta.label}
              </Link>
              <a
                href={GITHUB_ORG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2) What RegMan Does */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="What RegMan does"
            title="The core tools students and staff use daily"
            subtitle="Designed for real university workflows: scheduling, communication, and coordination—without the noise."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={FaClock}
              title="Office Hours booking"
              body="Find availability, book time, and keep meetings organized across staff and students."
            />
            <FeatureCard
              icon={FaComments}
              title="Chat & Notifications"
              body="Fast conversations and timely updates so people don’t miss what matters."
            />
            <FeatureCard
              icon={FaBullhorn}
              title="Announcements"
              body="Publish important updates with visibility and accountability across the organization."
            />
            <FeatureCard
              icon={FaCalendarAlt}
              title="Google Calendar integration"
              body="Optional OAuth connection to sync events and reduce scheduling conflicts."
            />
          </div>
        </div>
      </section>

      {/* 3) Who It’s For */}
      <section className="py-14 sm:py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Who it’s for"
            title="Built for every role involved in academic operations"
            subtitle="Role-based access keeps the right features available to the right people—without hardcoding role behavior into the UI."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={FaUsers}
              title="Students"
              body="Track schedules, get updates, and book office hours with confidence."
            />
            <FeatureCard
              icon={FaUsers}
              title="Instructors"
              body="Manage availability, communicate quickly, and stay aligned with course activity."
            />
            <FeatureCard
              icon={FaUsers}
              title="Admins / Advisors"
              body="Keep oversight and workflows consistent with auditability across critical actions."
            />
          </div>
        </div>
      </section>

      {/* 4) Community & Contribution (MANDATORY) */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Community"
            title="Help improve RegMan"
            subtitle="Contributions and feedback make the product better for everyone. These actions open in a new tab."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <ActionCard
              icon={FaGithub}
              title="GitHub Organization"
              body="Browse the source, project docs, and roadmap across the RegMan org."
              href={GITHUB_ORG_URL}
              ctaLabel="View on GitHub"
            />
            <ActionCard
              icon={FaLightbulb}
              title="Submit an Idea"
              body="Request a feature or propose an improvement for students, instructors, or admins."
              href={GITHUB_FEATURE_REQUEST_URL}
              ctaLabel="Submit an Idea"
            />
            <ActionCard
              icon={FaBug}
              title="Report a Bug"
              body="Found something broken? Open an issue with steps to reproduce."
              href={GITHUB_BUG_REPORT_URL}
              ctaLabel="Report a Bug"
            />
          </div>
        </div>
      </section>

      {/* 5) Trust & Security */}
      <section className="py-14 sm:py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Trust & Security"
            title="Secure by design"
            subtitle="Authentication stays server-authoritative. Integrations are optional and scoped. Auditability is built-in."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={FaLock}
              title="Secure authentication"
              body="Session handling and access control are enforced by the backend as the source of truth."
            />
            <FeatureCard
              icon={FaCalendarAlt}
              title="OAuth-based integrations"
              body="Google Calendar uses OAuth so users can grant and revoke access directly."
            />
            <FeatureCard
              icon={FaShieldAlt}
              title="Privacy-first & audit logging"
              body="Sensitive actions can be tracked to support accountability and operational reviews."
            />
          </div>
        </div>
      </section>

      {/* 6) Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src="/regman-logo.png" alt="RegMan" className="h-9 w-9" />
              <div>
                <div className="font-semibold">RegMan</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  University registration & management
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <Link className="text-gray-700 dark:text-gray-300 hover:underline" to="/privacy-policy">
                Privacy Policy
              </Link>
              <Link className="text-gray-700 dark:text-gray-300 hover:underline" to="/login">
                Login
              </Link>
              <a
                className="text-gray-700 dark:text-gray-300 hover:underline"
                href={GITHUB_ORG_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                className="text-gray-700 dark:text-gray-300 hover:underline"
                href={GITHUB_BUG_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Report a Bug
              </a>
              <a
                className="text-gray-700 dark:text-gray-300 hover:underline"
                href={GITHUB_FEATURE_REQUEST_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Submit an Idea
              </a>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} RegMan
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
