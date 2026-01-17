import { Edit, SimpleForm, BooleanInput, DateInput, ImageInput, ImageField } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
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

export const NewsEdit = () => (
    <Edit>
        <SimpleForm>
            <LocalizedInput source="title" label="Title" />
            
            <LocalizedInput 
                source="content" 
                label="Content" 
                component={RichTextInput}
            />

            <LocalizedInput source="excerpt" label="Excerpt" multiline rows={3} />
            
            <ImageInput 
                source="cover_image" 
                label="Cover Image" 
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                format={formatImageForDisplay}
                parse={parseImageForStorage}
            >
                <ImageField source="src" title="title" sx={{ '& img': { maxHeight: 200 } }} />
            </ImageInput>

            <BooleanInput source="is_published" />
            <DateInput source="published_at" label="Published Date" />
        </SimpleForm>
    </Edit>
);
