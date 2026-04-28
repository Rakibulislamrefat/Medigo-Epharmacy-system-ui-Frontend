interface QuickSuggestionsProps {
  onSelect: (text: string) => void;
}

const suggestions = [
  "Find paracetamol",
  "Upload prescription",
  "Track my order",
  "Special offers",
  "I have a headache",
  "Contact support",
];

const QuickSuggestions = ({ onSelect }: QuickSuggestionsProps) => (
  <div className="px-4 pb-2">
    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
      Quick Actions
    </p>
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="px-3 py-1.5 rounded-full text-xs font-medium
            bg-primary/8 text-primary border border-primary/20
            hover:bg-primary hover:text-white hover:border-primary
            active:scale-95 transition-all duration-150"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
);

export default QuickSuggestions;