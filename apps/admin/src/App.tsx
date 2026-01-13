import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { GameList, GameEdit, GameCreate } from './resources/games';
import { GameSectionEdit, GameSectionCreate } from './resources/game_sections';
import { NewsList, NewsEdit, NewsCreate } from './resources/news';
import { TimelineList, TimelineEdit, TimelineCreate } from './resources/timeline';
import { SettingsList, SettingsEdit, SettingsCreate } from './resources/settings';

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    title="Studio Elysian Admin"
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
  </Admin>
);

export default App;
