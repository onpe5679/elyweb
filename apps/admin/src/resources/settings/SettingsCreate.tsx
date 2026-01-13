import {
  Create,
  SimpleForm,
  TextInput,
} from 'react-admin';

export const SettingsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="key" label="Setting Key" fullWidth required />
      <TextInput source="value_ko" label="Value (Korean)" multiline fullWidth rows={4} />
      <TextInput source="value_en" label="Value (English)" multiline fullWidth rows={4} />
      <TextInput source="value_ja" label="Value (Japanese)" multiline fullWidth rows={4} />
    </SimpleForm>
  </Create>
);
