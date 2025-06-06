import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gradient-to-br from-red-700 to-orange-700">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="no-underline">
          <Image 
            src="/logo_w_text.png" 
            alt="Logo" 
            width={300} 
            height={79} 
            className="py-1"
            style={{ objectFit: 'contain' }}
          />
        </Link>
        <h2 className="text-base font-bold no-underline mx-auto" style={{ color: 'white' }}>MoonPlace.io</h2>
        <Image 
          src="/moon.png" 
          alt="Moon" 
          width={70} 
          height={42} 
          className="mr-2" 
        />
      </div>
    </header>
  );
}
