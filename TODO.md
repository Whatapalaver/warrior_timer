# TODO

## Completed Features ✅

### Core Functionality
- [x] Interval syntax parser (simple segments, sequences, repetitions, nested)
- [x] Timer display with countdown
- [x] Audio cues (beeps for countdown, transitions, completion)
- [x] Metronome (adjustable BPM during work segments)
- [x] Background color changes by segment type
- [x] Start/Stop/Reset controls
- [x] Segment timeline view
- [x] Round number display

### Named Segments Feature
- [x] Inline naming syntax: `30w[Squat]`
- [x] Circuit shorthand: `(30w30r)*[A,B,C]`
- [x] Nested circuits: `4((30w30r)*[Squat,Bench,Press])`
- [x] Space-to-hyphen conversion in URLs
- [x] Parser support for names
- [x] Display custom names instead of generic "WORK"
- [x] Documentation on home page

### UI/UX
- [x] Home page with interval builder
- [x] Live preview on home page
- [x] Quick start examples
- [x] Syntax guide
- [x] Training protocols library page
- [x] Visual workout preview (color-coded bar)
- [x] Workout preview on timer page
- [x] Visible borders between segments in preview
- [x] Dark theme with Tailwind CSS
- [x] Mobile-responsive design

### Technical
- [x] ViewComponent architecture
- [x] Service objects (Parser, Expander)
- [x] Stimulus controllers
- [x] RSpec test suite (53 examples, 0 failures)
- [x] GitHub Actions CI/CD
- [x] Fly.io deployment
- [x] URL encoding fixes (clean URLs without %20, %5B, etc)

### Bug Fixes
- [x] Background color reset bug
- [x] URL encoding in link_to helpers
- [x] Preview colors not rendering
- [x] EMOM segments appearing as single block

---

## Nice-to-Have Features 🎯

### User Experience
- [ ] Keyboard shortcuts (space = pause/start, R = reset, ← → = skip segment)
- [ ] Voice announcements (text-to-speech for segment names)
- [ ] Fullscreen mode
- [ ] Screen wake lock (prevent phone from sleeping during workout)
- [ ] Haptic feedback on mobile
- [ ] Custom sound selection (different beep tones)

### Workout Management
- [ ] Browser localStorage for saving favorite workouts
- [ ] Recent workouts list
- [ ] Share button (copy URL to clipboard)
- [ ] QR code generator for sharing
- [ ] Export workout as image or PDF

### Timer Features
- [ ] Skip to next segment button
- [ ] Skip back to previous segment button
- [ ] Add extra rest time during workout
- [ ] Pause between rounds option
- [ ] Countdown to start (always show 5s countdown before first segment)

### Protocol Library Enhancements
- [ ] Search/filter protocols by name or category
- [ ] "Favorites" using localStorage
- [ ] User-submitted protocols (moderated GitHub PRs)
- [ ] Difficulty ratings
- [ ] Estimated calorie burn
- [ ] Equipment tags (bodyweight, kettlebell, etc)

### Advanced Syntax
- [ ] Random intervals: `5(30-60w30r)` picks random work duration
- [ ] Pyramid syntax sugar: `PYRAMID(30,45,60,75,90)` expands to ladder
- [ ] Rest after N rounds: `10(30w30r)|2mr` = rest after every 10 rounds
- [ ] Custom segment names for rest: `30r[Walk]` (active rest)

### Technical Improvements
- [ ] Service Worker for offline support
- [ ] Progressive Web App manifest
- [ ] Install prompt
- [ ] Faster tests (currently 0.4s, could optimize factories)
- [ ] Better error messages in parser (show position of error)
- [ ] Need a page to dispaly on error or 404. Got a stack too deep error

### Accessibility
- [ ] ARIA labels for screen readers
- [ ] High contrast mode
- [ ] Larger text option
- [ ] Focus management for keyboard navigation

### Documentation
- [ ] Video tutorial on home page
- [ ] FAQ page
- [ ] Blog post: "How to design your own interval workouts"
- [ ] API documentation for parse endpoint

---

## Known Issues 🐛

### Minor Issues
- [ ] Deprecation warning: ViewComponent requires Ruby 3.2.0+ (currently on 3.1.2)
  - Not blocking, just a warning
  - Fix: Upgrade Ruby version when convenient

### Browser Compatibility
- [ ] Test on Safari (Web Audio API implementation may differ)
- [ ] Test on Firefox
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)

---

## Won't Do ❌

These are explicitly out of scope:

- ❌ User accounts / authentication
  - Goes against stateless philosophy
  - URLs are the "database"

- ❌ Server-side workout storage
  - Users bookmark URLs instead
  - Could add localStorage favorites later

- ❌ Social features
  - No comments, likes, or follows
  - Just share URLs

- ❌ Workout tracking / history
  - Out of scope for this project
  - Other apps do this well

- ❌ Exercise instruction videos
  - Would require content library
  - Users should look up exercises elsewhere

- ❌ Integration with fitness trackers
  - Too complex for scope
  - Would require API keys, OAuth, etc.

---

## Performance Optimizations

Current performance is good, but could improve:

- [ ] Lazy load protocol categories (collapse all by default)
- [ ] Virtualize long segment timelines (only render visible segments)
- [ ] Memoize parser results (cache parsed intervals in memory)
- [ ] Compress JavaScript (currently using importmaps, could add minification)
- [ ] CDN for assets (Fly.io has this, verify it's enabled)

---

## Testing Gaps

Tests are comprehensive, but could add:

- [ ] JavaScript tests (currently only Ruby tests)
- [ ] Visual regression tests (screenshot comparisons)
- [ ] Performance benchmarks (parser speed for complex workouts)
- [ ] Accessibility tests (aXe or similar)

---

## Refactoring Opportunities

Code is clean, but could improve:

- [ ] Extract audio system to separate Stimulus controller
- [ ] Extract metronome to separate Stimulus controller
- [ ] Move segment color mapping to shared constant (DRY)
- [ ] Consolidate time formatting (used in multiple places)

---

## Marketing / Growth

If we want more users:

- [ ] Submit to Product Hunt
- [ ] Post on r/crossfit, r/kettlebell, r/bodyweightfitness
- [ ] YouTube video: "I built a timer app with clean URLs"
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Open Graph tags for nice link previews
- [ ] Twitter card meta tags

---

## Deployment Checklist

Before deploying:

- [x] All tests passing
- [x] No console errors on production
- [x] Mobile responsive on real devices
- [x] Audio works on mobile (user interaction required)
- [x] Dark theme looks good
- [x] URLs are clean (no encoding)
- [ ] Analytics setup (optional, privacy-friendly like Plausible)
- [ ] Error monitoring (optional, like Sentry or Honeybadger)

---

## Future Considerations

Things to think about later:

- Internationalization (i18n)? Most users probably English-speaking
- Multiple color themes? Dark theme works well for most
- Custom sound uploads? Could be fun but adds storage complexity
- Workout builder GUI? Current syntax is powerful but has learning curve
- Mobile apps? PWA might be sufficient

---

## Questions to Resolve

- Should we add a "Report Bug" link? Where would it go (GitHub Issues)?
- Should we add a changelog page?
- Should we add version numbers?
- Should we have a privacy policy? (No data collected, so maybe not needed)
- Should we add Google Analytics or similar? (Privacy concerns)

---

## Resources

Useful links for continued development:

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Stimulus Handbook](https://stimulus.hotwired.dev)
- [ViewComponent Guide](https://viewcomponent.org)
- [Web Audio API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [RSpec Best Practices](https://rspec.info)

---

## Notes for Next Developer

If you're picking this project up:

1. Read `ARCHITECTURE.md` first to understand structure
2. Read `DECISIONS.md` to understand why things are the way they are
3. Run tests: `bundle exec rspec` - should be 53 examples, 0 failures
4. Start server: `bin/dev` (runs both Rails and Tailwind CSS watcher)
5. Check test coverage: all core functionality has tests
6. Parser is most complex part - lots of edge cases, tests cover them
7. Audio system requires user interaction on mobile (browsers block auto-play)
8. URLs must stay clean - avoid URL encoding, use raw path strings
9. All workout logic is in services - controllers are thin
10. Components are namespaced - use full module path when rendering
