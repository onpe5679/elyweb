import {
  Edit,
  SimpleForm,
  TextField,
  SelectInput,
  TextInput,
} from 'react-admin';

const statusChoices = [
  { id: 'new', name: 'New' },
  { id: 'read', name: 'Read' },
  { id: 'replied', name: 'Replied' },
  { id: 'archived', name: 'Archived' },
];

export const ContactSubmissionEdit = () => (
  <Edit>
    <SimpleForm>
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="message" sx={{ whiteSpace: 'pre-wrap' }} />
      <SelectInput source="status" choices={statusChoices} />
      <TextInput source="admin_notes" multiline rows={4} fullWidth />
    </SimpleForm>
  </Edit>
);
