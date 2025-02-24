# Implementing Toast Notifications

This document provides a step-by-step outline to integrate **toast-based** notifications into the SupaSupa application. We'll use checkboxes `[ ]` so that each item can be ticked `[x]` once completed.

---

## Overview

We want to display short, easily dismissible pop-up messages (toasts) that appear briefly to inform users about successful actions like:
- Award redemption
- Bonus award assignment
- Task completion/approval
- Errors or warnings

Below is a structured plan for adding these toast notifications:

---

## 1. Choose a Toast Library or Framework

We need a React-based toast library. Common choices:
- [x] [React Hot Toast](https://react-hot-toast.com/) ✅ Selected
- [ ] [React Toastify](https://fkhadra.github.io/react-toastify/)
- [ ] A custom solution with your own "toast" component

**Tasks:**
- [x] **Pick a library** that suits your needs or confirm a custom solution
- [x] **Add the library** to the project via `pnpm add react-hot-toast`

---

## 2. Configure a Global Provider

- [x] Import the toast library
- [x] Place the global toast container (<Toaster />) in layout.tsx
- [x] Create a utility file (src/utils/toast.ts) for consistent toast usage

---

## 3. Identify Key User Actions that Trigger Toasts

Review each "success" or "error" scenario and decide where you want a toast to appear:
- [x] Child redeems an award
- [x] Parent approves/rejects a task
- [x] Parent awards bonus
- [x] Errors (like insufficient points, invalid form input, etc.)

**Tasks:**
- [x] List all events needing a toast
- [x] Locate relevant function calls in code

## 4. Inject Toast Calls in Success/Failure Handlers

- [x] Task/Quest completion and approval (QuestCard.tsx)
- [x] Award redemption (AwardCard.tsx)
- [x] Task creation (AddTask.tsx)
- [x] Bonus award management (BonusAwardCard.tsx, AddBonusAward.tsx)
- [x] Child account management (ChildAccountCard.tsx)

For each event, call the toast library method, for example toast.success("Message") or toast.error("Message"). Typically:

import { toast } from 'react-hot-toast';

// Inside success handler
toast.success("Points redeemed successfully!");

// Inside error handler
toast.error("An error occurred while redeeming points.");

Where to Insert Toasts
	1.	Task Completion or Approval
	•	[x] Possibly in handleTaskCompletion in DashboardPage or a repository success callback
	•	[x] E.g. after updating a child's points, show a success toast
	2.	Award Redemption
	•	[x] Inside the function that runs the deduct_points RPC
	•	[x] E.g. in onClaim callback in Awards page or after the DB call
	3.	Bonus Award Issued
	•	[x] In the handleAwardBonus or awardBonusToChild method
	•	[x] Show a toast: "Bonus successfully awarded!"
	4.	Error Cases
	•	[x] Catch blocks or error checks in repository calls
	•	[x] E.g. setError(...) plus toast.error("Could not complete action")

Tasks:
	•	[x] Import the toast method (e.g. import { toast } from 'react-hot-toast')
	•	[x] Add toast.success(...) or toast.error(...) calls in success/failure callbacks
	•	[x] Ensure the logic is consistent (avoid double-notifications)

5. Customize Toast Appearance (Optional)

Most libraries allow custom styling, icons, or positions. For instance, in React Hot Toast:

toast.success("Points redeemed", {
	position: "top-right",
	style: {
	border: "1px solid #ffed4a",
	padding: "16px",
	color: "#713200",
	},
});

Tasks:
	•	[x] Check docs for customizing the toast position and styling
	•	[x] Experiment with a style that matches your design

6. Handle Edge Cases & Additional Considerations
	•	[x] Preventing Double Toasts: If a function calls multiple success states, ensure you only toast once.
	•	[x] Async Calls: Some libs have loading toasts or "promise" toasts that update from pending to success or error.
	•	[x] Testing: Use actual usage flows to confirm your toasts appear at the right times.

Tasks:
	•	[x] Test triggers thoroughly to avoid spamming or missing toasts
	•	[x] Refine messaging for clarity

7. Summaries and Next Steps

Your codebase should now show toast messages during key user actions. If you want more advanced patterns (like enqueuing or advanced animations), consider library-specific APIs or building a custom toast store.

Recap: Implementation Checklist

Here's a quick review of tasks:
	1.	Install Toast Library
	•	[x] Add the chosen package (e.g., react-hot-toast)
	2.	Global Configuration
	•	[x] Add <Toaster /> (or equivalent) to a global layout or root
	3.	Add Toast Calls in Key Handlers
	•	[x] Task approve/reject
	•	[x] Award redemption
	•	[x] Bonus awarding
	•	[x] Any notable success or error
	4.	Customize & Verify
	•	[x] Adjust styling or positions
	•	[x] Confirm correct usage via testing
	•	[x] Verify no overlapping or redundant toasts

Conclusion
Following these steps, you can elegantly integrate toast notifications for all your critical user actions. Once you confirm the final approach, check off each [ ] as [x] to keep track of your progress.

✅ **Implementation Complete!** Toast notifications have been successfully integrated into the SupaSupa application. All key user interactions now provide immediate feedback through toast notifications, enhancing the overall user experience.

Key components updated:
- QuestCard.tsx - Task completion and approval notifications
- AwardCard.tsx - Award redemption notifications
- AddTask.tsx - Task creation notifications
- BonusAwardCard.tsx - Bonus award management notifications
- AddBonusAward.tsx - Bonus award creation notifications
- ChildAccountCard.tsx - Child account management notifications

The toast utility (src/utils/toast.ts) provides a consistent interface for showing notifications throughout the application, making it easy to maintain and extend in the future.