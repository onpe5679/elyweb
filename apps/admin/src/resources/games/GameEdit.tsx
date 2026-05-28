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
    BooleanField
} from 'react-admin';
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
            + Add Section
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
                        Game Sections
                    </h3>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
                        Add custom sections: Info, Synopsis, Gallery, Video, Store, Credits, Timeline, etc.
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
                    <ChipField source="section_type" label="Type" />
                    <TextField source="title_ko" label="Title (KO)" />
                    <TextField source="title_en" label="Title (EN)" />
                    <BooleanField source="is_visible" label="Visible" />
                    <EditButton />
                    <DeleteButton redirect={false} mutationMode="pessimistic" />
                </Datagrid>
            </ReferenceManyField>
        </div>
    );
};

export const GameEdit = () => (
    <Edit>
        <SimpleForm>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Basic Info</h3>
            
            <TextInput source="slug" fullWidth />
            <LocalizedInput source="title" label="Title" />
            <LocalizedInput source="description" label="Description" multiline />
            <LocalizedInput source="series" label="Series" />
            
            <SelectInput source="status" choices={[
                { id: 'released', name: 'Released' },
                { id: 'coming_soon', name: 'Coming Soon' },
                { id: 'in_development', name: 'In Development' },
                { id: 'publishing', name: 'Publishing' },
            ]} />
            
            <LocalizedArrayInput source="genre" label="Genre" />

            <ArrayInput source="platforms">
                <SimpleFormIterator>
                    <TextInput source="" label={false} />
                </SimpleFormIterator>
            </ArrayInput>

            <SectionDivider title="Images" />

            <ImageInput
                source="cover_image"
                label="Cover Image"
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                format={formatImageForDisplay}
                parse={parseImageForStorage}
            >
                <ImageField source="src" title="title" />
            </ImageInput>

            <ImageInput
                source="thumbnail_image"
                label="Thumbnail (list card)"
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                format={formatImageForDisplay}
                parse={parseImageForStorage}
            >
                <ImageField source="src" title="title" />
            </ImageInput>

            <ImageInput
                source="banner_image"
                label="Banner Image" 
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                format={formatImageForDisplay}
                parse={parseImageForStorage}
            >
                <ImageField source="src" title="title" />
            </ImageInput>

            <SectionDivider title="Links & Settings" />

            <TextInput source="steam_url" fullWidth label="Steam URL" />
            <TextInput source="trailer_url" fullWidth label="Trailer URL" />
            <TextInput source="official_url" fullWidth label="Official Website" />
            
            <BooleanInput source="is_featured" />
            <NumberInput source="display_order" />

            <GameSectionsPanel />
        </SimpleForm>
    </Edit>
);
