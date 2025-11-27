require 'rails_helper'

RSpec.describe Intervals::Parser do
  describe '#parse' do
    context 'with simple segments' do
      it 'parses bare seconds' do
        result = described_class.new('30w').parse
        expect(result).to eq([
          { type: :work, duration: 30 }
        ])
      end

      it 'parses rest segments' do
        result = described_class.new('15r').parse
        expect(result).to eq([
          { type: :rest, duration: 15 }
        ])
      end

      it 'parses warmup segments' do
        result = described_class.new('60wu').parse
        expect(result).to eq([
          { type: :warmup, duration: 60 }
        ])
      end

      it 'parses cooldown segments' do
        result = described_class.new('45cd').parse
        expect(result).to eq([
          { type: :cooldown, duration: 45 }
        ])
      end

      it 'parses prepare segments' do
        result = described_class.new('10p').parse
        expect(result).to eq([
          { type: :prepare, duration: 10 }
        ])
      end
    end

    context 'with minute notation' do
      it 'parses minutes with m suffix' do
        result = described_class.new('5mw').parse
        expect(result).to eq([
          { type: :work, duration: 300 }
        ])
      end

      it 'parses multiple minutes' do
        result = described_class.new('3mr').parse
        expect(result).to eq([
          { type: :rest, duration: 180 }
        ])
      end
    end

    context 'with colon notation' do
      it 'parses minutes:seconds format' do
        result = described_class.new('1:30w').parse
        expect(result).to eq([
          { type: :work, duration: 90 }
        ])
      end

      it 'parses longer durations' do
        result = described_class.new('2:45r').parse
        expect(result).to eq([
          { type: :rest, duration: 165 }
        ])
      end
    end

    context 'with sequences' do
      it 'parses plus-separated segments' do
        result = described_class.new('30w+30r').parse
        expect(result).to eq([
          { type: :work, duration: 30 },
          { type: :rest, duration: 30 }
        ])
      end

      it 'parses concatenated segments without plus' do
        result = described_class.new('30w30r').parse
        expect(result).to eq([
          { type: :work, duration: 30 },
          { type: :rest, duration: 30 }
        ])
      end

      it 'parses complex sequences' do
        result = described_class.new('10p+5mwu+30w+15r').parse
        expect(result).to eq([
          { type: :prepare, duration: 10 },
          { type: :warmup, duration: 300 },
          { type: :work, duration: 30 },
          { type: :rest, duration: 15 }
        ])
      end

      it 'parses ladder-style concatenated sequences' do
        result = described_class.new('30w30r45w30r1mw30r').parse
        expect(result).to eq([
          { type: :work, duration: 30 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 45 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 60 },
          { type: :rest, duration: 30 }
        ])
      end

      it 'parses mixed time format ladders' do
        result = described_class.new('30w30r45w30r1mw30r1:30w30r2mw').parse
        expect(result).to eq([
          { type: :work, duration: 30 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 45 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 60 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 90 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 120 }
        ])
      end

      it 'parses mixed concatenation and plus syntax' do
        result = described_class.new('10w30r+20w40r').parse
        expect(result).to eq([
          { type: :work, duration: 10 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 20 },
          { type: :rest, duration: 40 }
        ])
      end

      it 'handles all three syntax styles equivalently' do
        codes = ['10w30r20w40r', '10w30r+20w40r', '10w+30r+20w+40r']
        expected = [
          { type: :work, duration: 10 },
          { type: :rest, duration: 30 },
          { type: :work, duration: 20 },
          { type: :rest, duration: 40 }
        ]
        codes.each do |code|
          expect(described_class.new(code).parse).to eq(expected)
        end
      end
    end

    context 'with repetitions' do
      it 'parses simple repetitions' do
        result = described_class.new('10(30w30r)').parse
        expected = []
        10.times do
          expected << { type: :work, duration: 30, repetition: true }
          expected << { type: :rest, duration: 30, repetition: true }
        end
        expect(result).to eq(expected)
      end

      it 'parses repetitions with plus notation inside' do
        result = described_class.new('5(30w+15r)').parse
        expected = []
        5.times do
          expected << { type: :work, duration: 30, repetition: true }
          expected << { type: :rest, duration: 15, repetition: true }
        end
        expect(result).to eq(expected)
      end

      it 'parses single item repetition' do
        result = described_class.new('8(45w)').parse
        expected = []
        8.times do
          expected << { type: :work, duration: 45, repetition: true }
        end
        expect(result).to eq(expected)
      end
    end

    context 'with nested repetitions' do
      it 'parses two levels of nesting' do
        result = described_class.new('3(2(30w15r)60r)').parse
        expected = []
        3.times do
          2.times do
            expected << { type: :work, duration: 30, repetition: true }
            expected << { type: :rest, duration: 15, repetition: true }
          end
          expected << { type: :rest, duration: 60, repetition: true }
        end
        expect(result).to eq(expected)
      end
    end

    context 'with complex combinations' do
      it 'parses full workout structure' do
        result = described_class.new('10p+5mwu+8(3mw1mr)+2mcd').parse
        expected = [
          { type: :prepare, duration: 10 },
          { type: :warmup, duration: 300 }
        ]
        8.times do
          expected << { type: :work, duration: 180, repetition: true }
          expected << { type: :rest, duration: 60, repetition: true }
        end
        expected << { type: :cooldown, duration: 120 }
        expect(result).to eq(expected)
      end

      it 'parses tabata-style workout' do
        result = described_class.new('20(20w10r)').parse
        expected = []
        20.times do
          expected << { type: :work, duration: 20, repetition: true }
          expected << { type: :rest, duration: 10, repetition: true }
        end
        expect(result).to eq(expected)
      end
    end

    context 'with invalid syntax' do
      it 'raises error for invalid segment type' do
        expect { described_class.new('30x').parse }.to raise_error(Intervals::Parser::ParseError)
      end

      it 'raises error for invalid time format' do
        expect { described_class.new('abcw').parse }.to raise_error(Intervals::Parser::ParseError)
      end

      it 'raises error for empty string' do
        expect { described_class.new('').parse }.to raise_error(Intervals::Parser::ParseError, /empty/i)
      end

      it 'raises error for mismatched parentheses' do
        expect { described_class.new('10(30w').parse }.to raise_error(Intervals::Parser::ParseError, /parenthes/i)
      end

      it 'raises error for empty repetition' do
        expect { described_class.new('10()').parse }.to raise_error(Intervals::Parser::ParseError)
      end
    end
  end
end
