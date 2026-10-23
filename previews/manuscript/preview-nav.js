/* 정적 미리보기용: 내부 링크를 명시적 index.html 이동으로 바꿔 어느 호스팅에서도 열리게 한다. */
(function () {
  function target(a) {
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin !== location.origin) return null;
    if (/\.[a-z0-9]+$/i.test(u.pathname) && !/\.html$/i.test(u.pathname)) return null;
    var p = u.pathname.replace(/index\.html$/, ''); if(p.indexOf('/elyweb/')!==0){var locale=(location.pathname.match(/\/(ko|en|ja)(?:\/|$)/)||[])[1]||'ko'; if(!/^\/(ko|en|ja)(\/|$)/.test(p))p='/'+locale+p; p='/elyweb/previews/manuscript'+p;}
    if (!/\.html$/i.test(p)) p = p.replace(/\/?$/, '/') + 'index.html';
    return p + u.search + u.hash;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|https?:\/\/)/.test(href) && new URL(href).origin !== location.origin) return;
    var t = target(a);
    if (!t) return;
    var cur = new URL(t, location.href);
    if (cur.pathname === location.pathname && cur.search === location.search) {
      // 같은 문서 안의 해시 이동은 브라우저에 맡긴다
      if (cur.hash) return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href = t;
  }, true);
})();

/* 시안 허브로 돌아가는 작은 버튼(정적 미리보기에서만) */
(function () {
  function add() {
    if (document.getElementById('preview-hub-pill')) return;
    var a = document.createElement('a');
    a.id = 'preview-hub-pill';
    a.href = '/elyweb/';
    a.textContent = '← 시안 허브';
    a.setAttribute('aria-label', 'Studio Elysian 시안 허브로 돌아가기');
    a.style.cssText = 'position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));z-index:70;padding:8px 14px;font:700 12px/1 system-ui,sans-serif;letter-spacing:.02em;color:#fff;background:rgba(17,19,26,.86);border:1px solid rgba(255,255,255,.35);border-radius:999px;text-decoration:none;backdrop-filter:blur(6px)';
    document.body.appendChild(a);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
