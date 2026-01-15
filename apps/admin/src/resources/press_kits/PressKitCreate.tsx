import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';

export const PressKitCreate = () => (
  <Create>
    <SimpleForm>
      <LocalizedInput source="title" label="Title" required />
      <LocalizedInput source="description" label="Description" multiline rows={3} />
      <TextInput source="file_url" label="File URL (Download Link)" fullWidth />
      <ReferenceInput source="game_id" reference="games" label="Related Game">
        <SelectInput optionText="title_ko" />
      </ReferenceInput>
      <NumberInput source="display_order" label="Display Order" defaultValue={0} />
      <BooleanInput source="is_published" defaultValue={true} />
    </SimpleForm>
  </Create>
);
