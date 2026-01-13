import {
  List,
  Datagrid,
  TextField,
  EditButton,
} from 'react-admin';

export const SettingsList = () => (
  <List>
    <Datagrid>
      <TextField source="key" label="Setting Key" />
      <TextField source="value_ko" label="Value (KO)" />
      <TextField source="value_en" label="Value (EN)" />
      <EditButton />
    </Datagrid>
  </List>
);
