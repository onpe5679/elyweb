# Implementation Plan - Dynamic Game Detail Sections & Company History

## Goal
To enhance the Game Detail page to support flexible, dynamic sections (resembling Wix-style layouts) and to add a Company History section to the About page.

## Proposed Changes

### 1. Data Modeling (Frontend Types)
We need to introduce a flexible `GameSection` structure.

**Location**: `apps/web/lib/supabase.ts`

```typescript
export type SectionType = 'info' | 'synopsis' | 'video' | 'store' | 'timeline' | 'gallery' | 'custom';

export type GameSection = {
  id: string;
  game_id: string;
  type: SectionType;
  title_ko?: string;
  title_en?: string;
  title_ja?: string;
  content: any; // JSON structure depending on type
  display_order: number;
  is_active: boolean;
};
```

*Note: Since we are in a pair-programming environment without direct DB migration access, we will assume these tables exist or interact with them if they do. For the purpose of this task, we will verify if we can fetch this data or if we need to mock it for the UI implementation.*

### 2. About Page - Company History
**Location**: `apps/web/app/[locale]/about/page.tsx`
- Fetch timeline events using `getTimelineEvents()`.
- Render a vertical timeline of company history.

### 3. Game Detail Page - Dynamic Sections
**Location**: `apps/web/app/[locale]/games/[slug]/page.tsx`
- Refactor to remove hardcoded `isSharehouse` checks.
- Fetch `sections` for the game.
- Iterate and render generic components based on `section.type`.

**New Components**:
- `apps/web/components/sections/SectionRenderer.tsx`
- `apps/web/components/sections/GameInfoSection.tsx`
- `apps/web/components/sections/SynopsisSection.tsx`
- `apps/web/components/sections/VideoSection.tsx`
- `apps/web/components/sections/StoreSection.tsx` (for Steam/Official links)

### 4. Game List & Ordering
- Ensure `getGames` respects `display_order`.
- Ensure `getNews` respects `is_featured` or order.

## Execution Steps
1.  **About Page**: Implement history section.
2.  **Refactor Game Detail**: Create section components.
3.  **Integrate**: Replace hardcoded content with dynamic section rendering.
