# Warrior Timer

A gym interval timer with URL-based interval definitions. Create custom workout timers by defining intervals directly in the URL.

## Features

- **URL-Based Configuration**: Define workouts in the URL path
- **Flexible Syntax**: Support for simple intervals, repetitions, and nested structures
- **Visual Feedback**: Color-coded segments (prepare, warmup, work, rest, cooldown)
- **Audio Cues**: Countdown beeps and transition sounds using Web Audio API
- **Mobile-First Design**: Large, readable display optimized for viewing across the gym
- **Desktop Sidebar**: Shows full workout overview on larger screens
- **Keyboard Controls**: Spacebar to start/pause
- **No Database Required**: All state lives in the URL

## Tech Stack

- Rails 7.1
- Hotwire (Turbo + Stimulus)
- ViewComponents
- Tailwind CSS
- RSpec for testing
- Web Audio API for sounds

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd warrior_timer

# Install dependencies
bundle install

# Start the development server
bin/dev
```

The app will be available at `http://localhost:3000`

## Running Tests

```bash
bundle exec rspec
```

## Interval Syntax

### Segment Types
- `p` = Prepare
- `wu` = Warmup
- `w` = Work
- `r` = Rest
- `cd` = Cooldown

### Time Formats
- `30w` - 30 seconds work
- `5mw` - 5 minutes work
- `1:30w` - 1 minute 30 seconds work

### Sequencing
- `30w+30r` - Chain segments with +
- `10(30w30r)` - Repeat 10 times
- `3(2(30w15r)60r)` - Nested repetitions

## Example URLs

### Simple Intervals
```
/timer/10(30w30r)
```
10 rounds of 30s work, 30s rest

### Tabata
```
/timer/20(20w10r)
```
20 rounds of 20s work, 10s rest

### Full Workout
```
/timer/10p+5mwu+8(3mw1mr)+2mcd
```
10s prep, 5min warmup, 8 rounds of 3min work / 1min rest, 2min cooldown

### Nested Intervals
```
/timer/3(2(30w15r)60r)
```
3 sets of: 2 rounds of 30s work/15s rest, then 60s rest

## Architecture

### Services
- `Intervals::Parser` - Parses interval syntax into structured data
- `Intervals::Expander` - Expands parsed segments with metadata (round numbers, indices, etc.)

### ViewComponents
- `Timer::DisplayComponent` - Main timer display
- `Timer::ControlsComponent` - Start/pause, skip, reset buttons
- `Workout::OverviewComponent` - Desktop sidebar showing all segments

### Stimulus Controllers
- `timer_controller.js` - Countdown logic, segment progression, display updates
- `audio_controller.js` - Beep generation using Web Audio API

## Controls

- **Start/Pause**: Click button or press Spacebar
- **Skip**: Advance to next segment
- **Reset**: Return to beginning
- **Home**: Return to landing page (← button in top-left)

## Development

The app uses:
- Propshaft for asset pipeline
- Import maps for JavaScript
- Tailwind CSS via tailwindcss-rails
- ViewComponent for reusable UI components

No database is required - the app is completely stateless.

## License

This project is available as open source.
