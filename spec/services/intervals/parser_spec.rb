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

      it 'parses complex sequences' do
        result = described_class.new('10p+5mwu+30w+15r').parse
        expect(result).to eq([
          { type: :prepare, duration: 10 },
          { type: :warmup, duration: 300 },
          { type: :work, duration: 30 },
          { type: :rest, duration: 15 }
        ])
      end
    end

    context 'with invalid syntax' do
      it 'raises error for invalid segment type' do
        expect { described_class.new('30x').parse }.to raise_error(Intervals::Parser::ParseError, /unknown segment type/i)
      end

      it 'raises error for invalid time format' do
        expect { described_class.new('abcw').parse }.to raise_error(Intervals::Parser::ParseError)
      end

      it 'raises error for empty string' do
        expect { described_class.new('').parse }.to raise_error(Intervals::Parser::ParseError, /empty/i)
      end
    end
  end
end
