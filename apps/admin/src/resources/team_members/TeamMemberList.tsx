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

/** 팀원 — 회의에서 팀원 소개를 보류해 새 사이트의 스튜디오 소개에는 나오지 않는다(데이터는 보존). */
export const TeamMemberList = () => (
  <List sort={{ field: 'display_order', order: 'ASC' }} title="팀원 (보류 — 새 사이트에 미노출)">
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
