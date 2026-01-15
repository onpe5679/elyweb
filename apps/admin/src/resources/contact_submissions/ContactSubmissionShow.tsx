import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  RichTextField,
} from 'react-admin';

export const ContactSubmissionShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="status" />
      <RichTextField source="message" />
      <TextField source="admin_notes" />
      <DateField source="created_at" showTime />
      <DateField source="updated_at" showTime />
    </SimpleShowLayout>
  </Show>
);
