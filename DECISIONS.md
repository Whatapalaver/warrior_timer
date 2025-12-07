# Technical Decisions

This document captures key technical decisions made during development, including rationale and alternatives considered.

---

## URL Encoding Strategy

**Decision**: Use raw path strings instead of Rails path helpers, convert spaces to hyphens in JavaScript

**Context**: URLs were showing encoded characters like `%2B` (plus), `%5B` (bracket), `%20` (space)

**Approaches Tried**:
1. ❌ `encodeURIComponent()` in JavaScript - Too aggressive, encodes everything
2. ❌ `timer_path(intervals: code)` - Rails helper URL encodes automatically
3. ✅ Raw strings `/timer/#{code}` + space-to-hyphen conversion

**Implementation**:
```javascript
// interval_builder_controller.js
const urlFriendly = input.replace(/ /g, '-')
window.location.href = `/timer/${urlFriendly}`
```

```erb
<!-- Use raw path strings, not helpers -->
<%= link_to "/timer/#{code}", class: "..." do %>
```

**Result**: Clean URLs like `/timer/5mwu+3((30w30r)*[Squat-Press,Bench])` instead of encoded mess

**Trade-off**:
- ✅ Beautiful, readable URLs
- ❌ Need to ensure Rails routing constraint handles special chars
- ✅ Routing constraint `{ intervals: /[^\/]+/ }` accepts any non-slash character

---

## Named Segments Syntax

**Decision**: Two syntaxes - inline `30w[Name]` and circuit shorthand `(30w30r)*[A,B,C]`

**Context**: Users wanted to label exercises instead of generic "WORK"/"REST"

**Requirements**:
- Support single named segments
- Support circuits with multiple named exercises
- URL-friendly (hyphens/underscores convert to spaces)
- Names only on work segments (not rest)

**Design Choices**:

### Inline Syntax
```
30w[Squat]              # Single named work segment
8(20w[Burpees]10r)      # Named work segment in repetition
```

**Rationale**:
- Natural to put name right after the segment
- Square brackets visually distinct from parentheses
- Can name individual segments within a pattern

### Circuit Shorthand
```
(30w30r)*[A,B,C]                    # 3 exercises, work segments named
4((30w30r)*[Squat,Bench,Press])     # 4 rounds of 3 exercises
```

**Rationale**:
- Avoids repetition: don't need to write `30w[A]30r+30w[B]30r+...`
- Mirrors mathematical notation: multiply pattern by list
- Only names work segments (rest segments stay generic)

**Alternatives Considered**:
- ❌ `[A,B,C](30w30r)` - Confusing order
- ❌ `30w30r{A,B,C}` - Curly braces problematic in URLs
- ❌ `30w:A+30r+30w:B` - Too verbose for circuits

**Parser Complexity**: Required careful handling of nested parentheses and bracket matching

---

## Background Color Reset Bug

**Decision**: Explicitly remove all color classes before resetting to default

**Issue**: After reset/complete, background stayed red (work) or green (rest)

**Root Cause**: Tailwind classes were being added but not removed. When resetting, we added `bg-slate-900` but didn't remove `bg-red-600`.

**Solution**:
```javascript
resetBackgroundColor() {
  // Explicitly remove all possible segment colors
  this.element.classList.remove('bg-amber-500', 'bg-orange-500', 'bg-red-600', 'bg-emerald-500', 'bg-sky-500')
  this.element.classList.remove('text-slate-900', 'text-white')

  // Then add back defaults
  this.element.classList.add('bg-slate-900', 'text-white')
}
```

**Why Not `toggle()`?**: Can't reliably toggle classes that might not be present. Explicit remove/add is clearer.

---

## ViewComponent Namespacing

**Decision**: Organize components in folders with namespaced modules

**Structure**:
```
app/components/
├── protocol_preview/
│   ├── protocol_preview_component.rb       # module ProtocolPreview
│   └── protocol_preview_component.html.erb
└── timer/
    ├── display_component.rb                # module Timer
    └── display_component.html.erb
```

**Usage**: `render(ProtocolPreview::ProtocolPreviewComponent.new(...))`

**Rationale**:
- Matches Rails conventions for namespacing
- Prevents naming collisions
- Groups related components
- Easier to navigate codebase

**Migration**: When moving components into folders, all `render()` calls must be updated to use full namespace.

---

## Protocol Preview Borders

**Decision**: Add visible borders between segments in preview bar

**Issue**: EMOM workouts (repeated work segments) appeared as single solid block

**Solution**: `border-r border-slate-300` between segments

**Color Choice**:
- ❌ `border-slate-700` - Too subtle, not visible
- ✅ `border-slate-300` - Clearly visible while matching dark theme

---

## Tailwind CSS Build Process

**Decision**: Use Tailwind CSS v4 via npm, not Tailwind Ruby gem

**Rationale**:
- v4 is the latest major version
- npm gives access to latest features
- Follows official Tailwind documentation
- Better IDE support

**Build Command**: `npm run build:css` → generates `app/assets/builds/application.css`

**CI/CD Requirement**: Must run `npm install` and `npm run build:css` before tests

---

## Test Strategy for Parsing

**Decision**: Comprehensive unit tests for Parser, system tests for integration

**Parser Tests (44 examples)**:
- Simple segments (bare seconds, minutes, colon notation)
- Sequences (plus-separated, concatenated)
- Repetitions (simple, nested)
- Named segments (inline, circuit shorthand)
- Error cases (invalid syntax, mismatched parens)

**System Tests**:
- `all_protocol_codes_spec.rb` validates every protocol in the library
- Ensures no typos in protocol definitions
- Catches breaking parser changes

**Why Not Feature Tests for Timer?**: Timer logic is primarily JavaScript (Web Audio API, DOM manipulation). RSpec tests focus on Ruby parsing logic.

---

## Metronome Implementation

**Decision**: Use Web Audio API with OscillatorNode for beeps

**Rationale**:
- More precise timing than HTML5 Audio
- No latency loading audio files
- Can generate any frequency programmatically
- Works offline

**Alternative Considered**:
- ❌ Prerecorded audio files - Adds network requests, cache complexity
- ✅ Web Audio API - Zero dependencies, perfect timing

---

## No Authentication

**Decision**: Completely open, no user accounts

**Rationale**:
- URLs are the "database" - users bookmark/share what they want
- Reduces complexity (no OAuth, sessions, password resets)
- Faster to use (no signup friction)
- Better privacy (no personal data stored)
- Scales infinitely (no user table growth)

**Trade-off**:
- ❌ Can't save "favorites" server-side
- ✅ Users can bookmark URLs in browser
- ✅ Can add browser localStorage for favorites later if needed

---

## Error Handling in Parser

**Decision**: Raise `ParseError` with descriptive messages, catch in controller

**Examples**:
- "Input cannot be empty"
- "Mismatched parentheses"
- "Unknown segment type: x"
- "Invalid time format: abc"

**Controller Handling**:
```ruby
begin
  @segments = Intervals::Expander.new(Intervals::Parser.new(intervals).parse).expand
rescue Intervals::Parser::ParseError => e
  @error = e.message
end
```

**Alternative**: Return error hash from parser. Rejected because exceptions make error flow clearer.

---

## Deployment Platform

**Decision**: Fly.io

**Rationale**:
- Simple Rails deployment
- Free tier sufficient for this app
- Global CDN
- Easy SSL
- Git-based deploys

**Build Process**: GitHub Actions runs tests, then deploys to Fly.io on push to main

---

## CSS Framework Choice

**Decision**: Tailwind CSS over Bootstrap or custom CSS

**Rationale**:
- Utility-first approach perfect for component-based architecture
- Easy to customize colors/spacing
- Smaller bundle size (only used utilities included)
- Better for dark themes
- Matches modern Rails conventions

---

## Concatenated Segment Syntax

**Decision**: Support both `30w+30r` (explicit) and `30w30r` (concatenated)

**Rationale**:
- `30w+30r` is clearer for beginners
- `30w30r` is faster to type for power users
- Both are valid and equivalent
- Parser handles both with same logic

**Implementation**: Parser splits on `+` first, then tokenizes concatenated segments

**Test Coverage**: `handles all three syntax styles equivalently` test ensures consistency

---

## Segment Type Abbreviations

**Decision**: Single/double letter codes (w, r, wu, cd, p)

**Alternatives Considered**:
- ❌ Full words `30work+30rest` - Too verbose in URL
- ❌ Numbers `30:1+30:2` - Not intuitive
- ✅ Letter codes - Short, memorable, expandable

**Abbreviation Choices**:
- `w` = work (most common, gets shortest code)
- `r` = rest (most common)
- `wu` = warmup (need 2 letters to avoid collision with `w`)
- `cd` = cooldown (need 2 letters)
- `p` = prepare (short countdown before starting)

---

## Time Format Flexibility

**Decision**: Support multiple time formats in same string

**Formats**:
- `30` = 30 seconds
- `5m` = 5 minutes (converted to 300 seconds)
- `1:30` = 1 minute 30 seconds (converted to 90 seconds)

**Rationale**: Different users think differently - some count seconds, some count minutes

**Parser Complexity**: Required separate regex patterns for each format, but worth it for UX

---

## Documentation Location

**Decision**: Instructions on home page, detailed library on protocols page

**Home Page**:
- Interval builder with live preview
- Quick start examples
- Syntax guide (collapsed by default)
- How it works

**Protocols Page**:
- Curated library organized by category
- Each protocol shows preview bar
- Click to start timer

**Rationale**:
- Home page for discovery and learning
- Protocols page for quick access to proven workouts
- Separation of concerns (builder vs library)
