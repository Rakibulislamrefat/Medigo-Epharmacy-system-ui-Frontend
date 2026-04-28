const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3 bg-primary/10 rounded-2xl rounded-tl-sm w-fit">
    <span className="text-xs text-primary/60 font-medium mr-1">MediBot</span>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
      />
    ))}
  </div>
);

export default TypingIndicator;