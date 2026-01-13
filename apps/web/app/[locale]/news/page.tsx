import { useTranslations } from 'next-intl';

export default function NewsPage() {
  const t = useTranslations('Navigation');

  const newsItems = [
    {
      date: '2024.04',
      title: '메모리얼 서킷 스팀 정식 출시',
      excerpt: 'Studio Elysian의 첫 번째 상업 타이틀 메모리얼 서킷이 Steam에 정식 출시되었습니다.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwMxjmoU2dFZiNcKAo6scC2pXTlU9Eo3CFv5SAi1KgZEFosi2mg8jzVaGXF2-oQBfnC4sPZuUy04YlTjXg5yx6zWoL5O0XHihOA7WE_lVhRydAbL4_4pHGMoCvmN6qryd-nvFW0v2itQSxaz38QeoqEMv-ZLG10X1xFQygj30kDwKFDqT7hi7XnRhhndI-r-2F8MOaG3ypBJstBdDjWQkgcsreXu3WwW46tBIw2wIN5KMBR6dTt-ZBEBsPj8-J29ALPToexQQmljc',
    },
    {
      date: '2024.01',
      title: '어서오세요 쉐어하우스에! 펀딩 300% 달성',
      excerpt: '텀블벅 크라우드 펀딩에서 목표 금액의 300%를 달성했습니다.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZfqh4yPrE9cgvF1fwUTOa1M5S2XYI586T0LQ-3y0qBZ0vXfEB3ZAENXD8cUaEGeVKT9rSp1_THPFDANvhD0ahAU5LxXMddBhaWTcigCt9wKCW4rFPQB83ZjkpDc0ZAxOuEymtRP48ZzJxdhrCzJMqG1EI1eUNJWf3OCClgQHEuKl_ShO1Rcop_UD7cdPUp5_4--gW1OT1j3-G0RSkaYAH7Rw98aWknssLlSA-sMTwe2NmaNzeaLAbbnLkbzvn_dXksYBAxCIZ3EU',
    },
    {
      date: '2023.11',
      title: '지스타 2023 전시 참가',
      excerpt: '스토브 인디쇼케이스에 선정되어 지스타 2023에 참가했습니다.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVHPTFZPasBZtcFBFsRlZf4vhSmH0uyRPHid_2dtW6N7nVFHK8qMryYJvTPiapEcHt3v__ZGBVm0pq9Ksh-4PNTtSOeIa2biWszDq-Vy1yAkc_QJKfml8I4kAhrKW_WXbHpZmFcWdKPw9ehmpkc6YkK9DBZaN_6DYjmUnwbjc9eOVDfDt1JR0eb5raAdiIelbQWh9ifO-cPkPWFf4ifVhmOI6IGXOrmlJK8cMuMKCkUDJg4L6Ziv-mYRjLAOvB_c2f6hnmdxTlyvQ',
    },
  ];

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            Latest Updates
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            {t('news')}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <article
              key={index}
              className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 card-hover"
            >
              <div className="h-48 overflow-hidden">
                <img
                  alt={item.title}
                  className="w-full h-full object-cover"
                  src={item.image}
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-primary font-bold mb-2">{item.date}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
