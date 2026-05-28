import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  ImageInput,
  ImageField,
  useRecordContext,
  Labeled,
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';

const WEB_URL = (import.meta as any).env?.VITE_WEB_API_URL || 'http://localhost:3000';

const IMAGE_SETTING_KEYS = ['hero_image', 'about_image', 'vision_image', 'logo_image', 'logo_icon', 'favicon'];

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

const SettingValueInputs = () => {
  const record = useRecordContext();
  const isImageSetting = record && IMAGE_SETTING_KEYS.includes(record.key);

  if (record?.key === 'news_display_mode') {
    return (
      <Box>
        <SelectInput
          source="value_ko"
          label="새소식 표시 모드"
          choices={[
            { id: 'manual', name: '직접 작성만 (manual)' },
            { id: 'widget', name: 'X 위젯만 (widget)' },
            { id: 'both', name: '둘 다 (both)' },
          ]}
        />
        <Typography variant="caption" color="text.secondary">
          widget = X 타임라인만, manual = 직접 작성 글만, both = 둘 다 표시
        </Typography>
      </Box>
    );
  }

  if (isImageSetting) {
    return (
      <Box>
        <ImageInput
          source="value_ko"
          label="Image"
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] }}
          format={formatImageForDisplay}
          parse={parseImageForStorage}
        >
          <ImageField source="src" title="title" sx={{ '& img': { maxHeight: 300 } }} />
        </ImageInput>
        <Typography variant="caption" color="text.secondary">
          Upload an image. The same image will be used for all languages.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Labeled label="Korean">
        <TextInput source="value_ko" label={false} multiline fullWidth rows={4} />
      </Labeled>
      <Divider sx={{ my: 2 }} />
      <Labeled label="English">
        <TextInput source="value_en" label={false} multiline fullWidth rows={4} />
      </Labeled>
      <Divider sx={{ my: 2 }} />
      <Labeled label="Japanese">
        <TextInput source="value_ja" label={false} multiline fullWidth rows={4} />
      </Labeled>
    </Box>
  );
};

export const SettingsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="key" label="Setting Key" disabled fullWidth />
      <Divider sx={{ my: 2, width: '100%' }} />
      <SettingValueInputs />
    </SimpleForm>
  </Edit>
);
