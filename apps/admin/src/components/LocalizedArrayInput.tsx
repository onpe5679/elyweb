import { useState } from 'react';
import { ArrayInput, SimpleFormIterator, TextInput } from 'react-admin';
import { Box, Tabs, Tab } from '@mui/material';

interface LocalizedArrayInputProps {
    source: string;
    label: string;
}

export const LocalizedArrayInput = ({ source, label }: LocalizedArrayInputProps) => {
    const [locale, setLocale] = useState('ko');

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        setLocale(newValue);
    };

    return (
        <Box sx={{ width: '100%', mb: 2, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
            <Tabs value={locale} onChange={handleChange} indicatorColor="primary" textColor="primary">
                <Tab label="한국어" value="ko" />
                <Tab label="English" value="en" />
                <Tab label="日本語" value="ja" />
            </Tabs>
            
            {['ko', 'en', 'ja'].map((lang) => (
                <div key={lang} role="tabpanel" hidden={locale !== lang}>
                    {locale === lang && (
                        <Box sx={{ mt: 2 }}>
                            <ArrayInput source={`${source}_${lang}`} label={`${label} (${lang.toUpperCase()})`}>
                                <SimpleFormIterator>
                                    <TextInput source="" label={false} fullWidth />
                                </SimpleFormIterator>
                            </ArrayInput>
                        </Box>
                    )}
                </div>
            ))}
        </Box>
    );
};
