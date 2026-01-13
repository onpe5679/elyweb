import { List, Datagrid, TextField, ChipField, BooleanField, EditButton, DeleteButton } from 'react-admin';

export const GameList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="title_en" label="Title" />
            <ChipField source="status" />
            <BooleanField source="is_featured" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);
