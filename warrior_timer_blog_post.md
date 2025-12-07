# Warrior Timer: Training Smarter for Mace Competitions

I've always been a bit obsessed with efficient training. Not in the "optimize every second" hustle culture way, but in the "how can I make this actually work for my life" way. When you're juggling training for two different mace competitions with completely different demands, you need tools that adapt to you—not the other way around.

Enter: Warrior Timer, a side project I built to solve a problem I kept running into.

## The Problem with Most Interval Timers

Most interval timer apps are rigid. They assume you want to do exactly 8 rounds of Tabata and call it a day. But real training—especially when you're preparing for something specific—rarely fits into neat little boxes.

I'm currently training for two mace competitions:

1. **The Mace Half Marathon**: 30 minutes of continuous mace swinging. Yes, you read that right. Thirty. Minutes.
2. **King of the Swing**: Multiple 5-minute rounds with rest periods in between.

These require very different conditioning approaches. The half marathon needs sustained endurance with minimal warm-up disruption. King of the Swing demands explosive power in bursts, with strategic rest to maintain form across multiple rounds.

I needed a timer that could handle both. And I needed it to be simple enough that I could set it up mid-workout without fumbling through twelve menu options.

## How Warrior Timer Works

Warrior Timer uses a URL-based syntax to define your intervals. That might sound technical, but it's actually brilliantly simple once you get the hang of it.

Here's the basic formula:

- `w` = work
- `r` = rest
- `wu` = warmup
- `p` = prepare
- `cd` = cooldown

- Numbers indicate duration (30 = 30 seconds, 5m = 5 minutes, 1:30 = 1 min 30 sec)
- Parentheses with a number repeat sections: `8(20w10r)` = 8 rounds of 20s work/10s rest

You can chain segments together, nest repetitions, and even name your exercises so "WORK" becomes "Mace Swings" on the display, or "Squats" if you are old school.

## My Competition Training Timers

### Mace Half Marathon Preparation

For building up to 30 minutes of continuous mace work, I use:

**Code:** `30p+30mw[mace]`

This gives me a 30-second prep period to get into position, then straight into 30 minutes of mace swings. No fancy intervals, no breaks—just me, the mace, and the clock. The `[mace]` tag displays "mace" instead of generic "WORK" so I remember what I'm supposed to be doing (crucial when you're 20 minutes in and questioning your life choices).

<iframe src="https://warriortimer.fit/embed/30p%2B30mw%5Bmace%5D" width="100%" height="600" frameborder="0" allow="autoplay"></iframe>

### King of the Swing: Progressive Rounds

This one's more complex. I built up my work capacity using progressive intervals that increase in duration:

**Code:** `30p+1mw1mr+2mw2mr+3mw3mr+4mw4mr+5mw5mr`

It starts with 1 minute of work and 1 minute of rest, then increases each round up to 5 minutes of work and 5 minutes of rest. Total workout time: 30 minutes of work across 5 rounds. It's brutal, but it mimics the competition structure while building endurance.

<iframe src="https://warriortimer.fit/embed/30p%2B1mw1mr%2B2mw2mr%2B3mw3mr%2B4mw4mr%2B5mw5mr" width="100%" height="600" frameborder="0" allow="autoplay"></iframe>

### King of the Swing: Competition Simulation

When I'm closer to competition, I switch to the actual format:

**Code:** `30p+5(5mw5mr)`

Five rounds of 5 minutes work, 5 minutes rest. This is as close as I can get to competition conditions in training. The timer keeps me honest—no cutting rounds short, no extending rest periods.

<iframe src="https://warriortimer.fit/embed/30p+5(5mw5mr)" width="100%" height="600" frameborder="0" allow="autoplay"></iframe>

## Why I Love This Approach

**It's shareable.** I can send someone a URL and they instantly have the same workout loaded. No app download, no account creation, no friction.

**It's flexible.** I can create any interval structure I can imagine. Progressive rounds, pyramid sets, named circuits—it all works.

**It's embeddable.** I can drop a timer directly into blog posts (like I've done above) or training documentation. Click Start and go.

**It works everywhere.** Phone, tablet, laptop, whatever. As long as you have a browser, you're good.

## The Technical Bits (for the Nerds)

I built this with Rails 7.1, Stimulus.js for the interactivity, and Tailwind for the styling. The timer uses the Web Audio API for beeps and countdown sounds, and all your favorites and recent workouts are stored locally in your browser.

There's a full syntax guide at [warriortimer.fit](https://warriortimer.fit) if you want to build your own custom intervals. You can also browse pre-built protocols for common formats like Tabata, EMOM, and various strongman/mace training patterns.

## Give It a Try

The timers above are live and functional. Click Start on any of them right now if you want to see it in action.

Or head to [warriortimer.fit](https://warriortimer.fit) and build your own. If you're training for something specific—whether it's a mace competition, a strongman event, or just trying to make your garage workouts more structured—I think you'll find it useful.

And if you embed one on your own site, I'd love to hear about it. This whole project started because I needed a better tool for my own training. Turns out, I wasn't the only one.

Now, if you'll excuse me, I have 30 minutes of mace swings to get through.

---

*You can find Warrior Timer at [warriortimer.fit](https://warriortimer.fit)*

*Training protocols include Tabata, EMOM, custom circuits, and more. All free, all open, all built for people who actually train.*
