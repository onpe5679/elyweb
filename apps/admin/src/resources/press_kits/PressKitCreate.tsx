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
        <SelectInput label="작품" optionText="title_ko" emptyText="(스튜디오 공통 자료)" helperText="비워 두면 프레스 페이지의 '스튜디오 자료'. 작품을 고르면 그 작품 줄에 버튼으로 들어가고, 버튼 이름은 제목(예: EN, KR)입니다. STORE PAGE 버튼은 자동으로 맨 뒤에 붙습니다." />
      </ReferenceInput>
      <NumberInput source="display_order" label="순서" defaultValue={0} helperText="작은 숫자가 앞(작품별 버튼 순서: EN → KR …)" />
      <BooleanInput source="is_published" label="공개" defaultValue={true} />
    </SimpleForm>
  </Create>
);
