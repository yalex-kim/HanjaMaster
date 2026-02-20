# 🔧 TRD: 한자 마스터 (Hanja Master)

> **Technical Requirements Document**
> 버전: 1.0 | 작성일: 2026-02-16 | 상태: Draft
> 관련 문서: PRD_한자마스터.md

---

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────┐
│                  Client (Browser)             │
│  ┌─────────────────────────────────────────┐ │
│  │           React SPA (Vite)              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────┐ │ │
│  │  │  Pages   │  │Components│  │ Hooks │ │ │
│  │  │  - Home  │  │ - TopBar │  │-useXP │ │ │
│  │  │  - Quiz  │  │ - Card   │  │-useDB │ │ │
│  │  │  - Match │  │ - Canvas │  │-useAud│ │ │
│  │  │  - Write │  │ - Modal  │  │       │ │ │
│  │  │  - Review│  │          │  │       │ │ │
│  │  └──────────┘  └──────────┘  └───────┘ │ │
│  │  ┌──────────────────────────────────┐   │ │
│  │  │         State Management         │   │ │
│  │  │   React useState + useReducer    │   │ │
│  │  └──────────────────────────────────┘   │ │
│  │  ┌──────────────────────────────────┐   │ │
│  │  │         Data Layer               │   │ │
│  │  │  localStorage + JSON Data Files  │   │ │
│  │  └──────────────────────────────────┘   │ │
│  └─────────────────────────────────────────┘ │
│  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Web Audio API│  │  HTML5 Canvas API     │ │
│  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────┘
         │                        │
    Google Fonts CDN       (향후) Firebase
```

### 1.2 아키텍처 결정

| 결정사항 | 선택 | 근거 |
|---------|------|------|
| 앱 유형 | CSR SPA | SEO 불필요, 인터랙션 중심 |
| 프레임워크 | React 18+ | 컴포넌트 기반, 생태계 풍부 |
| 빌드 도구 | Vite | 빠른 HMR, 가벼운 번들 |
| 스타일링 | CSS-in-JS (Inline) | 컴포넌트 자체 완결, 별도 빌드 불필요 |
| 상태관리 | React 내장 (useState/useReducer) | 앱 규모상 외부 라이브러리 불필요 |
| 데이터 저장 | localStorage | Phase 1에서 서버 불필요 |
| 사운드 | Web Audio API | 외부 라이브러리 없이 경량 구현 |
| 그리기 | HTML5 Canvas | 네이티브 API, 성능 우수 |

---

## 2. 기술 스택 상세

### 2.1 프론트엔드

| 구분 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 런타임 | React | 18.x | UI 프레임워크 |
| 빌드 | Vite | 5.x | 번들링, 개발 서버 |
| 언어 | JavaScript (JSX) | ES2022 | 개발 언어 |
| 스타일 | Inline Styles + CSS Variables | - | 컴포넌트 스타일링 |
| 폰트 | Google Fonts | - | Noto Sans KR, Noto Serif KR, Black Han Sans |

### 2.2 브라우저 API

| API | 용도 | 호환성 |
|-----|------|--------|
| Web Audio API | 효과음 생성 | Chrome 35+, Safari 14.1+ |
| Canvas 2D | 한자 쓰기 연습 | 모든 모던 브라우저 |
| localStorage | 학습 진도 저장 | 모든 모던 브라우저 |
| Touch Events | 모바일 터치 입력 | 모든 모바일 브라우저 |
| CSS Transforms | 카드 뒤집기 3D 효과 | Chrome 36+, Safari 9+ |

### 2.3 향후 확장 기술

| 구분 | 기술 | Phase | 용도 |
|------|------|-------|------|
| 획순 | Hanzi Writer / Make Me a Hanzi | Phase 3 | 획순 애니메이션 가이드 |
| 필기 인식 | TensorFlow.js | Phase 3 | AI 기반 한자 필기 판별 |
| 백엔드 | Firebase / Supabase | Phase 4 | 클라우드 데이터 동기화 |
| PWA | Service Worker + Manifest | Phase 4 | 오프라인 지원, 홈화면 추가 |
| 분석 | Mixpanel / Amplitude | Phase 4 | 학습 행태 분석 |

---

## 3. 데이터 설계

### 3.1 한자 데이터 스키마

```typescript
// 개별 한자 데이터
interface HanjaChar {
  char: string;        // 한자 (예: "山")
  meaning: string;     // 훈 (예: "뫼")
  sound: string;       // 음 (예: "산")
  level: string;       // 배정 급수 (예: "8급")
  strokeCount: number; // 총 획수 (예: 3)
  radical: string;     // 부수 (예: "山")
  examples: string[];  // 예시 단어 (예: ["山水(산수)", "火山(화산)"])
}

// 급수별 한자 모음
interface HanjaData {
  "8급": HanjaChar[];    // 50자
  "준7급": HanjaChar[];  // 50자
  "7급": HanjaChar[];    // 50자
  "준6급": HanjaChar[];  // 75자
  "6급": HanjaChar[];    // 75자
}
```

### 3.2 사용자 진도 스키마 (localStorage)

```typescript
// 전체 사용자 상태
interface UserProgress {
  xp: number;
  level: number;
  streak: number;          // 현재 연속 정답
  bestStreak: number;      // 최고 연속 정답
  hearts: number;
  lastPlayDate: string;    // ISO date string
  dailyStreak: number;     // 일일 연속 학습일
  totalStudied: number;    // 총 학습 한자 수
  totalCorrect: number;
  totalWrong: number;
}

// 한자별 숙련도 (Phase 2)
interface CharMastery {
  [char: string]: {
    correct: number;       // 맞춘 횟수
    wrong: number;         // 틀린 횟수
    lastSeen: string;      // 마지막 학습 일시
    mastery: number;       // 0~100 숙련도
    nextReview: string;    // 다음 복습 예정일 (SRS)
  }
}

// localStorage 키
const STORAGE_KEYS = {
  USER_PROGRESS: "hanja_master_progress",
  CHAR_MASTERY: "hanja_master_mastery",
  SETTINGS: "hanja_master_settings",
};
```

### 3.3 설정 스키마

```typescript
interface UserSettings {
  soundEnabled: boolean;   // 사운드 on/off
  theme: "dark" | "light"; // 테마
  defaultLevel: string;    // 기본 급수 필터
  quizCount: number;       // 퀴즈 한 세트 문제 수 (기본 10)
  matchPairs: number;      // 매칭 쌍 수 (기본 6)
  reviewCount: number;     // 복습 카드 수 (기본 20)
}
```

---

## 4. 컴포넌트 설계

### 4.1 컴포넌트 트리

```
App
├── TopBar                    # 상단 네비게이션 (레벨, XP, 스트릭, 하트)
├── XPBar                     # XP 진행 바
├── HomeScreen                # 홈 화면
│   ├── LevelSelector         # 급수 선택 버튼 그룹
│   ├── GameModeCard (x4)     # 게임 모드 선택 카드
│   └── DailyStats            # 오늘의 학습 통계
├── QuizScreen                # 퀴즈 모드
│   ├── ProgressBar           # 진행 상태 바
│   ├── QuestionDisplay       # 문제 표시 영역
│   ├── OptionButton (x4)     # 선택지 버튼
│   ├── FeedbackBanner        # 정답/오답 피드백
│   └── ResultScreen          # 결과 화면
├── MatchScreen               # 카드 매칭 모드
│   ├── MatchStats            # 시도/매칭 수
│   ├── FlipCard (xN)         # 뒤집는 카드
│   └── MatchResult           # 완료 화면
├── WriteScreen               # 쓰기 연습 모드
│   ├── CharDisplay           # 현재 한자 표시
│   ├── WritingCanvas         # 캔버스 (격자 + 필기)
│   ├── StrokeHint            # 획순 힌트 (Phase 3)
│   └── WriteControls         # 지우기/힌트/완료/다음 버튼
├── ReviewScreen              # 복습 카드 모드
│   ├── FlashCard             # 앞뒤 뒤집는 플래시카드
│   ├── KnowButtons           # 알아요/모르겠어요 버튼
│   └── ReviewSummary         # 복습 요약 화면
└── LevelUpModal              # 레벨업 축하 팝업
```

### 4.2 주요 컴포넌트 인터페이스

```typescript
// 퀴즈 문제 생성 로직
interface QuizQuestion {
  correct: HanjaChar;           // 정답 한자
  type: 0 | 1 | 2;             // 0: 한자→뜻음, 1: 뜻음→한자, 2: 한자→음
  options: HanjaChar[];         // 4개 선택지 (정답 포함)
}

// 매칭 카드
interface MatchCard {
  id: number;
  pairId: number;               // 짝 식별자
  type: "char" | "meaning";     // 한자 or 뜻음
  display: string;              // 표시할 텍스트
  hanja: HanjaChar;             // 원본 한자 데이터
}

// Canvas 쓰기
interface DrawingState {
  isDrawing: boolean;
  strokeCount: number;
  showHint: boolean;
  paths: Array<{x: number, y: number}[]>;  // 획 경로 배열
}
```

---

## 5. 핵심 로직 설계

### 5.1 퀴즈 문제 생성 알고리즘

```
generateQuiz(pool, count):
  1. pool에서 count개 한자 랜덤 선택 → 정답 리스트
  2. 각 정답에 대해:
     a. type을 0~2 중 랜덤 결정
     b. pool에서 정답 제외 3개 오답 선택
     c. [정답 + 오답 3개] 셔플 → options
  3. QuizQuestion 배열 반환
```

### 5.2 카드 매칭 로직

```
matchGame(pool, pairCount):
  1. pool에서 pairCount개 한자 선택
  2. 각 한자 → [한자카드, 뜻음카드] 2장 생성 (같은 pairId)
  3. 전체 카드 셔플
  4. 클릭 시:
     a. flipped < 2 → 뒤집기
     b. flipped == 2 → pairId 비교
        - 일치: matched에 추가
        - 불일치: 0.8초 후 다시 뒤집기
  5. matched.length == pairCount → 게임 완료
```

### 5.3 XP/레벨 시스템

```
XP 획득 테이블:
  - 퀴즈 정답: 10 + (streak × 2) XP
  - 매칭 완료: 30 XP
  - 쓰기 완료: 5 ~ 15 XP
  - 복습 "알아요": 3 XP

레벨업 공식:
  - 필요 XP = level × 100
  - level = floor(totalXP / (currentLevel × 100)) + 1
  - 레벨업 시: 팝업 + "levelup" 사운드
```

### 5.4 간격 반복 알고리즘 (Phase 2)

```
SM-2 변형:
  nextReview(mastery, correct):
    if correct:
      mastery += 10 (최대 100)
      interval = mastery에 비례 (1일 ~ 30일)
    else:
      mastery -= 20 (최소 0)
      interval = 1일 (즉시 복습)
    nextReviewDate = today + interval
```

### 5.5 사운드 생성 (Web Audio API)

```
Sound Profiles:
  correct:  523Hz → 659Hz → 784Hz (상승 3음, 350ms)
  wrong:    200Hz sawtooth (불협화, 300ms)
  levelup:  440Hz → 554Hz → 659Hz → 880Hz (팡파레, 500ms)
  flip:     800Hz (짧은 클릭, 50ms)

구현:
  AudioContext → OscillatorNode → GainNode → destination
  gain.value = 0.1 (저음량, 아이 귀 보호)
```

---

## 6. Canvas 쓰기 기술 명세

### 6.1 캔버스 설정

```
크기: 280 × 280px (논리) / DPR 대응
배경: #0a0a1a
격자: 점선 중앙 십자선 (#2a2a4e, dash: [5,5])
```

### 6.2 필기 처리

```
이벤트 매핑:
  Mouse: mousedown → mousemove → mouseup/mouseleave
  Touch: touchstart → touchmove → touchend

설정:
  strokeStyle: "#e94560"
  lineWidth: 4
  lineCap: "round"
  lineJoin: "round"

touch-action: none  (스크롤 방지)
좌표 변환: clientX/Y → canvas 내부 좌표 (DPR 보정)
```

### 6.3 힌트 표시

```
ctx.font = "bold 160px 'Noto Serif KR', serif"
ctx.fillStyle = "rgba(255,215,0,0.25)"  // 반투명 골드
ctx.textAlign = "center"
ctx.textBaseline = "middle"
ctx.fillText(char, width/2, height/2)
```

### 6.4 획순 가이드 (Phase 3)

```
Hanzi Writer 연동:
  - NPM: hanzi-writer
  - 획순 SVG 데이터: hanzi-writer-data
  - 애니메이션: stroke-by-stroke
  - 사용자 입력 검증: quiz mode
```

---

## 7. 성능 최적화

### 7.1 번들 최적화

| 전략 | 적용 |
|------|------|
| 코드 스플리팅 | 각 게임 모드 lazy loading |
| 폰트 최적화 | Google Fonts display=swap, subset=korean |
| Tree Shaking | Vite 기본 지원 |
| 이미지 | 없음 (이모지 + CSS 기반) |

### 7.2 렌더링 최적화

| 전략 | 적용 |
|------|------|
| React.memo | 카드 컴포넌트 (불필요한 리렌더 방지) |
| useCallback | 이벤트 핸들러 메모이제이션 |
| useRef | Canvas 참조, 타이머 관리 |
| CSS will-change | 카드 뒤집기 애니메이션 대상 |
| requestAnimationFrame | Canvas 드로잉 (Phase 3) |

### 7.3 메모리 관리

```
- AudioContext: 싱글턴 패턴 (매번 생성하지 않음)
- Canvas: 화면 전환 시 clearRect
- 이벤트 리스너: useEffect cleanup에서 제거
- 한자 데이터: 모듈 레벨 상수 (재생성 방지)
```

---

## 8. 프로젝트 구조

```
hanja-master/
├── public/
│   ├── index.html
│   ├── manifest.json          # Phase 4: PWA
│   └── favicon.ico
├── src/
│   ├── main.jsx               # 엔트리포인트
│   ├── App.jsx                # 메인 앱 (라우팅, 전역 상태)
│   ├── data/
│   │   ├── hanja-8.json       # 8급 한자 50자
│   │   ├── hanja-7s.json      # 준7급 한자 50자
│   │   ├── hanja-7.json       # 7급 한자 50자
│   │   ├── hanja-6s.json      # 준6급 한자 75자
│   │   ├── hanja-6.json       # 6급 한자 75자
│   │   └── index.js           # 통합 export
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── XPBar.jsx
│   │   ├── LevelUpModal.jsx
│   │   ├── FlipCard.jsx
│   │   └── WritingCanvas.jsx
│   ├── screens/
│   │   ├── HomeScreen.jsx
│   │   ├── QuizScreen.jsx
│   │   ├── MatchScreen.jsx
│   │   ├── WriteScreen.jsx
│   │   └── ReviewScreen.jsx
│   ├── hooks/
│   │   ├── useGameState.js    # XP, 레벨, 스트릭, 하트
│   │   ├── useSound.js        # Web Audio API 래퍼
│   │   ├── useCanvas.js       # Canvas 드로잉 로직
│   │   └── useStorage.js      # localStorage 래퍼
│   ├── utils/
│   │   ├── shuffle.js         # 배열 셔플
│   │   ├── quiz.js            # 퀴즈 문제 생성
│   │   └── srs.js             # 간격 반복 알고리즘 (Phase 2)
│   └── styles/
│       ├── theme.js           # 색상, 폰트 등 디자인 토큰
│       └── global.css         # 전역 스타일, 애니메이션
├── package.json
├── vite.config.js
└── README.md
```

---

## 9. 배포 및 인프라

### 9.1 배포 전략

| 항목 | 선택 | 비고 |
|------|------|------|
| 호스팅 | Vercel 또는 Netlify | 무료 티어, 자동 배포 |
| 도메인 | 커스텀 도메인 (선택) | hanjamaster.app 등 |
| CDN | Vercel Edge Network | 글로벌 CDN 기본 제공 |
| CI/CD | GitHub → Vercel 자동 배포 | main 브랜치 push 시 |

### 9.2 환경 구성

```
개발: localhost:5173 (Vite dev server)
스테이징: preview deployment (PR별 자동 생성)
프로덕션: main 브랜치 → 자동 배포
```

### 9.3 모니터링 (Phase 4)

| 도구 | 용도 |
|------|------|
| Vercel Analytics | 페이지 로딩 성능 |
| Sentry | 에러 트래킹 |
| Mixpanel | 사용자 행태 분석 |

---

## 10. 보안 고려사항

| 항목 | 대응 |
|------|------|
| XSS | React 기본 이스케이프 + dangerouslySetInnerHTML 사용 금지 |
| CSRF | SPA 전용, 서버 통신 없음 (Phase 1) |
| 데이터 무결성 | localStorage 읽기 시 JSON.parse try-catch |
| 콘텐츠 보안 | CSP 헤더 설정 (Google Fonts, CDN만 허용) |
| 개인정보 | 수집하지 않음, 브라우저 로컬 저장만 사용 |

---

## 11. 테스트 전략

### 11.1 테스트 범위

| 유형 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Vitest | 퀴즈 생성, 셔플, XP 계산, SRS 알고리즘 |
| 컴포넌트 테스트 | React Testing Library | 각 화면 렌더링, 인터랙션 |
| E2E 테스트 | Playwright | 전체 게임 플로우 |
| 수동 테스트 | - | 모바일 기기 실물 테스트 |

### 11.2 테스트 기기

| 기기 | OS | 브라우저 |
|------|----|---------| 
| iPhone SE / 13 | iOS 16+ | Safari |
| Galaxy S21 / A시리즈 | Android 12+ | Chrome, Samsung Internet |
| iPad | iPadOS 16+ | Safari |
| Galaxy Tab | Android 12+ | Chrome |

---

## 12. 기술적 리스크 및 대응

| 리스크 | 영향 | 확률 | 대응 |
|--------|------|------|------|
| Canvas 터치 이벤트 호환성 | 쓰기 모드 동작 불가 | 낮음 | PointerEvents fallback |
| Web Audio API 차단 (자동재생 정책) | 사운드 미재생 | 중간 | 첫 터치 시 AudioContext resume |
| localStorage 용량 초과 | 진도 저장 실패 | 낮음 | 데이터 압축, 오래된 데이터 정리 |
| Hanzi Writer 라이브러리 한국 한자 미지원 | 획순 부정확 | 중간 | Make Me a Hanzi 데이터로 대체 |
| 모바일 성능 (저사양 기기) | 애니메이션 버벅임 | 중간 | prefers-reduced-motion 대응, 애니메이션 간소화 |
| 폰트 로딩 지연 | 한자 깨짐/FOUT | 중간 | font-display: swap + preload |
