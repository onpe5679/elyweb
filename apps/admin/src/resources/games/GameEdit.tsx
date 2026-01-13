import { Edit, SimpleForm, TextInput, SelectInput, ArrayInput, SimpleFormIterator, BooleanInput, NumberInput, ImageInput, ImageField } from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';
import { LocalizedArrayInput } from '../../components/LocalizedArrayInput';

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

export const GameEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="slug" fullWidth />
            <LocalizedInput source="title" label="Title" />
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

            <LocalizedInput source="description" label="Description" multiline rows={4} />
            <LocalizedInput source="synopsis" label="Synopsis" multiline rows={2} />

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
                source="banner_image" 
                label="Banner Image" 
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                format={formatImageForDisplay}
                parse={parseImageForStorage}
            >
                <ImageField source="src" title="title" />
            </ImageInput>

            <ArrayInput source="gallery_images">
                <SimpleFormIterator>
                    <ImageInput source="image" label="Image" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </SimpleFormIterator>
            </ArrayInput>

            <TextInput source="steam_url" fullWidth />
            <TextInput source="trailer_url" fullWidth />
            
            <BooleanInput source="is_featured" />
            <NumberInput source="display_order" />
        </SimpleForm>
    </Edit>
);
