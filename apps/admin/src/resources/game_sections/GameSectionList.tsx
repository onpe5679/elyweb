import { 
    List, 
    Datagrid, 
    TextField, 
    BooleanField, 
    NumberField,
    ReferenceField,
    EditButton,
    DeleteButton,
    SelectField,
    useRecordContext,
    FilterButton,
    CreateButton,
    TopToolbar,
    SelectInput,
    ReferenceInput,
} from 'react-admin';

const sectionTypeChoices = [
    { id: 'text', name: 'Text' },
    { id: 'gallery', name: 'Gallery' },
    { id: 'video', name: 'Video' },
    { id: 'store', name: 'Store Links' },
    { id: 'credits', name: 'Credits' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'custom', name: 'Custom' },
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
    </TopToolbar>
);

const filters = [
    <ReferenceInput key="game" source="game_id" reference="games" alwaysOn>
        <SelectInput optionText="title_ko" label="Game" />
    </ReferenceInput>,
    <SelectInput key="type" source="section_type" choices={sectionTypeChoices} label="Type" />,
];

const TitleField = (_props: { label?: string }) => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{record.title_ko || record.title_en || record.title_ja || '(No title)'}</span>;
};

export const GameSectionList = () => (
    <List 
        actions={<ListActions />}
        filters={filters}
        sort={{ field: 'display_order', order: 'ASC' }}
    >
        <Datagrid rowClick="edit">
            <ReferenceField source="game_id" reference="games" link="edit">
                <TextField source="title_ko" />
            </ReferenceField>
            <SelectField source="section_type" choices={sectionTypeChoices} />
            <TitleField label="Section Title" />
            <NumberField source="display_order" />
            <BooleanField source="is_visible" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);
