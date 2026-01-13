import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('Footer');

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            Get in Touch
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            {t('contact')}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('contactLinks.inquiry')}
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your message"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-envelope text-primary"></i>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                    <div className="text-gray-900 dark:text-white">contact@studioelysian.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/studioelysian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fa-brands fa-twitter text-xl"></i>
                </a>
                <a
                  href="https://youtube.com/@studioelysian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fa-brands fa-youtube text-xl"></i>
                </a>
                <a
                  href="https://instagram.com/studioelysian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fa-brands fa-instagram text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
