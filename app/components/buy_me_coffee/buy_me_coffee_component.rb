module BuyMeCoffee
  class BuyMeCoffeeComponent < ViewComponent::Base
    def initialize(style: :default)
      @style = style
    end

    def button_classes
      case @style
      when :nav
        "px-4 py-2 bg-amber-500 text-slate-900 border-2 border-amber-600 hover:bg-amber-600 hover:border-amber-700 rounded-lg text-sm font-semibold transition-colors"
      when :hero
        "inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
      when :default
        "px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors"
      else
        # Fallback for any unexpected style values
        "px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors"
      end
    end
  end
end
