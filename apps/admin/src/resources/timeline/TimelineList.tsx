import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  EditButton,
  DeleteButton,
} from 'react-admin';

/** 스튜디오 연혁 — 웹: 스튜디오 소개(최신순), '메인 표시' 항목은 메인 "주요 연혁"(최신순). */
export const TimelineList = () => (
  <List sort={{ field: 'display_order', order: 'DESC' }} perPage={50} title="스튜디오 연혁 (웹에서는 최신순으로 표시)">
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="date_label" label="날짜" />
      <TextField source="title_ko" label="내용 (KO)" />
      <BooleanField source="show_on_home" label="메인 표시" />
      <BooleanField source="is_active" label="공개" />
      <NumberField source="display_order" label="순서" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
