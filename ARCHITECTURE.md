# Warrior Timer Architecture

## Overview
A Rails 7.1 web application for interval workout timers with URL-based configuration. Users define workouts using a custom DSL syntax in the URL, eliminating the need for a database.

## Tech Stack
- **Framework**: Rails 7.1.6
- **Ruby**: 3.1.2
- **Frontend**: Hotwire (Turbo + Stimulus), Importmaps
- **Styling**: Tailwind CSS v4 (via npm)
- **Components**: ViewComponent
- **Testing**: RSpec with Factory Bot and Shoulda Matchers
- **Deployment**: Fly.io
- **CI/CD**: GitHub Actions

## Core Architecture

### URL-Based Configuration
Workouts are defined entirely in the URL path:
```
/timer/10(30w30r)          # 10 rounds of 30s work, 30s rest
/timer/5mwu+8(20w10r)+2mcd # Full workout with warmup/cooldown
/timer/(30w30r)*[Squat,Bench,Press] # Named segments
```

### Interval Syntax DSL

**Segment Types:**
- `w` = work
- `r` = rest
- `wu` = warmup
- `cd` = cooldown
- `p` = prepare

**Time Formats:**
- `30` = 30 seconds
- `5m` = 5 minutes
- `1:30` = 1 minute 30 seconds

**Sequencing:**
- `30w+30r` or `30w30r` = consecutive segments (+ is optional)
- `10(30w30r)` = repeat pattern 10 times
- `3(2(30w15r)60r)` = nested repetitions

**Named Segments:**
- `30w[Squat]` = inline naming
- `(30w30r)*[A,B,C]` = circuit shorthand (names applied to work segments in order)
- `4((30w30r)*[Squat,Bench,Press])` = nested circuit with repetition
- Spaces in names auto-convert to hyphens in URLs for clean display

### Service Layer

#### `Intervals::Parser` (`app/services/intervals/parser.rb`)
**Responsibility**: Parse interval syntax strings into structured segment data

**Key Methods:**
- `#parse` - Main entry point, returns array of segment hashes
- `#parse_sequence` - Handles + separated segments
- `#parse_part` - Handles repetitions and circuit shorthand
- `#tokenize_concatenated` - Splits concatenated segments
- `#parse_segment` - Parses individual segment with duration and type
- `#apply_names_to_circuit` - Distributes names to work segments in circuits
- `#decode_name` - Converts hyphens/underscores to spaces

**Output Format:**
```ruby
{ type: :work, duration: 30, name: "Squat", repetition: true }
```

#### `Intervals::Expander` (`app/services/intervals/expander.rb`)
**Responsibility**: Add metadata to parsed segments (round numbers, indices)

**Key Methods:**
- `#expand` - Main entry point, returns array with metadata
- `#chunk_by_round` - Groups segments into rounds
- `#build_expanded_segments` - Adds round_number, total_rounds, indices

**Output Format:**
```ruby
{
  segment_type: :work,
  duration_seconds: 30,
  name: "Squat",
  round_number: 1,
  total_rounds: 8,
  segment_index: 0,
  total_segments: 16
}
```

### Controller Layer

#### `TimersController`
- `#index` - Home page with interval builder
- `#show` - Timer page, parses intervals param and renders timer

**Routing:**
```ruby
get '/timer/:intervals', to: 'timers#show', as: :timer, constraints: { intervals: /[^\/]+/ }
```
The constraint `{ intervals: /[^\/]+/ }` allows any characters except forward slash in the URL path.

#### `ProtocolsController`
- `#index` - Displays curated library of training protocols grouped by category
- Protocol data is defined directly in controller (no database)

#### `ApiController`
- `#parse_intervals` - JSON endpoint for live preview parsing

### View Components

#### `Timer::DisplayComponent`
**Purpose**: Renders the main timer display with segment timeline

**Key Methods:**
- `#segments_json` - Serializes segments for JavaScript
- `#segment_color_for(type)` - Maps segment type to Tailwind classes
- `#segment_label(segment)` - Formats display label (shows custom name if present)
- `#format_time(seconds)` - Formats time as "5:30" or "45s"

#### `Timer::ControlsComponent`
**Purpose**: Timer controls (start/stop/reset) and workout preview

**Features:**
- Start/Stop/Reset buttons
- Metronome BPM control
- Workout preview (hides when timer running)
- Current workout editor

#### `ProtocolPreview::ProtocolPreviewComponent`
**Purpose**: Visual color-coded bar showing workout structure

**Features:**
- Proportional segment widths based on duration
- Color-coded by segment type
- Hover tooltips with segment info
- Visible borders between segments

### Stimulus Controllers

#### `timer_controller.js`
**Purpose**: Main timer logic and state management

**Key Methods:**
- `connect()` - Initialize timer
- `start()` - Start countdown
- `pause()` - Pause timer
- `reset()` - Reset to beginning
- `tick()` - Countdown logic (called every second)
- `updateDisplay()` - Update UI with current segment info
- `updateBackgroundColor()` - Set body color based on segment type
- `resetBackgroundColor()` - Restore default bg-slate-900
- `playSound()` - Audio cues for transitions
- `toggleMetronome()` - Start/stop metronome during work segments

**Audio System:**
- Uses Web Audio API for beeps and metronome
- Different tones for countdown, transitions, completion
- Metronome only plays during work segments

#### `interval_builder_controller.js`
**Purpose**: Live preview on home page

**Key Methods:**
- `parse()` - Fetch parsed intervals from API
- `showPreview()` - Display visual timeline and statistics
- `goToTimer()` - Navigate to timer page
- Auto-converts spaces to hyphens in URLs

### Database
**None!** This is a stateless application. All configuration is in URLs.

### Styling System

**Tailwind CSS v4** via npm (not asset pipeline)

**Color Scheme (Dark theme):**
- Background: `bg-slate-900`
- Prepare: `bg-amber-500` (amber/yellow)
- Warmup: `bg-orange-500` (orange)
- Work: `bg-red-600` (red)
- Rest: `bg-emerald-500` (green)
- Cooldown: `bg-sky-500` (blue)

**Build Process:**
```bash
npm run build:css # Builds to app/assets/builds/application.css
```

## File Structure

```
app/
├── controllers/
│   ├── api_controller.rb              # JSON API for parsing
│   ├── protocols_controller.rb        # Training protocol library
│   └── timers_controller.rb           # Main timer pages
├── services/
│   └── intervals/
│       ├── parser.rb                  # DSL parser
│       └── expander.rb                # Metadata enrichment
├── components/
│   ├── protocol_preview/
│   │   ├── protocol_preview_component.rb
│   │   └── protocol_preview_component.html.erb
│   └── timer/
│       ├── controls_component.rb
│       ├── controls_component.html.erb
│       ├── display_component.rb
│       └── display_component.html.erb
├── javascript/
│   └── controllers/
│       ├── interval_builder_controller.js
│       └── timer_controller.js
└── views/
    ├── timers/
    │   ├── index.html.erb             # Home page with builder
    │   └── show.html.erb              # Timer display
    └── protocols/
        └── index.html.erb             # Protocol library

spec/
├── services/
│   └── intervals/
│       ├── parser_spec.rb             # 44 examples
│       └── expander_spec.rb
├── requests/
│   ├── timers_spec.rb
│   └── protocols_spec.rb
└── system/
    └── all_protocol_codes_spec.rb     # Validates all protocols
```

## Key Design Decisions

### Why URL-based configuration?
- **Shareable**: Send a workout as a single URL
- **Bookmarkable**: Save favorite workouts
- **No authentication needed**: No user accounts required
- **Stateless**: Scales infinitely
- **PWA-friendly**: Works offline with cached assets

### Why ViewComponent?
- **Testable**: Components can be unit tested
- **Reusable**: DRY principle for UI elements
- **Namespaced**: Organized in folders (e.g., `Timer::`, `ProtocolPreview::`)

### Why Service Objects?
- **Single Responsibility**: Parser and Expander have distinct jobs
- **Testable**: Easy to unit test complex parsing logic
- **Reusable**: Used by controller, API, and components

### Why No Database?
- **Simplicity**: No migrations, seeds, or backups
- **Speed**: Zero query time
- **Scalability**: No database bottlenecks
- **Portability**: Easy to deploy anywhere

## Testing Strategy

**Test Coverage: 53 examples, 0 failures**

### Unit Tests
- `Parser` - 44 tests covering all syntax variations
- `Expander` - Tests for metadata enrichment

### Integration Tests
- Timer routes - Validates URL handling
- API endpoints - JSON response format

### System Tests
- `all_protocol_codes_spec.rb` - Validates every protocol in the library works

## Deployment

**Platform**: Fly.io

**Build Steps:**
1. Install Ruby dependencies (`bundle install`)
2. Install Node dependencies (`npm install`)
3. Build CSS (`npm run build:css`)
4. Precompile assets
5. Deploy

**CI/CD**: GitHub Actions runs tests on every push
- Sets up Ruby, Node, and PostgreSQL (for ActiveRecord, not used for data)
- Installs dependencies
- Builds CSS
- Runs RSpec

## Progressive Web App Features

The app is designed to work offline:
- Service worker caches assets
- All workout logic runs in browser
- No server calls during timer execution (except initial page load)
