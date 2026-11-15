import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';

export const PressKitCreate = () => (
  <Create>
    <SimpleForm>
      <LocalizedInput source="title" label="제목" required />
      <LocalizedInput source="description" label="설명" multiline rows={3} />
      <TextInput source="file_url" label="자료 링크 (Google Drive 폴더 등)" fullWidth />
      <ReferenceInput source="game_id" reference="games" label="작품">
        <SelectInput optionText="title_ko" emptyText="(스튜디오 공통 자료)" helperText="비워 두면 프레스 페이지의 '스튜디오 자료', 작품을 고르면 그 작품 칸에 들어갑니다." />
      </ReferenceInput>
      <NumberInput source="display_order" label="순서" defaultValue={0} />
      <BooleanInput source="is_published" defaultValue={true} />
    </SimpleForm>
  </Create>
);
