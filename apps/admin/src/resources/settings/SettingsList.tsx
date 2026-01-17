import {
  List,
  Datagrid,
  TextField,
  EditButton,
  FunctionField,
} from 'react-admin';

const WEB_URL = (import.meta as any).env?.VITE_WEB_API_URL || 'http://localhost:3000';

const IMAGE_SETTING_KEYS = ['hero_image', 'about_image', 'vision_image', 'logo_image', 'favicon'];
const ICON_SETTING_KEYS = ['logo_icon'];

const ValueField = ({ source }: { source: string }) => (
  <FunctionField
    source={source}
    render={(record: { key: string; value_ko?: string | object }) => {
      const rawValue = record.value_ko;
      if (!rawValue) return '-';
      
      const value = typeof rawValue === 'string' ? rawValue : (rawValue as { src?: string }).src || '';
      if (!value) return '-';
      
      const isImage = IMAGE_SETTING_KEYS.includes(record.key);
      if (isImage && value) {
        const fullUrl = typeof value === 'string' && value.startsWith('/') ? `${WEB_URL}${value}` : value;
        return (
          <img 
            src={fullUrl} 
            alt="preview" 
            style={{ height: '40px', width: '60px', objectFit: 'cover', borderRadius: '4px' }} 
          />
        );
      }
      
      const isIcon = ICON_SETTING_KEYS.includes(record.key);
      if (isIcon && value) {
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={value} style={{ fontSize: '20px' }}></i>
            <code style={{ fontSize: '12px', color: '#666' }}>{value}</code>
          </span>
        );
      }
      
      const truncated = value.length > 50 ? `${value.substring(0, 50)}...` : value;
      return truncated;
    }}
  />
);

export const SettingsList = () => (
  <List>
    <Datagrid>
      <TextField source="key" label="Setting Key" />
      <ValueField source="value_ko" />
      <EditButton />
    </Datagrid>
  </List>
);
