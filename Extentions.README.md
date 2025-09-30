Extentions overview

LoadingAnimationExtention
- A lightweight Voiceflow web-widget extension that displays a spinner with rotating status messages while the assistant processes a request. It supports distinct phases (analysis, output, all) and message sets by type (SMT, KB, KB_WS, OTHER, SWEARS). Language is auto-detected from the payload (cs/en). Duration is configurable, with slightly extended defaults for smoother UX. The component automatically hides once the AI reply appears to keep the conversation flow clean.

Key capabilities:

* Phase-aware messaging with per-type copy sets
* Language auto-selection (cs/en)
* Configurable total duration
* Automatic shutdown when an AI message renders

SelectExtention
- An inline single-select dropdown extension for collecting exactly one choice from a provided list. It renders inside the chat card with smooth expand/collapse and a scrollbar for longer lists, so the layout does not jump. On confirm it returns the selected value as a string; on cancel it emits a cancel event. Labels localize to cs/en. Styling uses brand orange accents (#FF4F00), with a 20 px container radius, 10 px button radius, gradient hover on confirm, and a neutral grey cancel for accessible UI.

Key capabilities:

* Single-choice capture with clean confirm/cancel semantics
* In-card dropdown with smooth transitions and scroll for long lists
* Localized labels (cs/en)
* Consistent visual design aligned to brand colors
