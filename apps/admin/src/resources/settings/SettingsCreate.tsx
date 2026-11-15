import {
  Create,
  SimpleForm,
  TextInput,
} from 'react-admin';

export const SettingsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="key" label="키" fullWidth required helperText="새 사이트가 읽는 키만 효과가 있습니다(대시보드·설정 목록의 '웹에서 보이는 곳' 참고)." />
      <TextInput source="value_ko" label="Value (Korean)" multiline fullWidth rows={4} />
      <TextInput source="value_en" label="Value (English)" multiline fullWidth rows={4} />
      <TextInput source="value_ja" label="Value (Japanese)" multiline fullWidth rows={4} />
    </SimpleForm>
  </Create>
);
