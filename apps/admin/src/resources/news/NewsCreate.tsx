import { Create, SimpleForm, BooleanInput, ImageInput, ImageField } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';
import { LocalizedInput } from '../../components/LocalizedInput';

export const NewsCreate = () => (
    <Create>
        <SimpleForm>
            <LocalizedInput source="title" label="Title" />
            
            <LocalizedInput 
                source="content" 
                label="Content" 
                component={RichTextInput}
            />

            <LocalizedInput source="excerpt" label="Excerpt" multiline rows={3} />
            
            <ImageInput source="cover_image" label="Cover Image" accept="image/*">
                <ImageField source="src" title="title" />
            </ImageInput>

            <BooleanInput source="is_published" />
        </SimpleForm>
    </Create>
);
