import { 
    Create, 
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
    FormDataConsumer,
} from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';

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

const sectionTypeChoices = [
    { id: 'text', name: 'Text' },
    { id: 'gallery', name: 'Gallery' },
    { id: 'video', name: 'Video' },
    { id: 'links', name: 'Links' },
    { id: 'projects', name: 'Projects' },
    { id: 'skills', name: 'Skills' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'custom', name: 'Custom' },
];

export const TeamMemberSectionCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput source="team_member_id" reference="team_members">
                <SelectInput optionText="name_ko" label="Team Member" fullWidth />
            </ReferenceInput>

            <SelectInput source="section_type" choices={sectionTypeChoices} fullWidth defaultValue="text" />

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
                                helperText="https://www.youtube.com/embed/VIDEO_ID"
                            />
                        );
                    }

                    if (sectionType === 'links') {
                        return (
                            <ArrayInput source="links" label="Links">
                                <SimpleFormIterator>
                                    <TextInput source="name" label="Link Name" />
                                    <TextInput source="url" label="URL" />
                                    <SelectInput 
                                        source="icon" 
                                        label="Icon"
                                        choices={[
                                            { id: 'portfolio', name: 'Portfolio' },
                                            { id: 'github', name: 'GitHub' },
                                            { id: 'linkedin', name: 'LinkedIn' },
                                            { id: 'twitter', name: 'Twitter' },
                                            { id: 'artstation', name: 'ArtStation' },
                                            { id: 'behance', name: 'Behance' },
                                            { id: 'other', name: 'Other' },
                                        ]}
                                    />
                                </SimpleFormIterator>
                            </ArrayInput>
                        );
                    }

                    if (sectionType === 'projects') {
                        return (
                            <ArrayInput source="projects" label="Projects">
                                <SimpleFormIterator>
                                    <TextInput source="title_ko" label="Title (KO)" />
                                    <TextInput source="title_en" label="Title (EN)" />
                                    <TextInput source="description_ko" label="Description (KO)" multiline />
                                    <TextInput source="description_en" label="Description (EN)" multiline />
                                    <TextInput source="url" label="Project URL" />
                                    <ImageInput 
                                        source="image" 
                                        label="Project Image"
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

                    if (sectionType === 'skills') {
                        return (
                            <ArrayInput source="skills" label="Skills">
                                <SimpleFormIterator>
                                    <TextInput source="name_ko" label="Skill (KO)" />
                                    <TextInput source="name_en" label="Skill (EN)" />
                                    <NumberInput source="level" label="Level (1-5)" min={1} max={5} />
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
    </Create>
);
