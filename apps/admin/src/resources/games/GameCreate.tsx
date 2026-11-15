import { Create, SimpleForm, TextInput, SelectInput, ArrayInput, SimpleFormIterator, BooleanInput, NumberInput, ImageInput, ImageField, DateInput } from 'react-admin';
import { LocalizedInput } from '../../components/LocalizedInput';
import { LocalizedArrayInput } from '../../components/LocalizedArrayInput';

export const GameCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="slug" fullWidth helperText="주소에 쓰입니다: /games/슬러그" />
            <LocalizedInput source="title" label="제목" />
            <LocalizedInput source="series" label="시리즈 (하봄 소속이면 '하봄 스튜디오')" />
            
            <SelectInput source="status" label="상태" choices={[
                { id: 'released', name: '출시 (Released)' },
                { id: 'coming_soon', name: '출시 예정 (Coming Soon)' },
                { id: 'in_development', name: '개발 중 (In Development)' },
                { id: 'publishing', name: '퍼블리싱 (Publishing)' },
            ]} />
            
            <LocalizedArrayInput source="genre" label="Genre" />

            <ArrayInput source="platforms">
                <SimpleFormIterator>
                    <TextInput source="" label={false} />
                </SimpleFormIterator>
            </ArrayInput>

            <LocalizedInput source="description" label="Description" multiline rows={4} />
            <LocalizedInput source="synopsis" label="Synopsis" multiline rows={2} />

            <ImageInput source="cover_image" label="Cover Image" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>

            <ImageInput source="thumbnail_image" label="Thumbnail (list card)" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>

            <ImageInput source="banner_image" label="Banner Image" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>

            <ArrayInput source="gallery_images">
                <SimpleFormIterator>
                    <ImageInput source="image" label="Image" accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}>
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </SimpleFormIterator>
            </ArrayInput>

            <TextInput source="steam_url" fullWidth label="Steam 주소" />
            <TextInput source="trailer_url" fullWidth label="트레일러 주소 (선택)" />
            <DateInput source="release_date" label="출시일 (비우면 Coming Soon)" />

            <BooleanInput source="is_featured" label="메인 대표작" helperText="대표작은 작품 목록의 '대표작으로' 버튼이나 대시보드에서 하나만 고르는 것을 권장합니다." />
            <NumberInput source="display_order" label="정렬 순서 (작은 숫자가 앞)" />
        </SimpleForm>
    </Create>
);
