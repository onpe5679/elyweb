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
import { LocalizedInput } from '../../components/LocalizedInput';

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

const sectionTypeChoices = [
    { id: 'text', name: 'Text' },
    { id: 'gallery', name: 'Gallery' },
    { id: 'video', name: 'Video' },
    { id: 'store', name: 'Store Links' },
    { id: 'credits', name: 'Credits' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'custom', name: 'Custom' },
];

const SectionTitle = () => {
    const record = useRecordContext();
    if (!record) return <span>Section</span>;
    return <span>Section: {record.title_ko || record.title_en || record.section_type}</span>;
};

export const GameSectionEdit = () => (
    <Edit title={<SectionTitle />}>
        <SimpleForm>
            <ReferenceInput source="game_id" reference="games">
                <SelectInput optionText="title_ko" label="Game" fullWidth />
            </ReferenceInput>

            <SelectInput source="section_type" choices={sectionTypeChoices} fullWidth />

            <LocalizedInput source="title" label="Section Title" />

            <FormDataConsumer>
                {({ formData }) => {
                    const sectionType = formData?.section_type;

                    if (sectionType === 'text' || sectionType === 'custom') {
                        return (
                            <LocalizedInput 
                                source="content" 
                                label="Content" 
                                multiline 
                                rows={6} 
                            />
                        );
                    }

                    if (sectionType === 'gallery') {
                        return (
                            <ArrayInput source="images" label="Images">
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
                                label="Video URL (YouTube embed URL)" 
                                fullWidth 
                                helperText="Enter YouTube embed URL like: https://www.youtube.com/embed/VIDEO_ID"
                            />
                        );
                    }

                    if (sectionType === 'store') {
                        return (
                            <ArrayInput source="store_links" label="Store Links">
                                <SimpleFormIterator>
                                    <TextInput source="name" label="Store Name" />
                                    <TextInput source="url" label="Store URL" />
                                    <SelectInput 
                                        source="icon" 
                                        label="Icon"
                                        choices={[
                                            { id: 'steam', name: 'Steam' },
                                            { id: 'stove', name: 'STOVE' },
                                            { id: 'epic', name: 'Epic Games' },
                                            { id: 'gog', name: 'GOG' },
                                            { id: 'itch', name: 'itch.io' },
                                            { id: 'other', name: 'Other' },
                                        ]}
                                    />
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    if (sectionType === 'credits') {
                        return (
                            <ArrayInput source="credits" label="Credits">
                                <SimpleFormIterator>
                                    <TextInput source="role" label="Role" />
                                    <TextInput source="name" label="Name(s)" helperText="For multiple names, separate with /" />
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    if (sectionType === 'timeline') {
                        return (
                            <ArrayInput source="timeline_items" label="Timeline Events">
                                <SimpleFormIterator>
                                    <TextInput source="date" label="Date" />
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

            <NumberInput source="display_order" label="Display Order" defaultValue={0} />
            <BooleanInput source="is_visible" label="Visible" defaultValue={true} />
        </SimpleForm>
    </Edit>
);
