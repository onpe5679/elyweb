import { Create, SimpleForm, BooleanInput, ImageInput, ImageField, TextInput } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { LocalizedInput } from '../../components/LocalizedInput';

const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
};

const SlugInput = () => {
    return (
        <TextInput 
            source="slug" 
            label="Slug (URL)" 
            fullWidth 
            helperText="Leave empty to auto-generate from title"
        />
    );
};

export const NewsCreate = () => (
    <Create
        transform={(data: Record<string, unknown>) => ({
            ...data,
            slug: data.slug || generateSlug((data.title_ko as string) || `news-${Date.now()}`),
            published_at: data.is_published ? new Date().toISOString() : null,
        })}
    >
        <SimpleForm>
            <SlugInput />
            <LocalizedInput source="title" label="Title" />
            
            <LocalizedInput 
                source="content" 
                label="Content" 
                component={RichTextInput}
            />

            <LocalizedInput source="excerpt" label="Excerpt" multiline rows={3} />
            
            <ImageInput source="cover_image" label="Cover Image" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>

            <BooleanInput source="is_published" />
        </SimpleForm>
    </Create>
);
