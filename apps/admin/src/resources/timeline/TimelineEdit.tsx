import {
  Edit,
  TextInput,
  BooleanInput,
  NumberInput,
  SelectInput,
  TabbedForm,
  FormTab,
} from 'react-admin';

const iconChoices = [
  { id: 'rocket', name: 'Rocket' },
  { id: 'trophy', name: 'Trophy' },
  { id: 'flag', name: 'Flag' },
  { id: 'star', name: 'Star' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'check', name: 'Check' },
];

export const TimelineEdit = () => (
  <Edit>
    <TabbedForm>
      <FormTab label="General">
        <TextInput source="date_label" label="Date Label" required fullWidth />
        <SelectInput source="icon" choices={iconChoices} label="Icon" />
        <BooleanInput source="is_active" label="Active" />
        <BooleanInput source="show_on_home" label="메인 '주요 연혁'에 표시" helperText="웹 메인에는 체크한 항목이 최신순으로 나옵니다(3개 권장)." />
        <NumberInput source="display_order" label="Display Order" />
      </FormTab>
      <FormTab label="Korean">
        <TextInput source="title_ko" label="Title (Korean)" required fullWidth />
        <TextInput source="description_ko" label="Description (Korean)" multiline fullWidth />
      </FormTab>
      <FormTab label="English">
        <TextInput source="title_en" label="Title (English)" fullWidth />
        <TextInput source="description_en" label="Description (English)" multiline fullWidth />
      </FormTab>
      <FormTab label="Japanese">
        <TextInput source="title_ja" label="Title (Japanese)" fullWidth />
        <TextInput source="description_ja" label="Description (Japanese)" multiline fullWidth />
      </FormTab>
    </TabbedForm>
  </Edit>
);
