import { useState } from 'react';
import { useDataProvider, useNotify, useRecordContext, useRefresh, type DataProvider, type Identifier } from 'react-admin';
import { Button, Chip } from '@mui/material';

/**
 * 메인 "현재 펼쳐진 이야기" 대표작은 한 작품만 지정한다.
 * 지정한 작품만 is_featured = true, 나머지는 모두 false 로 맞춘다.
 */
export async function makeFeatured(dp: DataProvider, id: Identifier) {
  const { data } = await dp.getList('games', {
    pagination: { page: 1, perPage: 200 },
    sort: { field: 'display_order', order: 'ASC' },
    filter: {},
  });
  const others = data.filter((g) => g.is_featured && g.id !== id).map((g) => g.id);
  if (others.length) await dp.updateMany('games', { ids: others, data: { is_featured: false } });
  const current = data.find((g) => g.id === id);
  if (!current?.is_featured) await dp.update('games', { id, data: { is_featured: true }, previousData: current });
}

/** 목록 행의 "대표작으로" 버튼 / 이미 대표작이면 표시만 */
export const FeaturedToggle = () => {
  const record = useRecordContext();
  const dp = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);
  if (!record) return null;
  if (record.is_featured) return <Chip size="small" color="primary" label="대표작" />;
  return (
    <Button
      size="small"
      variant="outlined"
      disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try {
          await makeFeatured(dp, record.id);
          notify(`'${record.title_ko}' 을(를) 메인 대표작으로 지정했습니다.`, { type: 'success' });
          refresh();
        } catch (err) {
          notify(`대표작 지정 실패: ${(err as Error).message}`, { type: 'error' });
        } finally {
          setBusy(false);
        }
      }}
    >
      대표작으로
    </Button>
  );
};
