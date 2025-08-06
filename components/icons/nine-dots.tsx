export function NineDotsIcon({ className }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 gap-[2px] ${className}`}
      style={{ width: "1rem", height: "1rem" }} // 控制整体尺寸
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] h-[3px] rounded-full bg-current"
        />
      ))}
    </div>
  );
}