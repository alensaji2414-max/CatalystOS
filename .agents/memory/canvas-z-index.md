---
name: Canvas z-index stacking bug
description: ParticleBackground canvas at z-0 paints over non-positioned main content in CSS stacking order
---

## Rule
Always ensure the main content area has `relative z-[1]` (or higher) when a canvas with `z-0` (position: fixed) is used as a background.

**Why:** In CSS stacking order, positioned elements at z-index:0 are in step 6 (paint after non-positioned block elements in step 3). A canvas at `className="fixed inset-0 z-0"` with per-frame dark fillRect will visually cover all non-positioned content, making it nearly invisible. The content only "appears" when cursor movement shifts particles, creating lighter patches. The bug is subtle because Framer Motion components with opacity animations create their own stacking contexts (opacity != 1), which can accidentally fix the issue for animated components while leaving plain-HTML components invisible.

**How to apply:** In StudyOS.tsx, `<main>` has `relative z-[1]`. If the canvas z-index is ever changed, ensure main is always at a higher z-index. Do NOT remove `relative z-[1]` from `<main>`.
