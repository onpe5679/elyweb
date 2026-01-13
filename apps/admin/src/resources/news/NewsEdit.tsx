import { Edit, SimpleForm, BooleanInput, DateInput, ImageInput, ImageField } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { LocalizedInput } from '../../components/LocalizedInput';

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
            
            <ImageInput source="cover_image" label="Cover Image" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>

            <BooleanInput source="is_published" />
            <DateInput source="published_at" label="Published Date" />
        </SimpleForm>
    </Edit>
);
