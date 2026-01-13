import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('Vision');

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            About Us
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            Studio Elysian
          </h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12">
            <img
              alt="Studio Elysian"
              className="w-full h-64 md:h-96 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuH9zfscNU583mjOoxQHWwtrrxL_URj8Cn-XiQYYOWO8bL_cwElK-MXAWahlUtmzmPW6cc5MtnoE29qELOumVwb9xKsYn2_Z793_xKUJkd0g3lsf0vjq-bfcVaZksoNjdBUueHpyh4FtQ_O3OVsg0_C82cJ2CWkhZKUtWUay2m47G1RayxCQbbtPMHfj6w8-j9qkNUIa3wpaQNHiPg2Vvw5HAWHGsAYfZ-_5iOcsEeYvxeVJZl7vQ6Q2g02XZhZ_O8lRo2XIF-nd4"
            />
          </div>

          <h2 className="text-primary">{t('title')}</h2>
          <p>{t('p1')}</p>
          <p>{t('p2')}</p>
          <p>{t('p3')}</p>

          <h2 className="text-primary mt-12">Our Mission</h2>
          <p>
            We believe in the power of stories. Through our visual novels and interactive experiences,
            we aim to create emotional connections that transcend language and cultural barriers.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12 not-prose">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">2022</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Founded</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">3+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Projects</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">296%</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Funding</div>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-display font-black text-primary mb-2">Global</div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">Reach</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
