import { 
    Edit, 
    SimpleForm, 
    TextInput, 
    SelectInput, 
    NumberInput, 
    BooleanInput,
    ReferenceInput,
    ArrayInput,
    SimpleFormIterator,
    ImageInput,
    ImageField,
    useRecordContext,
    FormDataConsumer,
} from 'react-admin';
import { Alert } from '@mui/material';
import { LocalizedInput } from '../../components/LocalizedInput';
import { sectionTypeChoices, sectionTypeInfo } from '../../siteMap';

const WEB_URL = import.meta.env.VITE_WEB_API_URL || 'http://localhost:3000';

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


const SectionTitle = () => {
    const record = useRecordContext();
    if (!record) return <span>Section</span>;
    return <span>Section: {record.title_ko || record.title_en || record.section_type}</span>;
};

export const GameSectionEdit = () => (
    <Edit title={<SectionTitle />}>
        <SimpleForm>
            <ReferenceInput source="game_id" reference="games">
                <SelectInput optionText="title_ko" label="작품" fullWidth />
            </ReferenceInput>

            <SelectInput source="section_type" label="섹션 종류" choices={sectionTypeChoices} fullWidth />

            <FormDataConsumer>
                {({ formData }) => {
                    const info = sectionTypeInfo(formData?.section_type);
                    return info ? (
                        <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
                            <b>웹에서 보이는 곳:</b> {info.where}
                            {info.hint && <><br />{info.hint}</>}
                        </Alert>
                    ) : null;
                }}
            </FormDataConsumer>

            <LocalizedInput source="title" label="섹션 제목" />

            <FormDataConsumer>
                {({ formData }) => {
                    const sectionType = formData?.section_type;

                    if (sectionType === 'text' || sectionType === 'custom') {
                        return (
                            <LocalizedInput 
                                source="content" 
                                label="본문" 
                                multiline 
                                rows={6} 
                            />
                        );
                    }

                    if (sectionType === 'gallery') {
                        return (
                            <ArrayInput source="images" label="이미지 (캐러셀에 순서대로)">
                                <SimpleFormIterator>
                                    <ImageInput 
                                        source="" 
                                        label="Image"
                                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                                        format={formatImageForDisplay}
                                        parse={parseImageForStorage}
                                    >
                                        <ImageField source="src" title="title" />
                                    </ImageInput>
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    if (sectionType === 'video') {
                        return (
                            <TextInput 
                                source="video_url" 
                                label="YouTube 주소" 
                                fullWidth 
                                helperText="watch?v=… / youtu.be/… / embed/… 모두 됩니다"
                            />
                        );
                    }

                    if (sectionType === 'store') {
                        return (
                            <ArrayInput source="store_links" label="스토어·SNS 버튼">
                                <SimpleFormIterator>
                                    <TextInput source="name" label="버튼 이름 (예: STOVE / 작품 X)" />
                                    <TextInput source="url" label="주소" />
                                    <SelectInput 
                                        source="icon" 
                                        label="로고"
                                        choices={[
                                            { id: 'steam', name: 'Steam' },
                                            { id: 'stove', name: 'STOVE' },
                                            { id: 'epic', name: 'Epic Games' },
                                            { id: 'gog', name: 'GOG' },
                                            { id: 'itch', name: 'itch.io' },
                                            { id: 'other', name: 'Other' },
                                            { id: 'x', name: 'SNS: X (작품 계정)' },
                                            { id: 'youtube', name: 'SNS: YouTube' },
                                            { id: 'instagram', name: 'SNS: Instagram' },
                                        ]}
                                    />
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    if (sectionType === 'credits') {
                        return (
                            <ArrayInput source="credits" label="크레딧 (역할 · 이름)">
                                <SimpleFormIterator>
                                    <TextInput source="role" label="역할" />
                                    <TextInput source="name" label="이름" helperText="여러 명은 / 로 구분" />
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    if (sectionType === 'timeline') {
                        return (
                            <ArrayInput source="timeline_items" label="연혁 항목 (출시·전시·수상 위주)">
                                <SimpleFormIterator>
                                    <TextInput source="date" label="날짜 (예: 2024.04.11)" />
                                    <TextInput source="event_ko" label="Event (KO)" />
                                    <TextInput source="event_en" label="Event (EN)" />
                                    <TextInput source="event_ja" label="Event (JA)" />
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    return null;
                }}
            </FormDataConsumer>

            <NumberInput source="display_order" label="순서 (같은 종류끼리 작은 숫자가 앞)" defaultValue={0} />
            <BooleanInput source="is_visible" label="공개" defaultValue={true} />
        </SimpleForm>
    </Edit>
);
