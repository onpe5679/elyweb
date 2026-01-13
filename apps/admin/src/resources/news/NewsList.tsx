import { List, Datagrid, TextField, BooleanField, DateField, EditButton, DeleteButton } from 'react-admin';

export const NewsList = () => (
    <List sort={{ field: 'published_at', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="title_ko" label="Title" />
            <BooleanField source="is_published" />
            <DateField source="published_at" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);
