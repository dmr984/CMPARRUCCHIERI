import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center justify-center size-10">
      <Image 
        src="https://i.postimg.cc/GmFvBbPV/IMG-20251029-WA0025.jpg" 
        alt="Logo CM Parrucchieri" 
        width={40} 
        height={40}
        className="rounded-lg"
        />
    </div>
  );
}
