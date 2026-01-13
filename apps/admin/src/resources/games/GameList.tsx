import { List, Datagrid, TextField, ChipField, BooleanField, NumberField, EditButton, DeleteButton } from 'react-admin';

export const GameList = () => (
    <List sort={{ field: 'display_order', order: 'ASC' }}>
        <Datagrid rowClick="edit">
            <NumberField source="display_order" label="Order" />
            <TextField source="title_en" label="Title" />
            <ChipField source="status" />
            <BooleanField source="is_featured" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);
