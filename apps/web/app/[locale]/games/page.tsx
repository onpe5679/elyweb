import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function GamesPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('Projects');

  const games = [
    {
      slug: 'memorial-circuit',
      title: t('memorialCircuit.title'),
      desc: t('memorialCircuit.desc'),
      series: t('memorialCircuit.series'),
      tag: t('memorialCircuit.tag'),
      tagColor: 'bg-black/80',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwMxjmoU2dFZiNcKAo6scC2pXTlU9Eo3CFv5SAi1KgZEFosi2mg8jzVaGXF2-oQBfnC4sPZuUy04YlTjXg5yx6zWoL5O0XHihOA7WE_lVhRydAbL4_4pHGMoCvmN6qryd-nvFW0v2itQSxaz38QeoqEMv-ZLG10X1xFQygj30kDwKFDqT7hi7XnRhhndI-r-2F8MOaG3ypBJstBdDjWQkgcsreXu3WwW46tBIw2wIN5KMBR6dTt-ZBEBsPj8-J29ALPToexQQmljc',
    },
    {
      slug: 'space-empathy',
      title: t('spaceEmpathy.title'),
      desc: t('spaceEmpathy.desc'),
      series: t('spaceEmpathy.series'),
      tag: t('spaceEmpathy.tag'),
      tagColor: 'bg-primary/90',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9wLTEAMj-8JrucPk5Ur88qM2wkr0D7LmWA3pqOugBqSwgxs_JMdFKyRDQZtbOXs4BAwzQeD-dXw57d8TA7fRHk5dfRrbpnlhRJOUyPw8gDa1RAJe7NsX4UuhWp_ngpAchZJUP0-JwpLOjmqZQffL_DWgFz2IEyi-BLhNPphWbAMtWjxtRQs0nr1oGG_a7lr5wpxBMP8Na1ABVLLEODq5dUHLsU3FEG7p9nFx5v2lgqJxBiifLN1AUyQ1-v4z652DE3VTY4IVBUHs',
    },
    {
      slug: 'festival-not-over',
      title: t('festival.title'),
      desc: t('festival.desc'),
      series: t('festival.series'),
      tag: t('festival.tag'),
      tagColor: 'bg-primary/90',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNROh0Z8PhYTXUyJDxtlLPTmmgxzMgjGjKY1hNp4QaCGMbtCgTAos2kOnxhqdqz3yNqJ0eakHI4Es4WQBKgi4H6qsdBlQ4ZXiAg4np4EA_foFXIVc0eJ5DRxzWOb7jSEHdUl60fxxNCNKnWWYvWL2BWok3924lFrUjdUoIaM4Ot8eXbCEd5fafCXhD7F0aFkf1UFLuFmz0oMWa3TWwm-ZLKCBmANif8O1GkFoMa_mWfADFgx-X1YzKX2EYkVwldk42BQBBcPyFMCs',
    },
    {
      slug: 'sharehouse',
      title: t('sharehouse.title'),
      desc: t('sharehouse.desc'),
      series: t('sharehouse.series'),
      tag: t('sharehouse.tag'),
      tagColor: 'bg-pink-500',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZfqh4yPrE9cgvF1fwUTOa1M5S2XYI586T0LQ-3y0qBZ0vXfEB3ZAENXD8cUaEGeVKT9rSp1_THPFDANvhD0ahAU5LxXMddBhaWTcigCt9wKCW4rFPQB83ZjkpDc0ZAxOuEymtRP48ZzJxdhrCzJMqG1EI1eUNJWf3OCClgQHEuKl_ShO1Rcop_UD7cdPUp5_4--gW1OT1j3-G0RSkaYAH7Rw98aWknssLlSA-sMTwe2NmaNzeaLAbbnLkbzvn_dXksYBAxCIZ3EU',
    },
  ];

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            {t('label')}
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white uppercase tracking-tight">
            {t('title')}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/${params.locale}/games/${game.slug}`}
              data-testid="game-card"
              className="card-hover group bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 transition-colors duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <div
                  data-testid="game-status-badge"
                  className={`absolute top-4 left-4 ${game.tagColor} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10`}
                >
                  {game.tag}
                </div>
                <img
                  alt={game.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  src={game.image}
                />
              </div>
              <div className="p-6">
                <div className="mb-1 text-primary font-medium text-xs uppercase">{game.series}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{game.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{game.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
