/* 수월봉 스크롤리텔링 — scroll interactions
   IntersectionObserver를 쓰지 않고 rAF 스크롤 루프로 모든 트리거를 구동
   (일부 임베드 환경에서 IO 콜백이 실행되지 않는 문제에 대한 방어) */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  /* 모바일(≤768px)에선 가로 스크롤 갤러리·커스텀 스냅을 끄고 세로 스택으로 둔다 */
  var isMobile = function () { return window.innerWidth <= 768; };

  var allowMotion = matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (allowMotion) document.body.classList.add('anim');
  var motion = function () {
    var m = parseFloat(document.body.dataset.motion);
    return isNaN(m) ? 1 : m;
  };

  /* ---------- 챕터 내비게이션 생성 ---------- */
  var chapters = $$('[data-chapter]');
  var nav = $('#chapterNav');
  chapters.forEach(function (sec) {
    var b = document.createElement('button');
    b.className = 'nav-dot';
    b.type = 'button';
    b.setAttribute('aria-label', sec.dataset.chapter);
    b.innerHTML = '<span>' + sec.dataset.chapter + '</span><i></i>';
    b.addEventListener('click', function () {
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY + 2, behavior: allowMotion ? 'smooth' : 'auto' });
    });
    nav.appendChild(b);
  });
  var dots = $$('.nav-dot');

  function activeChapter() {
    var y = window.scrollY + window.innerHeight * 0.42;
    var idx = 0;
    chapters.forEach(function (sec, i) { if (sec.offsetTop <= y) idx = i; });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
  }

  /* ---------- 카운터 ---------- */
  function fmt(n, dec) {
    return n.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = (String(el.dataset.count).split('.')[1] || '').length;
    if (!allowMotion) { el.textContent = fmt(target, dec); return; }
    var dur = 1800, t0 = performance.now();
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e, dec);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 가시성 기반 트리거 대상 ---------- */
  var reveals = $$('[data-reveal]');
  var counters = $$('[data-count]');

  /* 스티키 미디어 교차 챕터 */
  var xchapters = $$('.xchapter').map(function (x) {
    return {
      frames: $$('.media-frame').filter(function (f) { return x.contains(f); }),
      map: x.querySelector('.map-stage'),
      panels: $$('.panel[data-media]').filter(function (p) { return x.contains(p); })
    };
  });

  /* 줌 씬 (배경 이미지 확대 + 캡션) */
  var zooms = $$('.zoomscene').map(function (z) {
    return { el: z, media: z.querySelector('.zoom-media') };
  });

  /* ---------- 가로 스크롤 갤러리: 높이 설정 ---------- */
  var hscrolls = $$('.hscroll');
  function sizeHScroll() {
    hscrolls.forEach(function (h) {
      var track = h.querySelector('.hscroll-track');
      if (isMobile()) { h.style.height = ''; track.style.transform = ''; return; }
      var dist = Math.max(0, track.scrollWidth - window.innerWidth);
      h.style.height = (window.innerHeight + dist) + 'px';
    });
  }
  sizeHScroll();
  window.addEventListener('resize', sizeHScroll);
  setTimeout(sizeHScroll, 600); // 슬롯 로드 후 재계산

  /* ---------- 메인 스크롤 루프 ---------- */
  var fill = $('#progressFill');
  var heroMedia = $('#heroMedia');
  var pars = $$('[data-parallax]');
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - vh;
    if (fill) fill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    activeChapter();

    /* 등장 리빌 */
    for (var i = reveals.length - 1; i >= 0; i--) {
      var r = reveals[i].getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) {
        reveals[i].classList.add('in');
        reveals.splice(i, 1);
      }
    }

    /* 카운터 */
    for (var c = counters.length - 1; c >= 0; c--) {
      var cr = counters[c].getBoundingClientRect();
      if (cr.top < vh * 0.78 && cr.bottom > 0) {
        animateCount(counters[c]);
        counters.splice(c, 1);
      }
    }

    /* 스티키 미디어 크로스페이드 / 지도 스텝: 뷰포트 중심이 속한 패널 */
    xchapters.forEach(function (xc) {
      var mid = vh * 0.5, active = -1;
      xc.panels.forEach(function (p) {
        var pr = p.getBoundingClientRect();
        if (pr.top <= mid && pr.bottom >= mid) active = +p.dataset.media;
      });
      if (active < 0) {
        /* 패널 진입 전(첫 패널이 아직 아래에 있을 때)에는 지도 원경으로 복귀 */
        if (xc.map && xc.panels.length && xc.panels[0].getBoundingClientRect().top > mid) {
          xc.map.dataset.step = 'intro';
        }
        return;
      }
      if (xc.frames.length) {
        xc.frames.forEach(function (f, fi) { f.classList.toggle('is-active', fi === active); });
      }
      if (xc.map) xc.map.dataset.step = active;
    });

    var m = allowMotion ? motion() : 0;

    /* 줌 씬: 섹션 진행도에 따라 배경 확대 */
    zooms.forEach(function (z) {
      var total = z.el.offsetHeight - vh;
      if (total <= 0 || !z.media) return;
      var zr = z.el.getBoundingClientRect();
      if (zr.bottom < 0 || zr.top > vh) return;
      var p = Math.min(1, Math.max(0, -zr.top / total));
      var s = 1 + 0.18 * p * Math.max(m, 0);
      z.media.style.transform = 'scale(' + s.toFixed(4) + ')';
    });

    if (heroMedia && m > 0) {
      var hp = Math.min(1, y / vh);
      heroMedia.style.transform = 'scale(' + (1 + 0.1 * m * (1 - hp)).toFixed(4) + ') translateY(' + (hp * 5 * m).toFixed(2) + 'vh)';
    }

    if (m > 0) {
      pars.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var v = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = 'translateY(' + (v * -44 * parseFloat(el.dataset.parallax || 1) * m).toFixed(1) + 'px)';
      });
    }

    hscrolls.forEach(function (h) {
      if (isMobile()) return;
      var track = h.querySelector('.hscroll-track');
      var total = h.offsetHeight - vh;
      if (total <= 0) return;
      var p = Math.min(1, Math.max(0, -h.getBoundingClientRect().top / total));
      var dist = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = 'translateX(' + (-p * dist).toFixed(1) + 'px)';
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  /* 폰트/슬롯 로드 후 초기 상태 재평가 */
  setTimeout(update, 400);
  setTimeout(update, 1200);

  /* ---------- 느린 커스텀 스크롤 스냅 ---------- */
  /* 스냅 대상: 챕터 게이트/주요 섹션 + 스티키 질문 패널 + 단계 섹션 + 인용구 */
  var snapEls = $$('[data-chapter], .panel, .bigquote, .stats-chapter, .steps')
    .filter(function (el) {
      /* 사람들·에필로그 섹션은 스냅 제외 */
      return !el.classList.contains('people') && !el.classList.contains('epilogue');
    });
  function snapTargetY(el) {
    var r = el.getBoundingClientRect();
    var top = r.top + window.scrollY;
    var centered = el.classList.contains('panel') ||
                   el.classList.contains('bigquote') ||
                   el.classList.contains('steps');
    if (centered) return top - Math.max(0, (vhNow() - r.height) / 2);
    return top;
  }
  function vhNow() { return window.innerHeight; }

  var snapping = false, snapTimer = null;
  function animateTo(to, dur) {
    var maxY = document.documentElement.scrollHeight - window.innerHeight;
    to = Math.max(0, Math.min(maxY, to));
    var start = window.scrollY, diff = to - start;
    if (Math.abs(diff) < 2) return;
    snapping = true;
    var prevBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    var t0 = performance.now();
    function step(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
      window.scrollTo(0, start + diff * e);
      if (p < 1) { requestAnimationFrame(step); }
      else { snapping = false; document.documentElement.style.scrollBehavior = prevBehavior; }
    }
    requestAnimationFrame(step);
  }
  function maybeSnap() {
    if (snapping || !allowMotion || isMobile()) return;
    var vh = window.innerHeight, y = window.scrollY;
    var best = null, bestDist = Infinity;
    snapEls.forEach(function (el) {
      var t = snapTargetY(el);
      var d = Math.abs(t - y);
      if (d < bestDist) { bestDist = d; best = t; }
    });
    /* 근처(뷰포트 45% 이내)에 왔을 때만, 충분히 떨어졌을 때만 부드럽게 정렬 */
    if (best != null && bestDist > 4 && bestDist < vh * 0.45) {
      animateTo(best, 1100); /* 약 1.1초 — 천천히 */
    }
  }
  window.addEventListener('scroll', function () {
    if (snapping) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(maybeSnap, 200); /* 스크롤이 멈춘 뒤에만 */
  }, { passive: true });
})();
