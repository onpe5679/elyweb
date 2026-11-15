/**
 * 미리보기 모드(VITE_ADMIN_PREVIEW=1): 실제 Supabase 대신 웹 스냅샷 데이터를 브라우저 메모리에 올려 쓴다.
 * 공개 시안 주소에서 어드민 화면 구성을 안전하게 둘러보기 위한 것 — 저장해도 새로고침하면 원래대로 돌아가고
 * 실제 DB·웹사이트에는 아무것도 쓰지 않는다.
 */
import type { AuthProvider, DataProvider, RaRecord } from 'react-admin';
import games from '../../../web/lib/snapshot/games.json';
import gameSections from '../../../web/lib/snapshot/game_sections.json';
import timeline from '../../../web/lib/snapshot/timeline_events.json';
import settings from '../../../web/lib/snapshot/company_settings.json';
import pressKits from '../../../web/lib/snapshot/press_kits.json';
import news from '../../../web/lib/snapshot/news.json';
import teamMembers from '../../../web/lib/snapshot/team_members.json';
import teamSections from '../../../web/lib/snapshot/team_member_sections.json';

type Row = RaRecord & Record<string, unknown>;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const withIds = (rows: unknown[], prefix: string): Row[] =>
  (rows as Row[]).map((r, i) => ({ ...r, id: (r.id as string) ?? `${prefix}-${i + 1}` }));

const db: Record<string, Row[]> = {
  games: withIds(clone(games), 'game'),
  game_sections: withIds(clone(gameSections), 'section'),
  timeline_events: withIds(clone(timeline), 'timeline'),
  company_settings: withIds(clone(settings), 'setting'),
  press_kits: withIds(clone(pressKits), 'press'),
  news: withIds(clone(news), 'news'),
  team_members: withIds(clone(teamMembers), 'member'),
  team_member_sections: withIds(clone(teamSections), 'member-section'),
  contact_submissions: [],
  auth_users: [{ id: 'preview-admin', email: 'preview@studioelysian.co', created_at: new Date().toISOString() }],
};

const table = (resource: string) => (db[resource] ??= []);

const matches = (row: Row, filter: Record<string, unknown>) =>
  Object.entries(filter).every(([key, want]) => {
    if (want === undefined || want === '') return true;
    const field = key.replace(/@.*$/, '');
    const value = row[field];
    if (key === 'q') return JSON.stringify(row).toLowerCase().includes(String(want).toLowerCase());
    if (Array.isArray(want)) return want.includes(value);
    return value === want || String(value) === String(want);
  });

const sortRows = (rows: Row[], field?: string, order?: string) => {
  if (!field) return rows;
  const dir = order === 'DESC' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = a[field] as never;
    const y = b[field] as never;
    if (x === y) return 0;
    if (x === undefined || x === null) return 1;
    if (y === undefined || y === null) return -1;
    return x > y ? dir : -dir;
  });
};

const page = (rows: Row[], p?: { page: number; perPage: number }) =>
  p ? rows.slice((p.page - 1) * p.perPage, p.page * p.perPage) : rows;

/** 이미지 업로드는 미리보기에서 브라우저 안의 임시 주소로만 바꾼다. */
const stripFiles = (data: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object' && 'rawFile' in (v as object)) out[k] = (v as { src?: string }).src ?? null;
    else if (Array.isArray(v)) out[k] = v.map((x) => (x && typeof x === 'object' && 'rawFile' in x ? (x as { src?: string }).src : x));
    else out[k] = v;
  }
  return out;
};

export const previewDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const rows = sortRows(table(resource).filter((r) => matches(r, params.filter || {})), params.sort?.field, params.sort?.order);
    return { data: clone(page(rows, params.pagination)) as never, total: rows.length };
  },
  getOne: async (resource, params) => {
    const row = table(resource).find((r) => String(r.id) === String(params.id));
    if (!row) throw new Error(`${resource} ${params.id} 없음`);
    return { data: clone(row) as never };
  },
  getMany: async (resource, params) => ({
    data: clone(table(resource).filter((r) => params.ids.map(String).includes(String(r.id)))) as never,
  }),
  getManyReference: async (resource, params) => {
    const rows = sortRows(
      table(resource).filter((r) => String(r[params.target]) === String(params.id) && matches(r, params.filter || {})),
      params.sort?.field,
      params.sort?.order
    );
    return { data: clone(page(rows, params.pagination)) as never, total: rows.length };
  },
  create: async (resource, params) => {
    const row = { ...stripFiles(params.data), id: `${resource}-${Date.now()}` } as Row;
    table(resource).push(row);
    return { data: clone(row) as never };
  },
  update: async (resource, params) => {
    const rows = table(resource);
    const i = rows.findIndex((r) => String(r.id) === String(params.id));
    rows[i] = { ...rows[i], ...stripFiles(params.data), id: rows[i].id };
    return { data: clone(rows[i]) as never };
  },
  updateMany: async (resource, params) => {
    const ids = params.ids.map(String);
    table(resource).forEach((r, i, rows) => {
      if (ids.includes(String(r.id))) rows[i] = { ...r, ...stripFiles(params.data), id: r.id };
    });
    return { data: params.ids };
  },
  delete: async (resource, params) => {
    const rows = table(resource);
    const i = rows.findIndex((r) => String(r.id) === String(params.id));
    const [row] = rows.splice(i, 1);
    return { data: clone(row) as never };
  },
  deleteMany: async (resource, params) => {
    const ids = params.ids.map(String);
    db[resource] = table(resource).filter((r) => !ids.includes(String(r.id)));
    return { data: params.ids };
  },
};

export const previewAuthProvider: AuthProvider = {
  login: async () => undefined,
  logout: async () => undefined,
  checkAuth: async () => undefined,
  checkError: async () => undefined,
  getPermissions: async () => 'admin',
  getIdentity: async () => ({ id: 'preview-admin', fullName: '미리보기 (저장 안 됨)' }),
};
