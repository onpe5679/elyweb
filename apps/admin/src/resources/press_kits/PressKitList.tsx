import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  EditButton,
  DeleteButton,
  ReferenceField,
} from 'react-admin';

/** 프레스 자료 — 작품을 비우면 '스튜디오 자료', 작품을 지정하면 프레스 페이지의 해당 작품 칸에 들어간다. */
export const PressKitList = () => (
  <List sort={{ field: 'display_order', order: 'ASC' }} title="프레스 자료">
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="title_ko" label="제목" />
      <ReferenceField source="game_id" reference="games" label="작품 (비면 스튜디오 공통)" emptyText="스튜디오 공통" link={false} />
      <TextField source="file_url" label="링크" />
      <NumberField source="display_order" label="순서" />
      <BooleanField source="is_published" label="공개" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
