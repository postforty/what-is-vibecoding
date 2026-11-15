/**
 * Playful 테마 슬라이드 동작 스크립트
 * 슬라이드 이동, 단축키, 무지개 진행 상태 바, 발표자 메모 팝업창 연동
 */
(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentIndex = 0;
  let notesWindow = null;

  // UI 요소 참조
  const uiBar = document.querySelector('.ui-bar');
  const progressBar = document.getElementById('progressBar');
  const slideCounter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const notesBtn = document.getElementById('notesBtn');

  // URL 주소에서 슬라이드 번호 확인
  function getInitialIndex() {
    const hashMatch = window.location.hash.match(/^#slide-(\d+)$/);
    if (hashMatch) {
      const page = parseInt(hashMatch[1], 10);
      if (page >= 1 && page <= totalSlides) {
        return page - 1;
      }
    }
    return 0;
  }

  // 슬라이드 화면 전환 함수
  function goTo(index) {
    if (index < 0 || index >= totalSlides) return;

    slides[currentIndex].classList.remove('active');
    slides[index].classList.add('active');
    currentIndex = index;

    updateProgressBar();
    updateCounter();
    updateNotesWindow();
    updateButtonStates();

    // 주소창 해시 업데이트
    const pageNum = currentIndex + 1;
    window.history.replaceState(null, '', `#slide-${pageNum}`);
  }

  // 진행 상태 바 갱신
  function updateProgressBar() {
    if (!progressBar) return;
    const progressPercent = totalSlides > 1 ? (currentIndex / (totalSlides - 1)) * 100 : 100;
    progressBar.style.width = `${Math.max(8, progressPercent)}%`;
  }

  // 슬라이드 카운터 갱신
  function updateCounter() {
    if (!slideCounter) return;
    slideCounter.innerHTML = `<span class="current-num">${currentIndex + 1}</span> / ${totalSlides}`;
  }

  // 이전/다음 버튼 활성/비활성 처리
  function updateButtonStates() {
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex === totalSlides - 1 ? '0.4' : '1';
  }

  // 다음 슬라이드로 이동
  function next() {
    if (currentIndex < totalSlides - 1) {
      goTo(currentIndex + 1);
    }
  }

  // 이전 슬라이드로 이동
  function prev() {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }

  // 전체화면 토글
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // 발표자 메모 팝업창 토글 (S키 또는 발표자 메모 버튼)
  function toggleNotes() {
    if (notesWindow && !notesWindow.closed) {
      notesWindow.close();
      notesWindow = null;
      return;
    }

    notesWindow = window.open('', 'SpeakerNotes', 'width=560,height=460,top=100,left=100');
    if (!notesWindow) {
      alert('팝업 차단이 설정되어 있어 발표자 메모 창을 열지 못했습니다. 팝업 허용을 켜주세요.');
      return;
    }

    notesWindow.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>발표자 메모 (Speaker Notes)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
      background: #fef7f0;
      color: #2d2d2d;
      padding: 28px;
      line-height: 1.7;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f0e0d0;
    }
    .slide-badge {
      font-size: 13px;
      font-weight: 700;
      background: rgba(255, 107, 107, 0.15);
      color: #ff6b6b;
      padding: 4px 12px;
      border-radius: 12px;
    }
    .title-label {
      font-size: 14px;
      font-weight: 600;
      color: #777;
    }
    .notes-content {
      background: #ffffff;
      border: 1px solid #f0e0d0;
      border-radius: 16px;
      padding: 22px;
      font-size: 17px;
      white-space: pre-wrap;
      word-break: break-word;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      min-height: 240px;
    }
    .hint-bar {
      margin-top: 16px;
      font-size: 13px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <span class="slide-badge" id="slideBadge">Slide 1 / 10</span>
    <span class="title-label">🎙️ 발표 대본 & 시간 안내</span>
  </div>
  <div class="notes-content" id="notesContent">불러오는 중...</div>
  <div class="hint-bar">메인 발표 화면의 슬라이드를 넘기면 대본도 함께 자동으로 바뀝니다.</div>
</body>
</html>`);
    notesWindow.document.close();
    updateNotesWindow();
  }

  // 열려있는 발표자 메모 창 내용 업데이트
  function updateNotesWindow() {
    if (!notesWindow || notesWindow.closed) return;
    try {
      const currentSlide = slides[currentIndex];
      const notes = currentSlide.getAttribute('data-notes') || '(이 슬라이드에는 등록된 발표자 메모가 없습니다.)';
      const badgeElem = notesWindow.document.getElementById('slideBadge');
      const contentElem = notesWindow.document.getElementById('notesContent');

      if (badgeElem) badgeElem.textContent = `Slide ${currentIndex + 1} / ${totalSlides}`;
      if (contentElem) contentElem.textContent = notes;
    } catch (e) {
      // 도메인 또는 창 상태 예외 무시
    }
  }

  // 창 닫힐 때 팝업창도 함께 정리
  window.addEventListener('beforeunload', () => {
    if (notesWindow && !notesWindow.closed) {
      notesWindow.close();
    }
  });

  // 버튼 클릭 이벤트 바인딩
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  if (notesBtn) notesBtn.addEventListener('click', toggleNotes);

  // 키보드 조작 이벤트
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(totalSlides - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      toggleNotes();
    }
  });

  // 모바일 화면 터치 및 스와이프 조작
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const elapsedTime = Date.now() - touchStartTime;

    if (elapsedTime > 500) return; // 너무 천천히 넘긴 경우 무시
    if (Math.abs(deltaX) < 45) return; // 짧은 터치 무시
    if (Math.abs(deltaY) > Math.abs(deltaX)) return; // 상하 스크롤 동작과 구분

    if (deltaX < 0) {
      next();
    } else {
      prev();
    }
  }, { passive: true });

  // 클릭 네비게이션: 화면의 왼쪽 1/4 클릭 시 이전, 오른쪽 3/4 클릭 시 다음 (인터랙티브 요소 제외)
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, .icon-btn, .key-hint')) return;
    const clickX = e.clientX;
    const windowWidth = window.innerWidth;
    if (clickX < windowWidth * 0.25) {
      prev();
    } else if (clickX > windowWidth * 0.75) {
      next();
    }
  });

  // 브라우저 뒤로가기/앞으로가기 시 주소창 해시 변경 감지
  window.addEventListener('hashchange', () => {
    const targetIndex = getInitialIndex();
    if (targetIndex !== currentIndex) {
      goTo(targetIndex);
    }
  });

  // 초기 시작
  goTo(getInitialIndex());
})();
