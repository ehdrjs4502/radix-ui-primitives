# 헤드리스 UI 컴포넌트 라이브러리 만들기 - 사전 리서치

---

## 1. 자료조사: Radix UI vs Headless UI

### 1-1. Headless UI (Tailwind Labs) — 간단 요약

**GitHub**: [tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui)

- React + Vue 양쪽 지원 (별도 패키지)
- 컴포넌트 수: ~11개 (Menu, Listbox, Combobox, Switch, Disclosure, Dialog, Popover, RadioGroup, Tabs, Transition, FocusTrap)
- 비교적 간단한 API, Tailwind CSS와 페어링 전제로 설계됨

**주요 구현 방식**:
```tsx
// render props / children as function 방식
<Menu>
  <Menu.Button>More</Menu.Button>
  <Menu.Items>
    <Menu.Item>
      {({ active }) => (
        <a className={active ? 'bg-blue-500' : ''} href="#">Edit</a>
      )}
    </Menu.Item>
  </Menu.Items>
</Menu>
```

**특징 요약**:
| 항목 | 내용 |
|------|------|
| 상태 노출 | render props (`active`, `selected`, `open`) |
| 접근성 | WAI-ARIA 지원 |
| 폼 통합 | 기본 지원 |
| 스타일링 | 제로 스타일, Tailwind 권장 |
| Context 방식 | React Context (단순) |
| Scope 격리 | 없음 (중첩 시 주의 필요) |

---

### 1-2. Radix UI — 심층 분석

**GitHub**: `radix-ui/primitives` (현재 있는 이 레포)

#### 전체 구조

- **~60개** 독립 패키지 (컴포넌트 + 유틸리티)
- pnpm 모노레포 (`pnpm-workspace.yaml`)
- 구조: `packages/react/*`, `packages/core/*`, `internal/*`, `apps/*`

```
packages/
  core/
    primitive/         # composeEventHandlers 등 순수 JS 유틸
  react/
    checkbox/          # 각 컴포넌트 독립 패키지
    dialog/
    context/           # createContext, createContextScope
    compose-refs/      # useComposedRefs
    slot/              # asChild 패턴
    presence/          # 마운트/언마운트 애니메이션
    use-controllable-state/
    collection/        # 동적 아이템 추적
    ...
internal/
  builder/             # esbuild + tsup
  typescript-config/
  eslint-config/
apps/
  storybook/
  ssr-testing/
```

#### 핵심 패턴들

**① Compound Component 패턴**
```tsx
<Checkbox.Root checked={checked} onCheckedChange={setChecked}>
  <Checkbox.Trigger aria-label="Accept">
    <Checkbox.Indicator />
  </Checkbox.Trigger>
</Checkbox.Root>
```
1 컴포넌트 = 1 DOM 노드 원칙. 직접 ref 접근 가능.

**② createContextScope — Context 격리**
```tsx
const [createCheckboxContext, createCheckboxScope] =
  createContextScope(CHECKBOX_NAME, [createCollectionScope]);

const [CheckboxProvider, useCheckboxContext] =
  createCheckboxContext<CheckboxContextValue>(CHECKBOX_NAME);
```
- 중첩된 같은 컴포넌트끼리 context 충돌 방지
- `__scope{ComponentName}` prop으로 내부적으로 전달

**③ useControllableState — Controlled/Uncontrolled 통합**
```tsx
const [checked, setChecked] = useControllableState({
  prop: checkedProp,         // 외부 상태 (controlled)
  defaultProp: false,        // 기본값 (uncontrolled)
  onChange: onCheckedChange,
  caller: 'Checkbox',        // 개발 경고용
});
```
- `prop`이 `undefined`이면 내부 state 사용 (uncontrolled)
- controlled → uncontrolled 전환 시 개발 환경에서 경고

**④ asChild / Slot 패턴 — Polymorphic 렌더링**
```tsx
// 기본
<Button>Click</Button>  // → <button>Click</button>

// asChild: Slot이 자식 컴포넌트를 대신 렌더링
<Button asChild>
  <a href="/link">Click</a>
</Button>  // → <a href="/link">Click</a>
```

**⑤ Presence — 애니메이션 지원**
```
mounted → unmountSuspended → unmounted
```
애니메이션 실행 중 DOM 유지. CSS 애니메이션 라이브러리 무관.

**⑥ 빌드 방식**
```
esbuild  → dist/index.js (.cjs)
esbuild  → dist/index.mjs (.esm)
tsup     → dist/index.d.ts (타입만)
```
package.json `exports` 필드로 환경별 파일 지정:
```json
"exports": {
  ".": {
    "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
    "require": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  }
}
```

**⑦ 접근성 구현 방식**
- `role`, `aria-checked`, `aria-required`, `aria-hidden`
- `data-state="checked|unchecked|indeterminate"` — CSS 선택자용
- `data-disabled` — 비활성 상태
- 키보드 인터랙션 WAI-ARIA 스펙 준수 (Enter 무시, Space 활성화 등)
- 숨겨진 native input으로 네이티브 form submit 지원

**⑧ 설계 5원칙** (`philosophy.md`)
> Accessible · Functional · Composable · Customizable · Interoperable

---

### 1-3. 두 라이브러리 비교

| 항목 | Radix UI | Headless UI |
|------|----------|-------------|
| 컴포넌트 수 | ~60개 | ~11개 |
| API 복잡도 | 높음 (compound) | 낮음 (단순) |
| Context 격리 | `createContextScope`로 완전 격리 | 없음 |
| Polymorphism | `asChild` / Slot | render props |
| 상태 노출 | `data-state` (CSS), context | render props |
| 프레임워크 | React only | React + Vue |
| 폼 통합 | 네이티브 input 버블링 | 기본 지원 |
| 애니메이션 | Presence (상태머신) | `Transition` 컴포넌트 |
| 번들 | 개별 패키지 (독립) | 단일 패키지 |
| 학습곡선 | 높음 | 낮음 |

---

## 2. 스택 결정 (90% 확립)

### 확정 사항

| 항목 | 선택 | 이유 |
|------|------|------|
| 언어 | TypeScript (strict) | 타입 안전성, 사용자 DX |
| 프레임워크 | React 18+ | 가장 큰 생태계 |
| 패키지 매니저 | **pnpm** | 워크스페이스 지원, 빠름, 디스크 절약 |
| 번들러 | **tsup** | ESM/CJS/d.ts 한 번에, 설정 간단 |
| 테스트 | **Vitest** + @testing-library/react | Jest 호환, 빠름 |
| 접근성 테스트 | **vitest-axe** (axe-core) | 자동 A11y 검증 |
| 문서 | **Storybook** | 컴포넌트 단위 개발/문서화 |
| 버저닝 | **Changesets** | 모노레포 버전 관리 자동화 |
| 린팅 | ESLint flat config + @typescript-eslint | 최신 설정 방식 |
| 포매팅 | Prettier | 최소 설정 |
| CI/CD | GitHub Actions | 무료, 통합 쉬움 |

### 핵심 도구 설명

#### tsup
esbuild 기반 번들러. TypeScript 라이브러리 배포에 특화되어 있다.

- ESM(`.mjs`) + CJS(`.js`) + 타입 선언(`.d.ts`) 세 가지를 **명령어 하나**로 빌드
- 설정 파일 없이도 동작 (`tsup src/index.ts --format esm,cjs --dts`)
- 내부적으로 esbuild를 쓰므로 빠름
- Radix는 esbuild + tsup을 분리해 쓰지만, 우리는 tsup만으로 통일

```ts
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react'],
});
```

#### Storybook
컴포넌트를 **앱 없이 독립적으로 개발·문서화**하는 도구.

- 각 컴포넌트의 상태(checked, disabled, open 등)를 story로 정의해두면 브라우저에서 바로 확인 가능
- `args` / `argTypes`로 props를 UI에서 실시간 조작 (Controls 패널)
- MDX로 사용법 문서 작성 가능 → 컴포넌트 개발과 문서화를 동시에
- `@storybook/addon-a11y`로 접근성 자동 검사도 가능

```tsx
// checkbox.stories.tsx
export const Checked: Story = {
  args: { checked: true, disabled: false },
};
```

#### Changesets
모노레포에서 **패키지별 버전 관리와 changelog 자동화**를 담당.

- PR 작성 시 `.changeset/랜덤이름.md` 파일을 같이 커밋
  - 어떤 패키지가 어떤 종류(major/minor/patch)로 바뀌었는지 기록
- 배포 시 `changeset version` 실행 → 각 패키지 `package.json` 버전 자동 올림 + `CHANGELOG.md` 생성
- 이후 `pnpm publish -r` 로 변경된 패키지만 npm 배포

```
# .changeset/brave-dogs-fly.md
---
"@bamti/checkbox": patch
---

Fix: indeterminate 상태에서 Space 키 동작 수정
```

> 핵심 흐름: **PR에 changeset 추가 → merge → `version` 명령으로 버전 반영 → npm publish**

---

### 미확정 사항 (~10%)

- **모노레포 툴링**: pnpm workspaces만 쓸지 vs Turborepo 추가할지
  - 추천: 초기에는 pnpm only, 빌드 캐시 필요해지면 Turborepo 추가
- **E2E 테스트**: Playwright vs Cypress
  - 추천: Playwright (더 빠르고 모던)
- **React 버전 지원 범위**: 18+ only vs 16.8+
  - 추천: 18+ (Concurrent features 활용 가능, 레거시 부담 없음)

---

## 3. 모노레포 설계 방향성

### 디렉토리 구조 (Radix 참고 + 단순화)

```
my-ui-lib/
├── packages/
│   ├── react/                  # React 컴포넌트들
│   │   ├── button/
│   │   │   ├── src/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── button.test.tsx
│   │   │   │   └── index.ts       # public API
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   ├── dialog/
│   │   ├── checkbox/
│   │   ├── context/               # createContext 유틸
│   │   ├── compose-refs/          # useComposedRefs
│   │   ├── use-controllable-state/
│   │   └── slot/                  # asChild 패턴
│   └── core/                  # 프레임워크 무관 유틸
│       └── primitive/             # composeEventHandlers 등
├── apps/
│   └── storybook/             # 문서화 + 개발 환경
├── internal/
│   ├── typescript-config/
│   └── eslint-config/
├── pnpm-workspace.yaml
├── package.json
└── vitest.config.ts
```

### 핵심 결정사항

**패키지 granularity (세분화 수준)**
- Radix처럼 유틸리티까지 개별 패키지로 분리
- 이유: tree-shaking 최적화, 독립 버전 관리, 사용자가 필요한 것만 설치

**패키지 간 의존성**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/**/*'
  - 'apps/*'
  - 'internal/*'
```
```json
// 내부 패키지 참조
"dependencies": {
  "@my-lib/react-context": "workspace:*"
}
```

**빌드 전략**
- tsup으로 단순화 (esbuild + tsup 분리 대신 tsup만)
- 각 패키지가 독립적으로 빌드
- `publishConfig`로 배포 시 dist 경로 자동 치환

**버전 관리 전략**
- Changesets: PR마다 `.changeset/*.md` 파일 추가
- 배포: `changeset version` → `pnpm publish -r`
- 초기: 0.x 버전으로 시작, API 안정화 후 1.0

---

## 4. 헤드리스 컴포넌트 설계방향성

### 핵심 설계 원칙

**① 1 컴포넌트 = 1 DOM 노드**
사용자가 렌더링 결과를 예측 가능해야 함. Radix 철학.
```tsx
// ❌ 나쁨: 내부에서 여러 DOM 노드 생성
<Button /> // → <div><button>...</button></div>

// ✅ 좋음: 딱 하나
<Button /> // → <button>...</button>
```

**② Controlled/Uncontrolled 둘 다 지원**
`useControllableState` 훅으로 통일:
```tsx
// uncontrolled (내부 상태)
<Checkbox defaultChecked={false} />

// controlled (외부 상태)
<Checkbox checked={checked} onCheckedChange={setChecked} />
```

**③ asChild 패턴 (Slot)**
다형성(polymorphism)을 `as` prop 대신 `asChild`로:
```tsx
// as prop 방식 (타입 추론 어려움)
<Button as="a" href="...">Link</Button>

// asChild 방식 (타입 추론 완벽)
<Button asChild>
  <a href="...">Link</a>
</Button>
```

**④ 상태는 data-* 속성으로 노출**
CSS 스타일링을 render props 없이 가능하게:
```tsx
// 컴포넌트 내부
<button data-state={checked ? 'checked' : 'unchecked'} />

// 사용자 CSS
[data-state="checked"] { background: blue; }
```

**⑤ Context Scope로 중첩 격리**
같은 컴포넌트를 중첩해도 서로 간섭 없어야 함:
```tsx
<Accordion>
  <Accordion.Item>  // 이 Item이 자신의 Accordion context에만 접근
    <Accordion>     // 중첩 Accordion도 독립 동작
      <Accordion.Item />
    </Accordion>
  </Accordion.Item>
</Accordion>
```

**⑥ 네이티브 폼(form) 통합**
숨겨진 native input으로 브라우저 기본 동작 지원:
```tsx
// 사용자는 custom trigger만 보이지만
// form submit 시 값은 hidden input을 통해 전달
```

**⑦ WAI-ARIA 완전 지원**
- `role`, `aria-*` 속성 자동 처리
- 키보드 인터랙션 스펙 준수
- axe-core로 자동 검증

### 구현 순서 추천 (컴포넌트)

1. **기초 유틸**: `context`, `compose-refs`, `slot`, `use-controllable-state`, `primitive`
2. **1단계 컴포넌트** (단순): Button, Checkbox, Toggle, Switch, Label
3. **2단계 컴포넌트** (중간): Accordion, Tabs, Dialog, Collapsible
4. **3단계 컴포넌트** (복잡): Select, Combobox, Menu, Dropdown

---

## 5. 컨벤션 정하기

### 파일/폴더 네이밍

| 항목 | 규칙 | 예시 |
|------|------|------|
| 폴더명 | kebab-case | `compose-refs/`, `use-controllable-state/` |
| 파일명 | kebab-case | `checkbox.tsx`, `use-controllable-state.tsx` |
| 컴포넌트명 | PascalCase | `CheckboxRoot`, `DialogTrigger` |
| 훅 | camelCase + use prefix | `useControllableState`, `useComposedRefs` |
| 상수 | UPPER_SNAKE_CASE | `CHECKBOX_NAME = 'Checkbox'` |
| 타입 | PascalCase + Props suffix | `CheckboxProps`, `DialogContextValue` |

### 컴포넌트 내부 컨벤션

```tsx
// 1. 컴포넌트 이름 상수 (에러 메시지용)
const CHECKBOX_NAME = 'Checkbox';

// 2. Element 타입 alias
type CheckboxElement = React.ComponentRef<typeof Primitive.button>;

// 3. Props 타입 (베이스 props에서 확장)
type CheckboxProps = React.ComponentPropsWithoutRef<typeof Primitive.button> & {
  checked?: CheckedState;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
};

// 4. forwardRef + ScopedProps
const Checkbox = React.forwardRef<CheckboxElement, CheckboxProps>(
  ({ __scopeCheckbox, ...props }, forwardedRef) => {
    // ...
  }
);

// 5. displayName 필수
Checkbox.displayName = CHECKBOX_NAME;
```

### Public API (`index.ts`)

```tsx
'use client'; // Next.js App Router 지원

export {
  CheckboxRoot,
  CheckboxIndicator,
  // unstable_ prefix: 아직 안정화 안 된 내부 API
  CheckboxProvider as unstable_CheckboxProvider,
} from './checkbox';

export type {
  CheckboxProps,
  CheckedState,
};
```

### Git 컨벤션

```
feat: 새 기능
fix: 버그 수정
refactor: 리팩토링 (기능 변경 없음)
docs: 문서
test: 테스트
chore: 빌드/설정
```

브랜치: `feat/checkbox-indeterminate`, `fix/dialog-focus-trap`

### 접근성 컨벤션

- 모든 컴포넌트: axe-core 자동 테스트 필수
- `data-state` 속성: 모든 상태 컴포넌트에 노출
- `data-disabled`: disabled 상태 별도 속성
- `aria-hidden="true"`: 장식용 요소에 필수

---

## 6. 라이브러리 이름: 밤티UI

### 콘셉트

**"헤드리스보다 한 발짝 더 나간다"** — 스타일을 안 주는 게 아니라, 일부러 못생긴 기본 스타일을 제공한다.
개발자가 스타일을 입히지 않으면 진짜 밤티처럼 생긴 UI가 나온다. 원하면 props로 끌 수 있다.

```tsx
// 기본: 밤티스러운 기본 스타일 적용됨
<Button>클릭</Button>

// unstyled prop으로 기본 스타일 제거
<Button unstyled>클릭</Button>
```


### 패키지명

- `bamti-ui`
- `@bamti/react`
- `@bamti/core`

### 이전 후보 비교

| 이름 | 개념 | 결론 |
|------|------|------|
| 앙팡맨/호빵맨 | 스타일 갈아끼우기 | 일본 IP 연관, 탈락 |
| diyUI | 스타일은 너가해 | 너무 generic, 탈락 |
| Bibim (비빔) | 재료는 제공, 양념은 네가 | 글로벌 포지셔닝 우수하나 밤티에 밀림 |
| 밤티 | 기본이 밤티, 끄면 헤드리스 | 콘셉트가 이름에 녹아있음 |


---

## 참고: 핵심 파일 경로 (Radix-ui 레포)

| 파일 | 내용 |
|------|------|
| [packages/react/context/src/create-context.tsx](packages/react/context/src/create-context.tsx) | createContextScope 구현 |
| [packages/react/checkbox/src/checkbox.tsx](packages/react/checkbox/src/checkbox.tsx) | 컴포넌트 구현 전체 예시 |
| [packages/react/use-controllable-state/src/use-controllable-state.tsx](packages/react/use-controllable-state/src/use-controllable-state.tsx) | Controlled 상태 훅 |
| [packages/react/compose-refs/src/compose-refs.tsx](packages/react/compose-refs/src/compose-refs.tsx) | Ref 합성 유틸 |
| [packages/react/slot/src/slot.tsx](packages/react/slot/src/slot.tsx) | asChild/Slot 패턴 |
| [packages/react/presence/src/presence.tsx](packages/react/presence/src/presence.tsx) | 애니메이션 presence |
| [internal/builder/builder.js](internal/builder/builder.js) | esbuild + tsup 빌드 |
| [philosophy.md](philosophy.md) | 설계 철학 5원칙 |
| [.changeset/config.json](.changeset/config.json) | 버전 관리 설정 |
