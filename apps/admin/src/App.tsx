import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { GameList, GameEdit, GameCreate } from './resources/games';
import { GameSectionEdit, GameSectionCreate } from './resources/game_sections';
import { NewsList, NewsEdit, NewsCreate } from './resources/news';
import { TimelineList, TimelineEdit, TimelineCreate } from './resources/timeline';
import { SettingsList, SettingsEdit, SettingsCreate } from './resources/settings';
import { ContactSubmissionList, ContactSubmissionShow, ContactSubmissionEdit } from './resources/contact_submissions';
import { PressKitList, PressKitEdit, PressKitCreate } from './resources/press_kits';
import { AuthUserList, AuthUserEdit, AuthUserCreate } from './resources/auth_users';
import LoginPage from './LoginPage';

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    title="Studio Elysian Admin"
    loginPage={LoginPage}
  >
    <Resource
      name="games"
      list={GameList}
      edit={GameEdit}
      create={GameCreate}
      options={{ label: 'Games' }}
    />
    <Resource
      name="game_sections"
      edit={GameSectionEdit}
      create={GameSectionCreate}
    />
    <Resource
      name="news"
      list={NewsList}
      edit={NewsEdit}
      create={NewsCreate}
      options={{ label: 'News' }}
    />
    <Resource
      name="timeline_events"
      list={TimelineList}
      edit={TimelineEdit}
      create={TimelineCreate}
      options={{ label: 'Timeline' }}
    />
    <Resource
      name="company_settings"
      list={SettingsList}
      edit={SettingsEdit}
      create={SettingsCreate}
      options={{ label: 'Settings' }}
    />
    <Resource
      name="contact_submissions"
      list={ContactSubmissionList}
      show={ContactSubmissionShow}
      edit={ContactSubmissionEdit}
      options={{ label: 'Contact' }}
    />
    <Resource
      name="press_kits"
      list={PressKitList}
      edit={PressKitEdit}
      create={PressKitCreate}
      options={{ label: 'Press Kits' }}
    />
    <Resource
      name="auth_users"
      list={AuthUserList}
      edit={AuthUserEdit}
      create={AuthUserCreate}
      options={{ label: 'Users' }}
    />
  </Admin>
);

export default App;
