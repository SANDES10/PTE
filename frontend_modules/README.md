# 📂 Frontend Component Modules (`frontend_modules`)

This directory contains the complete modular frontend architectural breakdown for PTEMaster, organized by feature component modules.

---

## 🗺️ Component Module Directory Map

| Folder | Feature Focus | Key Files Included |
| :--- | :--- | :--- |
| [`01_Architecture_Theme_Routing`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/01_Architecture_Theme_Routing) | Core Vite Setup, Tailwind Tokens, Theme Provider, Wouter Routing | `index.css`, `main.tsx`, `App.tsx`, `ThemeContext.tsx`, `trpc.ts` |
| [`02_Navigation_Layouts_UI_Primitives`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/02_Navigation_Layouts_UI_Primitives) | Master `PTELayout`, Responsive Dark Sidebar, Mobile Drawer, Radix UI Primitives | `PTELayout.tsx`, `DashboardLayout.tsx`, `ErrorBoundary.tsx`, `ui/*` |
| [`03_Landing_Page_and_Auth`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/03_Landing_Page_and_Auth) | Marketing Landing Page, Hero Section, Login & Auth Callback | `Home.tsx`, `Login.tsx`, `AuthCallback.tsx` |
| [`04_Dashboard_and_Progress_Overview`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/04_Dashboard_and_Progress_Overview) | Student Dashboard, Target Score Gauges, Study Streaks, Animated Counters | `Dashboard.tsx`, `AnimatedCounter.tsx`, `SkeletonLoader.tsx` |
| [`05_Speaking_Practice_Interface`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/05_Speaking_Practice_Interface) | Practice Hub, Collapsible Task Type Cards, Speaking Task Module | `Practice.tsx`, `SpeakingTask.tsx` |
| [`06_Audio_Recording_and_Live_Waveform`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/06_Audio_Recording_and_Live_Waveform) | Audio Stream Engine, Real-time Web Speech Transcript, Circular Timers | `PracticeSession.tsx`, `AnimatedProgressBar.tsx` |
| [`07_AI_Feedback_and_Scoring_UI`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/07_AI_Feedback_and_Scoring_UI) | Trait Scoring (Pronunciation/Fluency/Content), Error Highlights, Confetti | `AIFeedbackPanel.tsx`, `ScoreReport.tsx`, `ConfettiCelebration.tsx` |
| [`08_Mock_Test_Exam_Simulator`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/08_Mock_Test_Exam_Simulator) | Pearson-Style Timed Exam Interface, Section Navigator & Question Drawer | `MockTest.tsx` |
| [`09_Analytics_and_AI_Coaching`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/09_Analytics_and_AI_Coaching) | Performance Radar Charts, AI Study Roadmap, AI Chat Assistant, Pearson Docs | `Analytics.tsx`, `CoachingPlan.tsx`, `AIChatBox.tsx`, `Resources.tsx` |
| [`10_Profile_Pricing_and_Admin`](file:///media/sandesh/NewVolume/New%20Folder/PTE/frontend_modules/10_Profile_Pricing_and_Admin) | User Profile, Subscription Pricing (eSewa/Khalti), System Admin Panels | `Profile.tsx`, `Pricing.tsx`, `PaymentHistory.tsx`, `AdminDashboard.tsx`, `SystemAdminPanel.tsx` |
