import { defaultI18nProvider, type I18nProvider } from 'react-admin';

/** 자주 보이는 react-admin 기본 문구만 한국어로 바꾼다(나머지는 영어 기본값). */
const KO: Record<string, string> = {
  'ra.page.dashboard': '사이트 구조 안내',
  'ra.page.create': '%{name} 추가',
  'ra.page.empty': '아직 %{name} 항목이 없습니다.',
  'ra.page.invite': '새로 추가할까요?',
  'ra.action.create': '추가',
  'ra.action.add': '추가',
  'ra.action.edit': '편집',
  'ra.action.show': '보기',
  'ra.action.save': '저장',
  'ra.action.delete': '삭제',
  'ra.action.remove': '삭제',
  'ra.action.cancel': '취소',
  'ra.action.confirm': '확인',
  'ra.action.back': '뒤로',
  'ra.action.export': '내보내기',
  'ra.action.refresh': '새로고침',
  'ra.action.search': '검색',
  'ra.action.list': '목록',
  'ra.action.clear_input_value': '지우기',
  'ra.action.close': '닫기',
  'ra.action.undo': '되돌리기',
  'ra.action.unselect': '선택 해제',
  'ra.action.select_all': '모두 선택',
  'ra.action.bulk_actions': '%{smart_count}개 선택됨',
  'ra.auth.logout': '로그아웃',
  'ra.auth.sign_in': '로그인',
  'ra.navigation.page_rows_per_page': '페이지당:',
  'ra.navigation.page_range_info': '%{offsetBegin}–%{offsetEnd} / %{total}',
  'ra.navigation.no_results': '결과가 없습니다',
  'ra.navigation.next': '다음',
  'ra.navigation.previous': '이전',
  'ra.notification.updated': '저장했습니다',
  'ra.notification.created': '추가했습니다',
  'ra.notification.deleted': '삭제했습니다',
  'ra.notification.item_doesnt_exist': '항목을 찾을 수 없습니다',
  'ra.notification.http_error': '서버와 통신하지 못했습니다',
  'ra.message.delete_title': '%{name} 삭제',
  'ra.message.delete_content': '이 항목을 삭제할까요? 되돌릴 수 없습니다.',
  'ra.message.are_you_sure': '정말 진행할까요?',
  'ra.message.unsaved_changes': '저장하지 않은 변경이 있습니다. 나갈까요?',
  'ra.validation.required': '필수 입력입니다',
};

const interpolate = (text: string, options?: Record<string, unknown>) =>
  text.replace(/%\{(\w+)\}/g, (_, k) => (options && options[k] !== undefined ? String(options[k]) : ''));

export const i18nProvider: I18nProvider = {
  ...defaultI18nProvider,
  translate: (key, options) => (KO[key] ? interpolate(KO[key], options) : defaultI18nProvider.translate(key, options)),
  getLocale: () => 'ko',
};
