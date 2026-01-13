import { List, Datagrid, TextField, BooleanField, DateField, EditButton, DeleteButton } from 'react-admin';

export const NewsList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="title_en" label="Title" />
            <BooleanField source="is_published" />
            <DateField source="published_at" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);
