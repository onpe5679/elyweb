import { useEffect, useState } from 'react';
import { Title, useDataProvider, useNotify, type RaRecord } from 'react-admin';
import { Alert, Box, Button, Card, CardContent, Chip, MenuItem, TextField, Typography } from '@mui/material';
import { makeFeatured } from './featured';
import { WEB_URL, isHabomSeries } from './siteMap';

type Area = { title: string; path: string; items: { label: string; to?: string; note?: string }[] };

/** 새 사이트의 화면 순서대로, 각 화면을 어느 메뉴에서 고치는지 */
const AREAS: Area[] = [
  {
    title: '메인',
    path: '/',
    items: [
      { label: '대표작("현재 펼쳐진 이야기", 표지 띠 맨 앞)', note: '위에서 선택' },
      { label: '표지 작품 띠·작품 순서·출시 연도', to: '#/games', note: '작품' },
      { label: '비전 제목·본문, 숫자 4개, 비전 이미지', to: '#/company_settings', note: '사이트 설정' },
      { label: '주요 연혁(메인 표시 체크한 항목, 최신순)', to: '#/timeline_events', note: '스튜디오 연혁' },
    ],
  },
  {
    title: '작품 목록',
    path: '/games',
    items: [
      { label: '순서 = 정렬 순서(작은 숫자가 앞, 최신작 먼저)', to: '#/games' },
      { label: '번호 대신 출시 연도: 출시일 → 연혁의 "출시" → 없으면 Coming Soon', to: '#/games' },
      { label: '시리즈를 "하봄 스튜디오"로 쓰면 하봄 작품(하봄 화면)', to: '#/games' },
    ],
  },
  {
    title: '게임 상세',
    path: '/games/[slug]',
    items: [
      { label: '히어로: 제목·한 줄 소개·배너·포스터·스토어 버튼', to: '#/games', note: '작품 기본 정보' },
      { label: '소개 / 이미지 / 영상 / 제작진 / 스토어', to: '#/games', note: '작품 → 상세 섹션' },
      { label: '작품 정보의 출시·주요 전시 = "연혁" 섹션에서 자동 계산', to: '#/games' },
    ],
  },
  {
    title: '하봄',
    path: '/habom',
    items: [
      { label: '하봄 소속 작품이 자동으로 하봄 메인·하봄 상세(시안 C)에 표시', to: '#/games' },
      { label: '셰어하우스 미니 체험(웹 데모)은 사이트 코드에 포함 — 어드민 입력 없음' },
    ],
  },
  {
    title: '스튜디오 소개',
    path: '/about',
    items: [
      { label: '소개 이미지·비전·숫자·펀딩 달성률', to: '#/company_settings', note: '사이트 설정' },
      { label: '연혁(최신순, 비활성 항목 숨김)', to: '#/timeline_events', note: '스튜디오 연혁' },
      { label: '팀원 소개는 보류 — 현재 사이트에 나오지 않음', to: '#/team_members' },
    ],
  },
  {
    title: '새 소식',
    path: '/news',
    items: [
      { label: '직접 쓴 소식', to: '#/news', note: '새 소식' },
      { label: '표시 방식(직접 글 / X 위젯 / 둘 다)', to: '#/company_settings', note: '사이트 설정' },
    ],
  },
  {
    title: '문의',
    path: '/contact',
    items: [
      { label: '입력 폼 없이 대표 메일 + SNS만 표시', to: '#/company_settings', note: 'contact_email · SNS 주소' },
    ],
  },
  {
    title: '프레스',
    path: '/press',
    items: [
      { label: '스튜디오 공통 자료 = 작품을 비워 둔 프레스 자료', to: '#/press_kits' },
      { label: '작품별 자료 = 작품을 지정한 프레스 자료(키 비주얼·포스터·스토어는 자동)', to: '#/press_kits' },
    ],
  },
];

export default function Dashboard() {
  const dp = useDataProvider();
  const notify = useNotify();
  const [games, setGames] = useState<RaRecord[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () =>
    dp
      .getList('games', { pagination: { page: 1, perPage: 200 }, sort: { field: 'display_order', order: 'ASC' }, filter: {} })
      .then(({ data }) => setGames(data))
      .catch(() => setGames([]));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featured = games.filter((g) => g.is_featured);
  const elysian = games.filter((g) => !isHabomSeries(g.series_ko));

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200 }}>
      <Title title="사이트 구조 안내" />
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>새 사이트 구조</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        엘리시안(시안 D)·하봄(시안 C) 리디자인 기준입니다. 각 화면이 어느 메뉴의 어떤 값으로 채워지는지 정리했습니다.{' '}
        <a href={WEB_URL} target="_blank" rel="noreferrer">웹사이트 열기 ↗</a>
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>메인 대표작 — "현재 펼쳐진 이야기"</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            한 작품만 지정됩니다. 엘리시안 작품만 메인 대표작이 될 수 있어요(하봄 작품은 하봄 화면에서 소개).
          </Typography>
          {featured.length > 1 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              대표작이 {featured.length}개 지정되어 있습니다. 아래에서 하나를 다시 고르면 나머지는 자동으로 해제됩니다.
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="대표작"
              sx={{ minWidth: 320 }}
              value={featured.length === 1 ? featured[0].id : ''}
              disabled={busy || !elysian.length}
              data-testid="featured-select"
              onChange={async (e) => {
                setBusy(true);
                try {
                  await makeFeatured(dp, e.target.value);
                  await load();
                  notify('메인 대표작을 바꿨습니다. 웹사이트에는 몇 초 안에 반영됩니다.', { type: 'success' });
                } catch (err) {
                  notify(`대표작 지정 실패: ${(err as Error).message}`, { type: 'error' });
                } finally {
                  setBusy(false);
                }
              }}
            >
              {elysian.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.title_ko}</MenuItem>
              ))}
            </TextField>
            {featured.map((g) => <Chip key={g.id} color="primary" label={`현재: ${g.title_ko}`} />)}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {AREAS.map((a) => (
          <Card key={a.title} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{a.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{a.path}</Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.75, fontSize: 14, lineHeight: 1.5 } }}>
                {a.items.map((it) => (
                  <li key={it.label}>
                    {it.to ? <a href={it.to}>{it.label}</a> : it.label}
                    {it.note && <Typography component="span" variant="caption" color="text.secondary"> · {it.note}</Typography>}
                  </li>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button href="#/games" variant="contained" sx={{ mr: 1 }}>작품 관리</Button>
        <Button href="#/company_settings" variant="outlined">사이트 설정</Button>
      </Box>
    </Box>
  );
}
