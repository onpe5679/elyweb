import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  ImageInput,
  ImageField,
  ReferenceManyField,
  Datagrid,
  TextField,
  NumberField,
  ChipField,
  BooleanField,
  EditButton,
  DeleteButton,
  useRecordContext,
} from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';

const WEB_URL = (import.meta as any).env?.VITE_WEB_API_URL || 'http://localhost:3000';

type ImageValue = string | { src: string; rawFile?: File } | null | undefined;

const formatImageForDisplay = (value: ImageValue): { src: string; title: string } | undefined => {
  if (!value) return undefined;
  if (typeof value === 'object') return value as { src: string; title: string };
  const fullUrl = value.startsWith('/') ? `${WEB_URL}${value}` : value;
  return { src: fullUrl, title: value };
};

const parseImageForStorage = (value: File | { src: string; rawFile?: File } | string | null | undefined): ImageValue => {
  if (!value) return null;
  if (value instanceof File) {
    return { rawFile: value, src: URL.createObjectURL(value) };
  }
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'rawFile' in value) return value;
  if (typeof value === 'object' && 'src' in value) return value.src;
  return null;
};

const SectionDivider = ({ title }: { title: string }) => (
  <div style={{ marginTop: '32px', marginBottom: '16px', width: '100%' }}>
    <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '16px' }} />
    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>{title}</h3>
  </div>
);

export const TeamMemberEdit = () => (
  <Edit>
    <SimpleForm>
      <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Basic Info</h3>
      
      <TextInput source="slug" fullWidth helperText="URL identifier (e.g., 'john-doe')" />
      <LocalizedInput source="name" label="Name" />
      <LocalizedInput source="role" label="Role / Position" />
      <LocalizedInput source="bio" label="Bio" multiline rows={4} />

      <SectionDivider title="Profile Image" />

      <ImageInput
        source="profile_image"
        label="Profile Image"
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
        format={formatImageForDisplay}
        parse={parseImageForStorage}
      >
        <ImageField source="src" title="title" sx={{ '& img': { maxHeight: 200, borderRadius: '8px' } }} />
      </ImageInput>

      <SectionDivider title="Social Links" />

      <TextInput source="twitter_url" fullWidth label="Twitter URL" />
      <TextInput source="instagram_url" fullWidth label="Instagram URL" />
      <TextInput source="website_url" fullWidth label="Website URL" />

      <SectionDivider title="Display Settings" />

      <BooleanInput source="is_active" label="Active (visible on website)" />
      <NumberInput source="display_order" label="Display Order" />

      <TeamMemberSectionsPanel />
    </SimpleForm>
  </Edit>
);

const AddSectionButton = () => {
  const record = useRecordContext();
  if (!record) return null;
  const url = `#/team_member_sections/create?source=${encodeURIComponent(JSON.stringify({ team_member_id: record.id }))}`;
  return (
    <a href={url} style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#1976d2',
      color: 'white',
      borderRadius: '4px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 500
    }}>
      + Add Section
    </a>
  );
};

const TeamMemberSectionsPanel = () => {
  return (
    <div style={{ marginTop: '32px', width: '100%' }}>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', marginBottom: '24px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
            Profile Sections
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
            Add custom sections: Text, Gallery, Video, Links, Projects, Skills, Timeline, etc.
          </p>
        </div>
        <AddSectionButton />
      </div>
      <ReferenceManyField
        reference="team_member_sections"
        target="team_member_id"
        sort={{ field: 'display_order', order: 'ASC' }}
      >
        <Datagrid bulkActionButtons={false}>
          <NumberField source="display_order" label="Order" />
          <ChipField source="section_type" label="Type" />
          <TextField source="title_ko" label="Title (KO)" />
          <TextField source="title_en" label="Title (EN)" />
          <BooleanField source="is_visible" label="Visible" />
          <EditButton />
          <DeleteButton redirect={false} mutationMode="pessimistic" />
        </Datagrid>
      </ReferenceManyField>
    </div>
  );
};
