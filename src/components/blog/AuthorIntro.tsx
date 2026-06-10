import Image from 'next/image';
import Link from 'next/link';

export default function AuthorIntro() {
  return (
    <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gray-50 border border-[var(--color-neutral-200)]">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--color-neutral-200)] shrink-0">
        <Image
          src="/jan-willem.jpg"
          alt="Jan Willem den Hollander"
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      </div>
      <div>
        <Link href="/over" className="font-display font-semibold text-sm text-[var(--color-neutral-900)] hover:text-[var(--color-primary-900)] transition-colors">
          Jan Willem den Hollander
        </Link>
        <p className="text-[var(--color-neutral-700)] text-xs leading-relaxed">
          Power BI architect, LSS Black Belt. 15 jaar ervaring in data & business intelligence.
        </p>
      </div>
    </div>
  );
}
