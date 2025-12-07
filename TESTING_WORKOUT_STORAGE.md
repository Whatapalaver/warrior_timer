# Testing Workout Storage Feature

The workout storage feature (favorites and recent workouts) is implemented using browser localStorage and JavaScript (Stimulus). Since we don't currently have a JavaScript testing framework (Jest, Jasmine, etc.), here's a manual testing guide.

## Why No Automated Tests?

- Feature is primarily JavaScript/localStorage-based
- Would require JavaScript test framework (Jest, Mocha, etc.) or Capybara system tests with headless browser
- Current project only has RSpec for Ruby code
- Manual testing is straightforward and reliable for this feature

## Manual Test Checklist

### Favorites - Basic Functionality

- [ ] **Add to favorites**
  1. Visit any timer page (e.g., `/timer/10(30w30r)`)
  2. Click "☆ Favorite" button
  3. Button should change to "★ Favorite" with gold color
  4. Visit home page, should see workout in "Favorites" section

- [ ] **Remove from favorites (timer page)**
  1. Visit a favorited timer page
  2. Click "★ Favorite" button
  3. Button should change back to "☆ Favorite" (gray)
  4. Visit home page, workout should be removed from favorites

- [ ] **Remove from favorites (home page)**
  1. Add a workout to favorites
  2. Visit home page
  3. Hover over favorite workout item
  4. Click the "✕" button that appears
  5. Workout should be removed from list

### Favorites - Persistence

- [ ] **Survives page refresh**
  1. Add workout to favorites
  2. Refresh the page
  3. Should still show as favorited (★)

- [ ] **Survives browser restart**
  1. Add workout to favorites
  2. Close browser completely
  3. Reopen browser and visit timer page
  4. Should still show as favorited

- [ ] **Syncs across tabs**
  1. Open home page in two browser tabs
  2. In tab 1, add a favorite
  3. Tab 2 should automatically update to show the new favorite

### Recent Workouts

- [ ] **Adds to recents when timer starts**
  1. Visit any timer page
  2. Click "Start" button
  3. Visit home page
  4. Workout should appear in "Recent Workouts" section
  5. Should show "Just now" as time

- [ ] **Most recent first**
  1. Start timer A
  2. Start timer B
  3. Visit home page
  4. Timer B should be first, Timer A should be second

- [ ] **Doesn't duplicate**
  1. Start same timer twice
  2. Visit home page
  3. Should only appear once in recents (at the top)

- [ ] **Shows time ago**
  1. Add a recent workout
  2. Wait 1-2 minutes
  3. Refresh home page
  4. Should show "1m ago" or "2m ago"

- [ ] **Remove from recents**
  1. Have at least one recent workout
  2. Visit home page
  3. Hover over recent workout
  4. Click "✕" button
  5. Should be removed

### Limits

- [ ] **Favorites limit (50)**
  1. Add 51 favorites
  2. Oldest should be automatically removed
  3. Should only have 50 favorites

- [ ] **Recents limit (20)**
  1. Start 21 different timers
  2. Check home page
  3. Should only show 20 most recent

### Clear All

- [ ] **Clear all favorites**
  1. Add multiple favorites
  2. Visit home page
  3. Click "Clear All" in favorites section
  4. Confirm dialog should appear
  5. Click "OK"
  6. All favorites should be removed
  7. Should show empty state

- [ ] **Clear all recents**
  1. Start multiple timers
  2. Visit home page
  3. Click "Clear All" in recents section
  4. Confirm dialog
  5. All recents should be removed

- [ ] **Cancel clear all**
  1. Click "Clear All"
  2. Click "Cancel" on confirmation
  3. Nothing should be removed

### Named Segment Detection

- [ ] **Detects Tabata**
  - Timer: `8(20w10r)` → Should show as "Tabata"

- [ ] **Detects EMOM**
  - Timer: `10(1mw)` → Should show as "EMOM"

- [ ] **Detects 30/30**
  - Timer: `10(30w30r)` → Should show as "30/30 Intervals"

- [ ] **Detects circuit names**
  - Timer: `(30w30r)*[Squat,Bench,Press]`
  - Should show as "Circuit: Squat, Bench, Press"

- [ ] **Truncates long circuits**
  - Timer: `(30w30r)*[A,B,C,D,E,F]`
  - Should show as "Circuit: A, B, C..."

- [ ] **Truncates long codes**
  - Timer: Very long interval code (50+ chars)
  - Should show truncated with "..."

### Empty States

- [ ] **No favorites empty state**
  - With no favorites
  - Should show "No favorites yet" message
  - Should show helper text about clicking star icon

- [ ] **No recents empty state**
  - With no recent workouts
  - Should show "No recent workouts" message
  - Should show helper text

### XSS Protection

- [ ] **Malicious workout name**
  1. Try to favorite a workout with name containing `<script>alert('xss')</script>`
  2. Script should not execute
  3. Should display as text (HTML escaped)

### Browser Compatibility

Test in these browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

### Edge Cases

- [ ] **localStorage disabled**
  1. Disable localStorage in browser settings
  2. Try to favorite
  3. Should show alert about storage being full/unavailable

- [ ] **localStorage full**
  1. Fill localStorage to capacity
  2. Try to add favorite
  3. Should show error alert

- [ ] **Invalid JSON in localStorage**
  1. Manually set `localStorage.setItem('warrior_timer_favorites', 'invalid')`
  2. Visit home page
  3. Should gracefully handle error and show empty state

- [ ] **Missing localStorage keys**
  1. Clear localStorage
  2. Visit home page
  3. Should show empty states without errors

## How to Set Up JavaScript Testing (Future)

If you want to add automated tests:

### Option 1: Jest + Testing Library

```bash
npm install --save-dev jest @testing-library/dom @testing-library/user-event
```

Create `spec/javascript/controllers/workout_storage_controller.spec.js`:
```javascript
import { Application } from "@hotwired/stimulus"
import WorkoutStorageController from "../../../app/javascript/controllers/workout_storage_controller"

describe("WorkoutStorageController", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("adds workout to favorites", () => {
    // Test implementation
  })
})
```

### Option 2: Capybara System Tests

The system test file I created would work with:
```ruby
# Gemfile
gem 'capybara'
gem 'selenium-webdriver'

# spec/rails_helper.rb
RSpec.configure do |config|
  config.before(:each, type: :system) do
    driven_by :selenium_chrome_headless
  end
end
```

But system tests are slow and require Chrome to be installed.

## Recommended Approach

For this feature, **manual testing is sufficient** because:
- Feature is simple and well-isolated
- User-facing behavior is easy to verify
- Adding JavaScript testing framework has overhead
- Manual test takes < 10 minutes

If the project grows and you add more JavaScript features, then it would be worth setting up Jest or system tests.
