import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center justify-center size-10">
      <Image 
        src="/icon-192x192.png" 
        alt="Logo CM Parrucchieri" 
        width={40} 
        height={40}
        className="rounded-lg"
        />
    </div>
  );
}
