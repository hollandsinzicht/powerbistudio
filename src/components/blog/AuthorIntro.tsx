import Image from 'next/image';
import Link from 'next/link';

export default function AuthorIntro() {
  return (
    <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gray-50 border border-[var(--border)]">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
        <Image
          src="/jan-willem.jpg"
          alt="Jan Willem den Hollander"
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      </div>
      <div>
        <Link href="/over" className="font-display font-bold text-sm text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
          Jan Willem den Hollander
        </Link>
        <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
          Power BI architect, LSS Black Belt. 15 jaar ervaring in data & business intelligence.
        </p>
      </div>
    </div>
  );
}
