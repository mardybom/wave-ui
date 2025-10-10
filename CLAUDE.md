# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wave-ui** is a Vue 3 educational web application designed to help children with dyslexia learn through interactive games and activities. The app provides various learning modules including letter-sound mapping, digital writing practice, sentence rearranging, and picture-word matching. It also features a parent hub with a chatbot to answer questions about dyslexia.

**Technology Stack:**
- Vue 3 with Composition API (`<script setup>`)
- Vite for build tooling
- Vue Router for navigation
- Axios for API requests
- vue3-beautiful-chat for chatbot functionality
- Canvas-based drawing interactions
- Azure Static Web Apps for hosting (see `staticwebapp.config.json`)

**Node Requirements:**
- Node.js ^20.19.0 || >=22.12.0

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture & Key Concepts

### Routing Structure

The application uses Vue Router with history mode. Key routes are defined in `src/router/index.js`:

- `/` - HomePage (landing page)
- `/learn` - StartLearningPage (game selection hub)
- `/parents` - ParentsHubPage (FAQ/myths and chatbot)
- `/letter-sound` - LetterSoundMappingPage
- `/Digital-writing` - DigitalWritingPage (main handwriting practice game)
- `/sentence-rearranging` - SentenceRearrangingPage
- `/image-labelling` - ImageLabellingPage
- `/docs-converter` - DocsConverterPage
- `/iteration1`, `/iteration2` - External redirects to Azure Static Apps

**Router Configuration:**
- Auto-scrolls to top on route change with 100ms delay
- Uses lazy-loading for StartLearningPage and ParentsHubPage
- Catches all unmatched routes and redirects to home

### Path Aliases

The project uses `@` as an alias for the `src` directory:
```javascript
import Component from '@/components/Component.vue'
```

### Application Entry Point

`src/main.js` initializes the app:
1. Imports global CSS (`main.css`, `fonts.css`)
2. Registers `animate.css` for animations
3. Registers `vue3-beautiful-chat` plugin globally
4. Mounts the router and app to `#app`

### Component Organization

**Pages** (`src/pages/`):
- Top-level route components representing full screens
- Each page typically imports its own sub-components

**Components** (`src/components/`):
- Organized by feature (e.g., `StartLearningPage/`, `DigitalWritingPage/`, `ParentsHub/`)
- Shared components at root level (NavBar.vue, ChatBot.vue, etc.)

### Digital Writing Game Architecture

The DigitalWritingPage (one of the main features) implements a complex interactive learning system:

**Core Flow:**
1. User selects case (capital/small) and level (1 or 2 letters)
2. Letter is displayed with optional ghost tracing guide
3. Audio prompts play letter sounds (files from `/audio/letters/`)
4. User draws on canvas using `DrawingPad.vue` component
5. Canvas data is captured and sent to backend API at `https://wave-api-monashie.azurewebsites.net/alphabet_mastery`
6. API validates the handwriting and returns feedback
7. Progress tracking with stars and medals (Bronze at 5 stars, Silver at 10, Gold at 15)

**State Management:**
- Uses Vue reactive refs and computed properties
- Session storage for reward persistence (`dw_rewards_session_v1`)
- Timer-based idle prompts that trigger every 10 seconds
- Dynamic DOM manipulation for star tracker and modal UI

**Key Functions:**
- `captureAndBuildJson()` - Captures canvas, resizes to 1920×1080, sends to API
- `playAudio()` - Sequential audio playback for each letter
- `startPromptCycle()` / `stopPromptCycle()` - Manages idle prompting system
- `awardStar()` - Increments stars and checks for milestone achievements

### ChatBot System (ParentsHubPage)

The chatbot integrates with a backend API to answer dyslexia-related questions:

**API Endpoint:**
- Uses environment variable `VITE_API_SENTENCE` as base URL
- Posts to `/parent_chat` with `{ question, kb_hit }`
- Response format: `{ data: { answer, sources, disclaimer } }`

**Response Processing:**
1. Extracts answer, sources (markdown links), and disclaimer
2. Inserts zero-width no-break space (`\u2060`) in source labels to prevent auto-linking
3. Reformats sources as `text(url)` to keep URLs clickable
4. Hides disclaimer if answer is refusal message
5. Displays formatted response in chat interface

**ChatBot Component** (`src/components/ChatBot.vue`):
- Wraps `vue3-beautiful-chat` library
- Supports resizable chat window (30%, 50%, 70% width via toggle button)
- Custom theme with specific colors (#38b3ec for header, #c1f9c8 for sent messages, #cfeffe for received)
- Dynamic DOM injection for resize button with SVG icon
- Typing indicator during API calls

### UI Patterns & Theming

**Sky Wave Background:**
Many pages feature an animated wave SVG background at the top:
```html
<div class="sky" aria-hidden="true">
  <svg class="wave" viewBox="0 0 1440 220" preserveAspectRatio="none">
    <path d="..." fill="#CFEFFF"/>
  </svg>
</div>
```

**Custom Dropdowns:**
Pages like DigitalWritingPage use custom dropdown components with:
- `.dropdown` wrapper with `data-open` attribute
- `.dropdown-trigger` button with prefix/value/caret layout
- `.dropdown-menu` with `.dropdown-option` items
- Icon, label, check mark, and sub-help text structure
- Close on outside click and Escape key

**Game UI Components:**
- `GameTopBar.vue` - Common header for game pages
- `GameTitleNDescribe.vue` - Title and description display
- `Timer.vue` / `TimerMMSS.vue` - Countdown timers for games
- `WaveHeader.vue` - Decorative wave header

### Assets & Media

**Images:**
- Character assets: `hibby_*.png` (hippo mascot), `squirrel_*.png`, `avatar-squirrel.png`
- Feedback icons: `star_2.png`, `hibby_feedback.png`
- Badges: `bronze.png`, `silver.png`, `gold.png`
- Background images for button cards in StartLearningPage

**Audio:**
- Letter pronunciation files expected at `/public/audio/letters/{letter}.mp3`

**Videos:**
- Success animations: `hibby_success.mp4`

### API Integration

**Backend Base URL:**
Set via environment variable `VITE_API_SENTENCE` (typically points to Azure-hosted API)

**Endpoints:**
- `/parent_chat` - Chatbot question answering
- `https://wave-api-monashie.azurewebsites.net/alphabet_mastery` - Handwriting validation

**Payload Format (Digital Writing):**
```json
{
  "expected_letter": "A" or "AB",
  "canvas_input": "base64-encoded-png-data",
  "is_capital": "capital" or "small",
  "level": "easy" or "hard"
}
```

**Response Format (Digital Writing):**
```json
{
  "is_correct": true/false,
  "detected_count": number
}
```

## Important Development Notes

### Environment Variables

Create a `.env.local` file (not committed) with:
```
VITE_API_SENTENCE=https://your-backend-url.com
```

### Git Branching

- Main branch: `main`
- Current working branch: `prasanthi`
- Recent work includes chatbot integration and StartLearningPage button cards

### Code Style

- Components use Vue 3 Composition API with `<script setup>`
- Extensive inline documentation in both English and Chinese
- Accessibility attributes (aria-label, aria-hidden, role, etc.) are used throughout
- Scoped styles with CSS custom properties for theming
- Responsive design with media queries (breakpoint typically at 980px)

### Canvas & Drawing

The DrawingPad component (`src/components/DigitalWritingPage/DrawingPad.vue`) handles touch/mouse input for letter tracing:
- Canvas resized to 1920×1080 before API submission
- Background filled white, original drawing centered and scaled to fit
- Image smoothing enabled for quality

### Modal System

Custom modal overlays used throughout:
- `.modal-overlay` with backdrop blur
- Popup dialogs with close buttons (`.close-x`)
- Result modals for correct/incorrect feedback
- Milestone modals for achievement celebration
- Dynamic star display rows injected into modals

### Accessibility

- Navigation uses semantic HTML and ARIA attributes
- Buttons have descriptive aria-labels
- Decorative elements marked with aria-hidden
- Dropdowns use role="listbox" and aria-expanded

### Known Quirks

- Audio playback uses global `Audio()` instances, may need user interaction to start
- Idle prompt system stops on user interaction (pointer/keyboard events)
- Rewards reset on page mount (session-based, not persistent)
- Ghost tracing guide appears for 3 seconds after audio prompt
- Modal star animations use requestAnimationFrame for smooth transitions
