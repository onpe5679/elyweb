import React from 'react';
import ReactDOM from 'react-dom/client';
import type { AuthProvider, DataProvider } from 'react-admin';
import App from './App';

/** VITE_ADMIN_PREVIEW=1 이면 실제 DB 대신 스냅샷 데이터(메모리, 저장 안 됨)로 띄운다. */
const PREVIEW = import.meta.env.VITE_ADMIN_PREVIEW === '1';

async function boot() {
  let dataProvider: DataProvider;
  let authProvider: AuthProvider;
  if (PREVIEW) {
    const m = await import('./preview/previewProviders');
    dataProvider = m.previewDataProvider;
    authProvider = m.previewAuthProvider;
  } else {
    const [d, a] = await Promise.all([import('./dataProvider'), import('./authProvider')]);
    dataProvider = d.dataProvider;
    authProvider = a.authProvider;
  }
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App dataProvider={dataProvider} authProvider={authProvider} preview={PREVIEW} />
    </React.StrictMode>
  );
}

boot();
