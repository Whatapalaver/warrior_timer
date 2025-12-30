require 'rails_helper'

RSpec.describe "Metronome Persistence", type: :system, js: true do
  before do
    driven_by(:selenium_chrome_headless)
  end

  describe "URL parameter initialization" do
    it "initializes metronome checkbox from URL parameter" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true", bpm: "120")

      checkbox = find('[data-timer-target="metronomeToggle"]')
      expect(checkbox).to be_checked
    end

    it "initializes BPM value from URL parameter" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true", bpm: "150")

      bpm_input = find('[data-timer-target="metronomeBpm"]')
      expect(bpm_input.value).to eq("150")
    end

    it "does not check metronome when parameter is not present" do
      visit timer_path(intervals: "8(20w10r)")

      checkbox = find('[data-timer-target="metronomeToggle"]')
      expect(checkbox).not_to be_checked
    end

    it "uses default BPM when not specified in URL" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true")

      bpm_input = find('[data-timer-target="metronomeBpm"]')
      expect(bpm_input.value).to eq("60")
    end
  end

  describe "editing workout with metronome enabled" do
    it "preserves metronome settings when editing workout" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true", bpm: "120")

      # Enable edit mode
      find('[data-workout-editor-target="editButton"]').click

      # Change the workout
      input = find('[data-workout-editor-target="input"]')
      input.fill_in with: "10(30w30r)"

      # Apply changes
      find('button', text: 'Apply Changes').click

      # Check new URL includes metronome parameters
      expect(page.current_url).to include("metronome=true")
      expect(page.current_url).to include("bpm=120")
      expect(page.current_url).to include("10(30w30r)")
    end

    it "does not add metronome parameters when metronome is disabled" do
      visit timer_path(intervals: "8(20w10r)")

      # Ensure metronome is not checked
      checkbox = find('[data-timer-target="metronomeToggle"]')
      expect(checkbox).not_to be_checked

      # Enable edit mode
      find('[data-workout-editor-target="editButton"]').click

      # Change the workout
      input = find('[data-workout-editor-target="input"]')
      input.fill_in with: "10(30w30r)"

      # Apply changes
      find('button', text: 'Apply Changes').click

      # Check new URL does not include metronome parameters
      expect(page.current_url).not_to include("metronome=true")
      expect(page.current_url).not_to include("bpm=")
    end

    it "preserves updated BPM value when editing workout" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true", bpm: "100")

      # Change BPM
      bpm_input = find('[data-timer-target="metronomeBpm"]')
      bpm_input.fill_in with: "140"

      # Enable edit mode
      find('[data-workout-editor-target="editButton"]').click

      # Change the workout
      input = find('[data-workout-editor-target="input"]')
      input.fill_in with: "5(40w20r)"

      # Apply changes
      find('button', text: 'Apply Changes').click

      # Check new URL includes updated BPM
      expect(page.current_url).to include("bpm=140")
    end
  end

  describe "favoriting workout with metronome" do
    it "stores metronome settings when favoriting a workout" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true", bpm: "130")

      # Clear localStorage after visiting page
      page.execute_script("localStorage.clear()")

      # Open favorite modal
      find('[data-action*="workout-storage#showFavoriteModal"]').click

      # Confirm favorite (assuming modal has a confirm button)
      within('[data-workout-storage-target="modal"]') do
        find('button', text: /confirm|add|save/i).click
      end

      # Check localStorage
      favorites = page.evaluate_script("JSON.parse(localStorage.getItem('warrior_timer_favorites'))")
      expect(favorites).to be_an(Array)
      expect(favorites.first['metronome']).to be true
      expect(favorites.first['bpm']).to eq(130)
    end

    it "does not store metronome settings when metronome is disabled" do
      visit timer_path(intervals: "8(20w10r)")

      # Clear localStorage after visiting page
      page.execute_script("localStorage.clear()")

      # Open favorite modal
      find('[data-action*="workout-storage#showFavoriteModal"]').click

      # Confirm favorite
      within('[data-workout-storage-target="modal"]') do
        find('button', text: /confirm|add|save/i).click
      end

      # Check localStorage
      favorites = page.evaluate_script("JSON.parse(localStorage.getItem('warrior_timer_favorites'))")
      expect(favorites.first['metronome']).to be_nil
      expect(favorites.first['bpm']).to be_nil
    end
  end

  describe "loading favorited workout with metronome" do
    it "includes metronome parameters in favorite links" do
      visit root_path

      # Set up a favorite with metronome after visiting page
      page.execute_script(<<~JS)
        localStorage.clear();
        localStorage.setItem('warrior_timer_favorites', JSON.stringify([
          {
            code: '8(20w10r)',
            name: 'Test Tabata',
            metronome: true,
            bpm: 140,
            addedAt: '#{Time.current.iso8601}'
          }
        ]));
      JS

      # Reload to pick up the changes
      visit root_path

      # Find the favorite link
      favorite_link = find('a[href*="8(20w10r)"]')
      expect(favorite_link[:href]).to include("metronome=true")
      expect(favorite_link[:href]).to include("bpm=140")
    end

    it "displays BPM indicator on favorited workouts with metronome" do
      visit root_path

      # Set up a favorite with metronome after visiting page
      page.execute_script(<<~JS)
        localStorage.clear();
        localStorage.setItem('warrior_timer_favorites', JSON.stringify([
          {
            code: '8(20w10r)',
            name: 'Test Tabata',
            metronome: true,
            bpm: 140,
            addedAt: '#{Time.current.iso8601}'
          }
        ]));
      JS

      # Reload to pick up the changes
      visit root_path

      # Check for BPM display
      within('a[href*="8(20w10r)"]') do
        expect(page).to have_content("140 BPM")
        expect(page).to have_content("♪")
      end
    end

    it "restores metronome settings when clicking favorite" do
      visit root_path

      # Set up a favorite with metronome after visiting page
      page.execute_script(<<~JS)
        localStorage.clear();
        localStorage.setItem('warrior_timer_favorites', JSON.stringify([
          {
            code: '8(20w10r)',
            name: 'Test Tabata',
            metronome: true,
            bpm: 140,
            addedAt: '#{Time.current.iso8601}'
          }
        ]));
      JS

      # Reload to pick up the changes
      visit root_path

      # Click the favorite
      click_link(href: /8\(20w10r\)/)

      # Check that metronome is enabled
      checkbox = find('[data-timer-target="metronomeToggle"]')
      expect(checkbox).to be_checked

      # Check BPM value
      bpm_input = find('[data-timer-target="metronomeBpm"]')
      expect(bpm_input.value).to eq("140")
    end
  end

  describe "recent workouts with metronome" do
    it "stores metronome settings in recent workouts" do
      visit timer_path(intervals: "8(20w10r)", metronome: "true", bpm: "120")

      # Clear localStorage after visiting page
      page.execute_script("localStorage.clear()")

      # Start the timer (which adds to recent)
      find('[data-action="timer#startPause"]').click

      # Check localStorage
      recents = page.evaluate_script("JSON.parse(localStorage.getItem('warrior_timer_recents'))")
      expect(recents).to be_an(Array)
      expect(recents.first['metronome']).to be true
      expect(recents.first['bpm']).to eq(120)
    end

    it "includes metronome parameters in recent workout links" do
      visit root_path

      # Set up recent workout with metronome after visiting page
      page.execute_script(<<~JS)
        localStorage.clear();
        localStorage.setItem('warrior_timer_recents', JSON.stringify([
          {
            code: '10(30w30r)',
            name: 'Recent Workout',
            metronome: true,
            bpm: 100,
            usedAt: '#{Time.current.iso8601}'
          }
        ]));
      JS

      # Reload to pick up the changes
      visit root_path

      # Find the recent workout link (use first to avoid ambiguity)
      recent_link = first('a[href*="10(30w30r)"]')
      expect(recent_link[:href]).to include("metronome=true")
      expect(recent_link[:href]).to include("bpm=100")
    end
  end
end
