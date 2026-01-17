import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  EditButton,
  DeleteButton,
  ImageField,
} from 'react-admin';

const ProfileImageField = ({ source }: { source: string }) => {
  return (
    <ImageField 
      source={source} 
      sx={{ 
        '& img': { 
          width: 50, 
          height: 50, 
          objectFit: 'cover', 
          borderRadius: '50%' 
        } 
      }}
      emptyText="-"
    />
  );
};

export const TeamMemberList = () => (
  <List sort={{ field: 'display_order', order: 'ASC' }}>
    <Datagrid rowClick="edit">
      <ProfileImageField source="profile_image" />
      <TextField source="name_ko" label="Name (KO)" />
      <TextField source="name_en" label="Name (EN)" />
      <TextField source="role_ko" label="Role (KO)" />
      <TextField source="slug" label="Slug" />
      <NumberField source="display_order" label="Order" />
      <BooleanField source="is_active" label="Active" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
