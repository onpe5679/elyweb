import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  EditButton,
  DeleteButton,
} from 'react-admin';

export const TimelineList = () => (
  <List sort={{ field: 'display_order', order: 'DESC' }}>
    <Datagrid>
      <TextField source="date_label" label="Date" />
      <TextField source="title_ko" label="Title (KO)" />
      <TextField source="icon" label="Icon" />
      <BooleanField source="is_active" label="Active" />
      <NumberField source="display_order" label="Order" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
