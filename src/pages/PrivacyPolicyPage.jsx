import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Effective date: January 10, 2026
          </p>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">
            RegMan is a university registration and academic management system. This Privacy Policy
            explains what information RegMan processes, why it is processed, and the choices you
            have.
          </p>
        </header>

        <main className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              RegMan is designed for students, instructors, advisors, and administrators. In most
              deployments, RegMan is operated by an educational institution (your university or
              organization). When RegMan is provided by an institution, that institution may act as
              the data controller for certain data, and RegMan functions as the service used to
              manage academic and operational workflows.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Data We Collect</h2>
            <div className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                RegMan processes the following categories of information depending on features you
                use and permissions granted by your institution:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium">Account and identity data:</span> name, email,
                  role (student/instructor/admin/advisor), and identifiers used to associate you with
                  academic records.
                </li>
                <li>
                  <span className="font-medium">Academic and administrative data:</span> course
                  enrollments, schedules, advising plans, transcript and GPA-related data (as
                  applicable), and related metadata.
                </li>
                <li>
                  <span className="font-medium">Operational interactions:</span> office hours
                  bookings, chat messages, announcements interactions, and notification preferences.
                </li>
                <li>
                  <span className="font-medium">Technical data:</span> logs required to operate and
                  secure the service (e.g., authentication events, request metadata), and device/
                  browser information used for reliability and troubleshooting.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How We Use Data</h2>
            <div className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <p>RegMan uses processed information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authenticate users and maintain secure sessions.</li>
                <li>Provide core product functionality (registration, scheduling, advising workflows).</li>
                <li>Enable collaboration features (chat, notifications, announcements).</li>
                <li>Support calendar features such as event creation and syncing (when enabled).</li>
                <li>Maintain auditability, detect abuse, and protect system integrity.</li>
                <li>Debug issues and improve reliability and performance.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Third-Party Integrations (Google Calendar)</h2>
            <div className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                RegMan can integrate with Google Calendar to help you sync academic events and
                scheduling details. If you choose to connect Google Calendar:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  The connection is established using OAuth authorization with Google. You can
                  revoke access at any time from your Google Account settings.
                </li>
                <li>
                  RegMan only requests the minimum access required to provide the integration
                  features offered in your deployment.
                </li>
                <li>
                  Token and session handling for the integration is designed to support secure
                  cross-site flows (for example, secure cookies when applicable).
                </li>
              </ul>
              <p>
                The exact data accessed depends on the integration features enabled by your
                institution and the permissions granted during the OAuth flow.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Security Practices</h2>
            <div className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                RegMan is built with security in mind. Practices may vary by deployment, but commonly
                include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Secure authentication using industry-standard tokens and session controls.</li>
                <li>Role-based access control to prevent unauthorized data access.</li>
                <li>Encryption in transit (HTTPS) for API communications.</li>
                <li>Audit logging for sensitive operations and administrative actions.</li>
                <li>Monitoring and rate-limiting patterns to detect and reduce abuse.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. User Rights</h2>
            <div className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                Your rights and the process for exercising them depend on your institution’s role as
                the operator of RegMan. In many cases, requests are handled by your university or
                system administrator.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium">Access and correction:</span> you can request access
                  to your data and corrections where appropriate.
                </li>
                <li>
                  <span className="font-medium">Deletion and retention:</span> retention schedules
                  may be governed by institutional policy and legal obligations.
                </li>
                <li>
                  <span className="font-medium">Integration controls:</span> you can disconnect
                  Google Calendar by revoking OAuth access via Google.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Contact Information</h2>
            <div className="mt-3 space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                If RegMan is provided by your institution, contact your university’s system
                administrator or registrar’s office for privacy requests.
              </p>
              <p>
                For product or security reports related to the open-source project, you can contact
                the maintainers through GitHub:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                    href="https://github.com/RegManApp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://github.com/RegManApp
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} RegMan
          </div>
          <div className="flex gap-4 text-sm">
            <Link className="text-primary-600 dark:text-primary-400 hover:underline" to="/">
              Home
            </Link>
            <Link className="text-primary-600 dark:text-primary-400 hover:underline" to="/login">
              Login
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
