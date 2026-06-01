---
name: Component defined inside parent function causes remount on every re-render
description: Defining a React component as a const inside another component's function body causes all instances to unmount/remount on every parent re-render
---

## Rule
Never define React components inside another component's function body. Always define at module scope or in a separate file.

**Why:** Each render of the parent creates a new function reference for the inner component. React compares component types by reference, so it sees a "new" component type and unmounts/remounts all instances. This resets all state and re-triggers Framer Motion initial animations (opacity: 0). QuestCard was defined inside QuestSystem, causing quest cards to flash from invisible to visible on every zustand store update.

**How to apply:** Move QuestCard (and any similar inner components) to module scope with explicit props. Functions that only use data (getTimeRemaining) can also move to module scope. The QuestCard interface now requires: quest, index, boosts, claimingId, subjects, onClaimReward.
