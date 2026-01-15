import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  PasswordInput,
  SaveButton,
  Toolbar,
  DeleteButton,
} from 'react-admin';
import { Box, Typography, Alert } from '@mui/material';

export const AuthUserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="email" label="Email" />
      <DateField source="created_at" label="Created" showTime />
      <DateField source="last_sign_in_at" label="Last Sign In" showTime />
      <EditButton />
    </Datagrid>
  </List>
);

const UserEditToolbar = () => (
  <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <SaveButton />
    <DeleteButton />
  </Toolbar>
);

export const AuthUserEdit = () => (
    <Edit mutationMode="pessimistic">
      <SimpleForm toolbar={<UserEditToolbar />}>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            비밀번호를 변경하려면 새 비밀번호를 입력하세요. 비워두면 변경되지 않습니다.
          </Alert>
        </Box>
        <TextInput source="email" label="Email" fullWidth />
        <PasswordInput source="password" label="New Password" fullWidth helperText="Leave empty to keep current password" />
        <DateField source="created_at" label="Created" showTime />
        <DateField source="last_sign_in_at" label="Last Sign In" showTime />
      </SimpleForm>
    </Edit>
);

export const AuthUserCreate = () => (
  <Create>
    <SimpleForm>
      <Typography variant="h6" sx={{ mb: 2 }}>Create New Admin User</Typography>
      <TextInput source="email" label="Email" fullWidth required />
      <PasswordInput source="password" label="Password" fullWidth required />
    </SimpleForm>
  </Create>
);
