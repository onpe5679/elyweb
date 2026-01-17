import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  ImageInput,
  ImageField,
} from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';

export const TeamMemberCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="slug" fullWidth helperText="URL identifier (e.g., 'john-doe')" required />
      <LocalizedInput source="name" label="Name" />
      <LocalizedInput source="role" label="Role / Position" />
      <LocalizedInput source="bio" label="Bio" multiline rows={4} />

      <ImageInput
        source="profile_image"
        label="Profile Image"
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
      >
        <ImageField source="src" title="title" />
      </ImageInput>

      <TextInput source="twitter_url" fullWidth label="Twitter URL" />
      <TextInput source="instagram_url" fullWidth label="Instagram URL" />
      <TextInput source="website_url" fullWidth label="Website URL" />

      <BooleanInput source="is_active" defaultValue={true} label="Active" />
      <NumberInput source="display_order" defaultValue={0} label="Display Order" />
    </SimpleForm>
  </Create>
);
