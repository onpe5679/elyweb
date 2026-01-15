import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  EditButton,
  DeleteButton,
} from 'react-admin';

export const PressKitList = () => (
  <List sort={{ field: 'display_order', order: 'ASC' }}>
    <Datagrid rowClick="edit">
      <TextField source="title_ko" label="Title" />
      <TextField source="file_url" label="File URL" />
      <NumberField source="display_order" label="Order" />
      <BooleanField source="is_published" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
