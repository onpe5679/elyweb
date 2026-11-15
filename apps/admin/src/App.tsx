import { Admin, Layout, Resource, type AuthProvider, type DataProvider, type LayoutProps } from 'react-admin';
import { Alert } from '@mui/material';
import { GameList, GameEdit, GameCreate } from './resources/games';
import { GameSectionEdit, GameSectionCreate } from './resources/game_sections';
import { NewsList, NewsEdit, NewsCreate } from './resources/news';
import { TimelineList, TimelineEdit, TimelineCreate } from './resources/timeline';
import { SettingsList, SettingsEdit, SettingsCreate } from './resources/settings';
import { ContactSubmissionList, ContactSubmissionShow, ContactSubmissionEdit } from './resources/contact_submissions';
import { PressKitList, PressKitEdit, PressKitCreate } from './resources/press_kits';
import { AuthUserList, AuthUserEdit, AuthUserCreate } from './resources/auth_users';
import { TeamMemberList, TeamMemberEdit, TeamMemberCreate } from './resources/team_members';
import { TeamMemberSectionEdit, TeamMemberSectionCreate } from './resources/team_member_sections';
import Dashboard from './Dashboard';
import { i18nProvider } from './i18n';
import LoginPage from './LoginPage';

const PreviewLayout = ({ children }: LayoutProps) => (
  <Layout>
    <Alert severity="info" sx={{ mb: 1 }} data-testid="preview-banner">
      미리보기 어드민 — 웹 스냅샷 데이터로 동작합니다. 저장해도 실제 사이트·DB에는 반영되지 않고, 새로고침하면 원래대로 돌아갑니다.
    </Alert>
    {children}
  </Layout>
);

type Props = { dataProvider: DataProvider; authProvider: AuthProvider; preview?: boolean };

/** 메뉴 순서 = 새 사이트 순서(메인·작품 → 스튜디오 소개 → 새 소식 → 프레스 → 설정), 보류·이전 기능은 아래로. */
const App = ({ dataProvider, authProvider, preview }: Props) => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    title={preview ? 'Studio Elysian Admin (미리보기)' : 'Studio Elysian Admin'}
    loginPage={preview ? false : LoginPage}
    dashboard={Dashboard}
    layout={preview ? PreviewLayout : undefined}
    requireAuth={!preview}
  >
    <Resource name="games" list={GameList} edit={GameEdit} create={GameCreate} options={{ label: '작품' }} recordRepresentation="title_ko" />
    <Resource name="game_sections" edit={GameSectionEdit} create={GameSectionCreate} options={{ label: '작품 상세 섹션' }} />
    <Resource name="timeline_events" list={TimelineList} edit={TimelineEdit} create={TimelineCreate} options={{ label: '스튜디오 연혁' }} recordRepresentation="title_ko" />
    <Resource name="news" list={NewsList} edit={NewsEdit} create={NewsCreate} options={{ label: '새 소식' }} recordRepresentation="title_ko" />
    <Resource name="press_kits" list={PressKitList} edit={PressKitEdit} create={PressKitCreate} options={{ label: '프레스 자료' }} recordRepresentation="title_ko" />
    <Resource name="company_settings" list={SettingsList} edit={SettingsEdit} create={SettingsCreate} options={{ label: '사이트 설정' }} recordRepresentation="key" />
    <Resource name="team_members" list={TeamMemberList} edit={TeamMemberEdit} create={TeamMemberCreate} options={{ label: '팀원 (보류·미노출)' }} recordRepresentation="name_ko" />
    <Resource name="team_member_sections" edit={TeamMemberSectionEdit} create={TeamMemberSectionCreate} />
    <Resource name="contact_submissions" list={ContactSubmissionList} show={ContactSubmissionShow} edit={ContactSubmissionEdit} options={{ label: '이전 문의 폼 기록' }} />
    <Resource name="auth_users" list={AuthUserList} edit={AuthUserEdit} create={AuthUserCreate} options={{ label: '관리자 계정' }} />
  </Admin>
);

export default App;
