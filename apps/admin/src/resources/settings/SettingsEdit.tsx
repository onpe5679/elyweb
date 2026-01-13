import {
  Edit,
  TabbedForm,
  FormTab,
  TextInput,
} from 'react-admin';

export const SettingsEdit = () => (
  <Edit>
    <TabbedForm>
      <FormTab label="General">
        <TextInput source="key" label="Setting Key" disabled fullWidth />
      </FormTab>
      <FormTab label="Korean">
        <TextInput source="value_ko" label="Value (Korean)" multiline fullWidth rows={4} />
      </FormTab>
      <FormTab label="English">
        <TextInput source="value_en" label="Value (English)" multiline fullWidth rows={4} />
      </FormTab>
      <FormTab label="Japanese">
        <TextInput source="value_ja" label="Value (Japanese)" multiline fullWidth rows={4} />
      </FormTab>
    </TabbedForm>
  </Edit>
);
