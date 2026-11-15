import { List, Datagrid, TextField, ChipField, NumberField, DateField, FunctionField, EditButton } from 'react-admin';
import { Chip } from '@mui/material';
import { FeaturedToggle } from '../../featured';
import { isHabomSeries } from '../../siteMap';

const BrandChip = () => (
    <FunctionField
        label="소속"
        render={(r: { series_ko?: string }) =>
            isHabomSeries(r.series_ko) ? (
                <Chip size="small" label="하봄" sx={{ bgcolor: '#FDE7EE', color: '#C9416D', fontWeight: 700 }} />
            ) : (
                <Chip size="small" label="엘리시안" variant="outlined" />
            )
        }
    />
);

/** 작품 목록 — 웹의 작품 목록·메인 표지 순서(정렬 순서)와 같은 순서로 보인다. */
export const GameList = () => (
    <List sort={{ field: 'display_order', order: 'ASC' }} perPage={50} title="작품">
        <Datagrid rowClick="edit" bulkActionButtons={false}>
            <NumberField source="display_order" label="순서" />
            <TextField source="title_ko" label="제목" />
            <BrandChip />
            <TextField source="series_ko" label="시리즈" />
            <ChipField source="status" label="상태" />
            <DateField source="release_date" label="출시일" emptyText="비어 있음(연혁 기준)" />
            <FunctionField label="메인 대표작" render={() => <FeaturedToggle />} />
            <EditButton />
        </Datagrid>
    </List>
);
