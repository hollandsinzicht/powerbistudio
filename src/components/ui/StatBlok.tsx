interface StatBlokProps {
  value: string;
  label: string;
}

export default function StatBlok({ value, label }: StatBlokProps) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-5xl font-display font-semibold text-[var(--color-neutral-900)]">
        {value}
      </div>
      <p className="text-[var(--color-neutral-700)] text-sm mt-2">{label}</p>
    </div>
  );
}
