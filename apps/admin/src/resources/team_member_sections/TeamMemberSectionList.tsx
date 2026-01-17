import { 
    List, 
    Datagrid, 
    TextField, 
    NumberField, 
    BooleanField, 
    ReferenceField,
    ChipField,
    EditButton, 
    DeleteButton 
} from 'react-admin';

export const TeamMemberSectionList = () => (
    <List sort={{ field: 'display_order', order: 'ASC' }}>
        <Datagrid>
            <ReferenceField source="team_member_id" reference="team_members" link="edit">
                <TextField source="name_ko" />
            </ReferenceField>
            <ChipField source="section_type" />
            <TextField source="title_ko" label="Title (KO)" />
            <TextField source="title_en" label="Title (EN)" />
            <NumberField source="display_order" label="Order" />
            <BooleanField source="is_visible" label="Visible" />
            <EditButton />
            <DeleteButton mutationMode="pessimistic" />
        </Datagrid>
    </List>
);
