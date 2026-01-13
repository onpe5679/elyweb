import {
  Create,
  TabbedForm,
  FormTab,
  TextInput,
  BooleanInput,
  NumberInput,
  SelectInput,
} from 'react-admin';

const iconChoices = [
  { id: 'rocket', name: 'Rocket' },
  { id: 'trophy', name: 'Trophy' },
  { id: 'flag', name: 'Flag' },
  { id: 'star', name: 'Star' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'check', name: 'Check' },
];

export const TimelineCreate = () => (
  <Create>
    <TabbedForm>
      <FormTab label="General">
        <TextInput source="date_label" label="Date Label" required fullWidth />
        <SelectInput source="icon" choices={iconChoices} label="Icon" defaultValue="flag" />
        <BooleanInput source="is_active" label="Active" defaultValue={true} />
        <NumberInput source="display_order" label="Display Order" defaultValue={0} />
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
  </Create>
);
