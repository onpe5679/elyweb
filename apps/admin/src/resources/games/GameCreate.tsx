import { Create, SimpleForm, TextInput, SelectInput, ArrayInput, SimpleFormIterator, BooleanInput, NumberInput, ImageInput, ImageField } from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';

export const GameCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="slug" fullWidth />
            <LocalizedInput source="title" label="Title" />
            
            <SelectInput source="status" choices={[
                { id: 'released', name: 'Released' },
                { id: 'coming_soon', name: 'Coming Soon' },
                { id: 'in_development', name: 'In Development' },
                { id: 'publishing', name: 'Publishing' },
            ]} />
            
            <ArrayInput source="genre">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>

            <ArrayInput source="platforms">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>

            <LocalizedInput source="description" label="Description" multiline rows={4} />
            <LocalizedInput source="synopsis" label="Synopsis" multiline rows={2} />

            <ImageInput source="cover_image" label="Cover Image" accept="image/*">
                <ImageField source="src" title="title" />
            </ImageInput>

            <ImageInput source="banner_image" label="Banner Image" accept="image/*">
                <ImageField source="src" title="title" />
            </ImageInput>

            <ArrayInput source="gallery_images">
                <SimpleFormIterator>
                    <ImageInput source="image" label="Image" accept="image/*">
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </SimpleFormIterator>
            </ArrayInput>

            <TextInput source="steam_url" fullWidth />
            <TextInput source="trailer_url" fullWidth />
            
            <BooleanInput source="is_featured" />
            <NumberInput source="display_order" />
        </SimpleForm>
    </Create>
);
