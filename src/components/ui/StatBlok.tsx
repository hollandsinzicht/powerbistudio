interface StatBlokProps {
  value: string;
  label: string;
}

export default function StatBlok({ value, label }: StatBlokProps) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-5xl font-display font-bold text-[var(--text-primary)]">
        {value}
      </div>
      <p className="text-[var(--text-secondary)] text-sm mt-2">{label}</p>
    </div>
  );
}
