import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  SelectField,
  ShowButton,
  EditButton,
} from 'react-admin';

const statusChoices = [
  { id: 'new', name: 'New' },
  { id: 'read', name: 'Read' },
  { id: 'replied', name: 'Replied' },
  { id: 'archived', name: 'Archived' },
];

export const ContactSubmissionList = () => (
  <List sort={{ field: 'created_at', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <EmailField source="email" />
      <SelectField source="status" choices={statusChoices} />
      <DateField source="created_at" showTime />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);
