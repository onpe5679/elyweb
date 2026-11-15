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

/** 이전 문의 폼 기록 — 새 사이트의 문의 페이지는 입력 폼 없이 대표 메일만 보여 준다. */
export const ContactSubmissionList = () => (
  <List sort={{ field: 'created_at', order: 'DESC' }} title="이전 문의 폼 기록 (새 사이트는 메일 문의)">
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
