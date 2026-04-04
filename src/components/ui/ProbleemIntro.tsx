import { AlertTriangle } from 'lucide-react';

interface ProbleemIntroProps {
  children: React.ReactNode;
}

export default function ProbleemIntro({ children }: ProbleemIntroProps) {
  return (
    <div className="bg-[rgba(245,158,11,0.05)] border-l-4 border-[var(--accent)] rounded-r-xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        <AlertTriangle size={24} className="text-[var(--accent)] shrink-0 mt-0.5" />
        <div className="text-[var(--text-secondary)] leading-relaxed text-[0.95rem]">
          {children}
        </div>
      </div>
    </div>
  );
}
