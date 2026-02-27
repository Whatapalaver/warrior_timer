class ProtocolsController < ApplicationController
  def index
    @protocol_categories = [
      {
        name: "Mobility",
        description: "Movement preparation and recovery protocols",
        protocols: [
          { name: "Wildcard Wellness", code: "30p+(1mw10r)*[Lymph Hops,Body Waves,Arm Swing,Trunk Twists,F Arm Circles,Bent Over Back Shake,B Arm Circles,Dead Arms,Golf Swings,Marches,Tip Toe Swings,Twist the Waist,Ballet Squat,Wide Arm Step Back,Wave Lunges,PushUps,Jump Rope]", description: "Tai chi and Qi Gong mobility - 30s prep, then 17 movements (1 min work, 10s rest each)" }
        ]
      },
      {
        name: "Classic Gym Intervals",
        protocols: [
          { name: "Tabata", code: "8(20w10r)", description: "The original HIIT protocol. 20s max effort, 10s rest, 8 rounds. Created by Dr. Izumi Tabata." },
          { name: "Tabata Extended", code: "5p+8(20w10r)", description: "Tabata with 5 second prepare countdown" },
          { name: "30/30 Intervals", code: "10(30w30r)", description: "Equal work/rest. Good for beginners or moderate intensity." },
          { name: "40/20 HIIT", code: "10(40w20r)", description: "2:1 work:rest ratio. More challenging." },
          { name: "45/15 HIIT", code: "10(45w15r)", description: "3:1 ratio. High work density." },
          { name: "1:2 Recovery", code: "6(1mw2mr)", description: "Long recovery intervals. Good for sprint repeats." },
          { name: "2:1 Conditioning", code: "8(2mw1mr)", description: "Build aerobic capacity with shorter rest." },
          { name: "Pyramid Up", code: "30w30r+45w30r+1mw30r+1:30w30r+2mw", description: "Increasing work periods with fixed rest." },
          { name: "Descending Ladder", code: "2mw30r+1:30w30r+1mw30r+45w30r+30w", description: "Decreasing work periods. Finish strong." }
        ]
      },
      {
        name: "Mark Wildman / Kettlebell",
        description: "Mark Wildman's minimalist kettlebell protocols",
        protocols: [
          { name: "EMOM 10 Singles", code: "10(1mw)", description: "Every minute, 10 rounds. Single kettlebell work." },
          { name: "E90s OM", code: "10(1:30w)", description: "Every 90 seconds, 10 rounds. Heavy work with rest." },
          { name: "Simple Intervals 7×1:1", code: "7(1mw1mr)", description: "7 rounds of 1 min work, 1 min rest" },
          { name: "Heavy Singles 5×2:1", code: "5(2mw1mr)", description: "5 rounds of 2 min work, 1 min rest. Heavy bells." },
          { name: "Tetris Complex", code: "4(7(1mw1mr))", description: "4 blocks of 7 rounds. Wildman's Tetris protocol." },
          { name: "Standard 5×1:1", code: "5(1mw1mr)", description: "Standard 5 round protocol" },
          { name: "Extended 10×1:1", code: "10(1mw1mr)", description: "Extended work capacity builder" },
          { name: "Continuous 5min", code: "5mw", description: "Continuous work for 5 minutes" },
          { name: "Triple Tabata", code: "3(10(30w30r))", description: "3 exercises, Tabata timing each" },
          { name: "Long Form 10min", code: "10mw", description: "Long form continuous work" },
          { name: "Viking Warrior Conditioning cMVO2 Test", code: "1mw@10bpm+1mw@14bpm+1mw@18bpm+1mw@22bpm+1mw", description: "cMVO2 protocol: 1 min each at 10, 14, 18, 22 BPM, then 1 min AMRAP" },
          { name: "Viking Warrior Conditioning 15:15", code: "80(15w@32bpm+15r)", description: "80 rounds of 15s work at 32 BPM, 15s rest. Classic VWC protocol. Amend the bpm to be 4 * your personal number or the max reps recorded in minute 5 of the cMVO2 test" }
        ]
      },
      {
        name: "CrossFit / Functional Fitness",
        protocols: [
          { name: "EMOM 10", code: "10(1mw)", description: "Every Minute On the Minute. Do your reps, rest remainder." },
          { name: "EMOM 15", code: "15(1mw)", description: "15 minute EMOM" },
          { name: "EMOM 20", code: "20(1mw)", description: "Extended EMOM for endurance" },
          { name: "E2MOM 10", code: "5(2mw)", description: "Every 2 Minutes On the Minute. More time for complex movements." },
          { name: "E90s OM", code: "8(1:30w)", description: "Every 90 seconds. Good for heavy lifts." },
          { name: "AMRAP 7", code: "7mw", description: "As Many Rounds/Reps As Possible in 7 minutes" },
          { name: "AMRAP 12", code: "12mw", description: "Common benchmark length" },
          { name: "AMRAP 20", code: "20mw", description: "Extended conditioning" },
          { name: "For Time Cap 15", code: "15mw", description: "Complete workout as fast as possible, 15 min cap" },
          { name: "For Time Cap 20", code: "20mw", description: "20 minute time cap" },
          { name: "Alternating EMOM", code: "10(30w30r)", description: "Alternate movements each 30 seconds" }
        ]
      },
      {
        name: "TACFIT Protocols",
        description: "Based on Scott Sonnon's Tactical Fitness system",
        protocols: [
          { name: "TACFIT Basic", code: "8(20w10r)", description: "Entry level. Same as Tabata timing." },
          { name: "TACFIT + Recovery", code: "8(20w10r)+60r", description: "Single exercise with 60s recovery after" },
          { name: "TACFIT Circuit (6 exercises)", code: "6(8(20w10r)60r)", description: "Full 6-exercise circuit" },
          { name: "TACFIT Endurance", code: "4(4mw1mr)", description: "4 rounds of 4min work / 1min rest" },
          { name: "TACFIT 30/30", code: "10(30w30r)", description: "Equal intervals for technique focus" },
          { name: "TACFIT 90/30 × 5 Doubles", code: "2(5(1:30w30r))", description: "5 exercises, 90s each, repeated twice" },
          { name: "TACFIT Sprint", code: "5(20w40r)", description: "Short burst with longer recovery" }
        ]
      },
      {
        name: "Combat Sports",
        protocols: [
          { name: "Boxing Amateur", code: "3(2mw1mr)", description: "3 rounds × 2 minutes. Amateur boxing." },
          { name: "Boxing Pro", code: "12(3mw1mr)", description: "12 rounds × 3 minutes. Professional boxing." },
          { name: "Boxing Training", code: "6(3mw1mr)", description: "6 round training session" },
          { name: "MMA Round", code: "3(5mw1mr)", description: "3 × 5 minute rounds. Standard MMA." },
          { name: "MMA Championship", code: "5(5mw1mr)", description: "5 × 5 minute rounds. Title fight format." },
          { name: "Muay Thai", code: "5(3mw2mr)", description: "5 × 3 min rounds with 2 min rest" },
          { name: "Wrestling Period", code: "3(2mw1mr)", description: "3 × 2 minute periods" },
          { name: "Kickboxing", code: "5(3mw1mr)", description: "5 round format" },
          { name: "Sparring Light", code: "5(2mw1mr)", description: "Shorter rounds for technique sparring" },
          { name: "Bag Work Extended", code: "10(3mw30r)", description: "Heavy bag session with short breaks" }
        ]
      },
      {
        name: "Specialty / Other",
        protocols: [
          { name: "Pomodoro", code: "25mw+5mr", description: "Productivity technique. 25 min focus, 5 min break." },
          { name: "Pomodoro × 4", code: "4(25mw5mr)", description: "Full Pomodoro session" },
          { name: "Walking Intervals", code: "10(2mw1mr)", description: "Walk/rest for recovery days" },
          { name: "Stretching Flow", code: "12(30w)", description: "30 seconds per stretch, 12 positions" },
          { name: "Meditation Timer", code: "10mw", description: "Simple 10 minute countdown" },
          { name: "Plank Challenge", code: "1mw30r+1:15w30r+1:30w30r+1:45w30r+2mw", description: "Progressive plank holds" },
          { name: "Breath Work 4-7-8", code: "10(4w7w8r)", description: "Inhale 4s, hold 7s, exhale 8s × 10" },
          { name: "Jump Rope Intervals", code: "10(1mw30r)", description: "1 min on, 30 sec rest" }
        ]
      }
    ]
  end
end
