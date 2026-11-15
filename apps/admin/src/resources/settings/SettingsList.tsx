import {
  List,
  Datagrid,
  TextField,
  EditButton,
  FunctionField,
} from 'react-admin';
import { Chip } from '@mui/material';
import { SETTING_GROUPS, settingInfo } from '../../siteMap';

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

const GroupField = () => (
  <FunctionField
    label="분류"
    render={(r: { key: string }) => {
      const info = settingInfo(r.key);
      return <Chip size="small" label={SETTING_GROUPS[info.group]} variant={info.unused ? 'outlined' : 'filled'} color={info.unused ? 'default' : 'primary'} />;
    }}
  />
);

const WhereField = () => (
  <FunctionField
    label="웹에서 보이는 곳"
    render={(r: { key: string }) => {
      const info = settingInfo(r.key);
      return <span style={{ color: info.unused ? '#999' : undefined, fontSize: 13 }}>{info.unused ? `사용 안 함 — ${info.where}` : info.where}</span>;
    }}
  />
);

/** 사이트 설정 — 키마다 새 사이트에서 쓰이는 곳을 함께 보여 준다. 쓰지 않는 키는 회색. */
export const SettingsList = () => (
  <List perPage={50} sort={{ field: 'key', order: 'ASC' }} title="사이트 설정">
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <GroupField />
      <TextField source="key" label="키" />
      <WhereField />
      <ValueField source="value_ko" />
      <EditButton />
    </Datagrid>
  </List>
);
