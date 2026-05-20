import Image from 'next/image';

export default function QubitedgeLogo({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image
        src="/logo.jpg"
        alt="qubitedge Logo"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        unoptimized
      />
    </div>
  );
}
