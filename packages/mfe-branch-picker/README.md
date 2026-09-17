# @nuskin/mfe-branch-picker

CMS-agnostic **preview branch store** and **picker UI** for Nu Skin MFEs.

The package does not import Contentstack (or any CMS). Header MFE and Site Visual Builder pass their own storage keys, editing detection, and branch list. Other hosts can do the same.

**Repo:** [mfe-utils](../../README.md) · **Peers:** `react` ^18.2.0, `react-dom` ^18.2.0

Hosts still own CMS stack recreation and content fetch after a branch change.

## Install

From this monorepo (until published):

```bash
cd mfe-utils
yarn
yarn workspace @nuskin/mfe-branch-picker build
```

In a host:

```json
{
  "dependencies": {
    "@nuskin/mfe-branch-picker": "file:../mfe-utils/packages/mfe-branch-picker"
  }
}
```

Published:

```bash
yarn add @nuskin/mfe-branch-picker
```

## When to use it

Show a required picker when Visual Builder loads with **no stored branch**, then a sticky settings control so the author can switch branches later.

Typical host flow:

1. If `needsBranchSelection()` → open the modal with `required` and **do not fetch content**.
2. On select (or cancel → default `main`) → `setPreviewBranch`, then recreate the CMS stack and fetch.
3. Keep `BranchSettingsButton` mounted so the author can change branch without a full page chrome.

## Store

```ts
import { createPreviewBranchStore } from '@nuskin/mfe-branch-picker';

const branchStore = createPreviewBranchStore({
  storageKey: `header-preview-branch:${process.env.CONTENTSTACK_API_KEY}`,
  defaultBranch: 'main',
  isEditing: () => window.parent !== window,
  // eventName: 'header-preview-branch-changed', // optional override
});

branchStore.needsBranchSelection();
branchStore.getCurrentBranch();
branchStore.setPreviewBranch('develop');
```

### `createPreviewBranchStore(options)`

| Option | Type | Default | Meaning |
|--------|------|---------|---------|
| `storageKey` | `string` | required | `sessionStorage` key. Scope it per app + stack so hosts do not collide. |
| `defaultBranch` | `string` | `'main'` | Used when not editing, and when the stored value is empty. |
| `isEditing` | `() => boolean` | required | Host decides what “preview/authoring” means (iframe, query flag, etc.). |
| `eventName` | `string` | `'mfe-preview-branch-changed'` | `CustomEvent` name on `window`. |

### Store methods

| Method | Behavior |
|--------|----------|
| `needsBranchSelection()` | `true` in editing mode until a branch is stored or `setPreviewBranch` has run. Always `false` when not editing or on the server. |
| `getCurrentBranch()` | In editing mode, restores from `sessionStorage`. Outside editing, always returns `defaultBranch` and ignores storage. |
| `setPreviewBranch(branch)` | Sets in-memory branch. In editing mode, writes `sessionStorage` and dispatches the window event. Returns the applied branch (`''` becomes `defaultBranch`). |

`sessionStorage` failures (restricted iframes) are ignored; the in-memory branch still updates.

### Sync event

```ts
window.addEventListener('mfe-preview-branch-changed', (event) => {
  const branch = event.detail.branch;
});
```

Use this when the same page can mount the picker more than once.

## UI

```tsx
import {
  BranchSelectorModal,
  BranchSettingsButton,
} from '@nuskin/mfe-branch-picker';

<BranchSettingsButton
  currentBranch={branchStore.getCurrentBranch()}
  onOpenSettings={() => setShowPicker(true)}
/>

<BranchSelectorModal
  isOpen={showPicker}
  required={branchStore.needsBranchSelection()}
  currentBranch={branchStore.getCurrentBranch()}
  options={[
    { id: 'main', label: 'Main' },
    { id: 'develop', label: 'Develop' },
  ]}
  onSelect={(id) => {
    branchStore.setPreviewBranch(id);
    reloadContent();
  }}
  onCancel={() => {
    branchStore.setPreviewBranch('main');
    setShowPicker(false);
  }}
/>
```

### `BranchSelectorModal`

Portals a `<dialog>` to `document.body`.

| Prop | Type | Default | Meaning |
|------|------|---------|---------|
| `isOpen` | `boolean` | required | Show or hide. |
| `onSelect` | `(branch: string) => void` | required | Confirm with the highlighted option. |
| `onCancel` | `() => void` | required | Dismiss. Host should default the branch if `required`. |
| `required` | `boolean` | `true` | Required copy vs settings copy; also changes title/description defaults. |
| `currentBranch` | `string \| null` | — | Preselects an option. |
| `options` | `{ id: string; label: string }[]` | Main / Develop | Branch list. |
| `title` | `string` | from `required` | Dialog heading override. |
| `description` | `string` | from `required` | Body copy override. |

Default titles:

- required: “Select preview branch”
- settings: “Preview settings”

### `BranchSettingsButton`

Portals a fixed control to `document.body` (top-left). Renders `null` during SSR.

| Prop | Type | Meaning |
|------|------|---------|
| `onOpenSettings` | `() => void` | Opens the modal. |
| `currentBranch` | `string \| null` | Shown next to the gear. Hidden when empty. |

`aria-label` is `Open preview settings`.

## Constants

```ts
import {
  DEFAULT_BRANCH,                 // 'main'
  PREVIEW_BRANCH_CHANGED_EVENT,  // 'mfe-preview-branch-changed'
  DEFAULT_BRANCH_OPTIONS,
  BRANCH_MODAL_Z_INDEX,
  BRANCH_SETTINGS_Z_INDEX,
} from '@nuskin/mfe-branch-picker';
```

## Host checklist

- Recreate the CMS client when the branch changes (this package does not).
- Block data fetch while `needsBranchSelection()` is true.
- Use a unique `storageKey` per MFE / stack.
- Do not treat this as Contentstack-only: pass whatever branch ids your preview environment uses.
