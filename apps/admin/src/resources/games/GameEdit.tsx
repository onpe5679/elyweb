import { 
    Edit, 
    SimpleForm, 
    TextInput, 
    SelectInput, 
    ArrayInput, 
    SimpleFormIterator, 
    BooleanInput, 
    NumberInput, 
    NumberField,
    ImageInput, 
    ImageField,
    ReferenceManyField,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    useRecordContext,
    ChipField,
    BooleanField,
    DateInput,
    FunctionField,
    useDataProvider,
    useNotify,
} from 'react-admin';
import type { ReactNode } from 'react';
import { Alert } from '@mui/material';
import { makeFeatured } from '../../featured';
import { isHabomSeries, sectionTypeInfo } from '../../siteMap';
import { LocalizedInput } from '../../components/LocalizedInput';
import { LocalizedArrayInput } from '../../components/LocalizedArrayInput';

const WEB_URL = (import.meta as any).env?.VITE_WEB_API_URL || 'http://localhost:3000';

type ImageValue = string | { src: string; rawFile?: File } | null | undefined;

const formatImageForDisplay = (value: ImageValue): { src: string; title: string } | undefined => {
    if (!value) return undefined;
    if (typeof value === 'object') return value as { src: string; title: string };
    const fullUrl = value.startsWith('/') ? `${WEB_URL}${value}` : value;
    return { src: fullUrl, title: value };
};

const parseImageForStorage = (value: File | { src: string; rawFile?: File } | string | null | undefined): ImageValue => {
    if (!value) return null;
    if (value instanceof File) {
        return { rawFile: value, src: URL.createObjectURL(value) };
    }
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && 'rawFile' in value) return value;
    if (typeof value === 'object' && 'src' in value) return value.src;
    return null;
};

const AddSectionButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    const url = `#/game_sections/create?source=${encodeURIComponent(JSON.stringify({ game_id: record.id }))}`;
    return (
        <a href={url} style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
        }}>
            + 섹션 추가
        </a>
    );
};

const SectionDivider = ({ title }: { title: string }) => (
    <div style={{ marginTop: '32px', marginBottom: '16px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '16px' }} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>{title}</h3>
    </div>
);

const GameSectionsPanel = () => {
    return (
        <div style={{ marginTop: '32px' }}>
            <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '24px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
                        상세 섹션
                    </h3>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
                        글(소개) · 이미지(캐러셀) · 영상 · 제작진(크레딧 카드) · 연혁(출시일·주요 전시 계산용, 화면에 섹션으로는 안 보임) · 스토어(상단 버튼)
                    </p>
                </div>
                <AddSectionButton />
            </div>
            <ReferenceManyField
                reference="game_sections"
                target="game_id"
                sort={{ field: 'display_order', order: 'ASC' }}
            >
                <Datagrid bulkActionButtons={false}>
                    <NumberField source="display_order" label="Order" />
                    <ChipField source="section_type" label="종류" />
                    <FunctionField label="웹에서 보이는 곳" render={(r: { section_type?: string }) => sectionTypeInfo(r.section_type)?.where ?? '-'} />
                    <TextField source="title_ko" label="제목 (KO)" />
                    <BooleanField source="is_visible" label="공개" />
                    <EditButton />
                    <DeleteButton redirect={false} mutationMode="pessimistic" />
                </Datagrid>
            </ReferenceManyField>
        </div>
    );
};

const Hint = ({ children }: { children: ReactNode }) => (
    <p style={{ margin: '-4px 0 12px', fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{children}</p>
);

const BrandNotice = () => {
    const record = useRecordContext();
    if (!record) return null;
    return isHabomSeries(record.series_ko) ? (
        <Alert severity="info" sx={{ mb: 2, width: '100%' }}>하봄 작품입니다 — 웹에서는 하봄 화면(시안 C)으로 표시되고, 메인 대표작에는 들어가지 않습니다.</Alert>
    ) : (
        <Alert severity="success" sx={{ mb: 2, width: '100%' }}>엘리시안 작품입니다 — 메인 표지·작품 목록·엘리시안 상세 화면에 표시됩니다.</Alert>
    );
};

const statusChoices = [
    { id: 'released', name: '출시 (Released)' },
    { id: 'coming_soon', name: '출시 예정 (Coming Soon)' },
    { id: 'in_development', name: '개발 중 (In Development)' },
    { id: 'publishing', name: '퍼블리싱 (Publishing)' },
];

export const GameEdit = () => {
    const dp = useDataProvider();
    const notify = useNotify();
    return (
        <Edit
            mutationMode="pessimistic"
            mutationOptions={{
                // 대표작은 한 작품만: 이 작품을 켜면 나머지는 자동으로 끈다.
                onSuccess: async (data: { id: string; is_featured?: boolean }) => {
                    if (data?.is_featured) {
                        try {
                            await makeFeatured(dp, data.id);
                        } catch (e) {
                            notify(`대표작 정리 실패: ${(e as Error).message}`, { type: 'warning' });
                        }
                    }
                    notify('저장했습니다. 웹사이트에는 몇 초 안에 반영됩니다.', { type: 'success' });
                },
            }}
        >
            <SimpleForm>
                <BrandNotice />
                <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>기본 정보</h3>

                <TextInput source="slug" fullWidth helperText="주소에 쓰입니다: /games/슬러그 (바꾸면 기존 링크가 끊깁니다)" />
                <LocalizedInput source="title" label="제목" />
                <Hint>메인 표지 띠·작품 목록·상세 제목. 줄바꿈 가능.</Hint>
                <LocalizedInput source="description" label="한 줄 소개" multiline />
                <Hint>상세 히어로와 작품 목록 카드에 보이는 2~3문장.</Hint>
                <LocalizedInput source="series" label="시리즈" />
                <Hint>예: Old Engine Series. <b>하봄 소속이면 "하봄 스튜디오"</b>로 쓰면 하봄 화면으로 표시됩니다.</Hint>

                <SelectInput source="status" label="상태" choices={statusChoices} />

                <LocalizedArrayInput source="genre" label="장르" />

                <ArrayInput source="platforms" label="플랫폼">
                    <SimpleFormIterator>
                        <TextInput source="" label={false} />
                    </SimpleFormIterator>
                </ArrayInput>

                <SectionDivider title="이미지" />
                <Hint>배너 = 상세 히어로 배경(가로 16:9) / 커버 = 히어로 오른쪽 포스터·이미지 캐러셀 첫 장(세로, 자르지 않고 전체 표시) / 썸네일 = 작품 목록·메인 표지 카드(비우면 배너). 썸네일과 배너가 다르면 상세에 들어갈 때 썸네일이 배너로 겹쳐 바뀝니다(게임 O.L. 연출).</Hint>

                <ImageInput
                    source="banner_image"
                    label="배너 (가로, 상세 히어로)"
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                    format={formatImageForDisplay}
                    parse={parseImageForStorage}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>

                <ImageInput
                    source="cover_image"
                    label="커버 (세로 포스터)"
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                    format={formatImageForDisplay}
                    parse={parseImageForStorage}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>

                <ImageInput
                    source="thumbnail_image"
                    label="썸네일 (목록 카드)"
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                    format={formatImageForDisplay}
                    parse={parseImageForStorage}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>

                <SectionDivider title="출시 · 스토어" />

                <DateInput
                    source="release_date"
                    label="출시일"
                    helperText="작품 목록·메인 표지의 출시 연도와 상세 '출시'에 쓰입니다. 비워 두면 연혁 섹션의 '출시' 항목에서 찾고, 없으면 Coming Soon."
                />
                <TextInput source="steam_url" fullWidth label="Steam 주소" helperText="상세 맨 위 Steam 버튼(로고). 다른 스토어는 '스토어' 섹션으로 추가." />
                <TextInput source="official_url" fullWidth label="공식 사이트" helperText="상세 맨 위 '공식 사이트' 버튼" />
                <TextInput source="trailer_url" fullWidth label="트레일러 주소 (선택)" helperText="영상은 '영상' 섹션이 우선입니다." />

                <SectionDivider title="노출" />

                <BooleanInput
                    source="is_featured"
                    label="메인 대표작 ('현재 펼쳐진 이야기')"
                    helperText="켜고 저장하면 이 작품만 대표작이 되고 다른 작품은 자동으로 꺼집니다. 엘리시안 작품만 메인 대표작이 됩니다."
                />
                <NumberInput source="display_order" label="정렬 순서" helperText="작은 숫자가 앞. 최신작을 앞에 둡니다(작품 목록·메인 표지·프레스 순서)." />

                <GameSectionsPanel />
            </SimpleForm>
        </Edit>
    );
};
