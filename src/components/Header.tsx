import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-gradient-to-br from-red-700 to-orange-700">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="no-underline">
          <Image 
            src="/logo_light-01.png" 
            alt="Logo" 
            width={150} 
            height={38} 
            className="py-1"
            style={{ objectFit: 'contain' }}
          />
        </Link>
        <h4 className="text-base font-bold no-underline mx-auto" style={{ color: 'white' }}>Moon Pixel Map</h4>
        <Image 
          src="/moon.png" 
          alt="Moon" 
          width={24} 
          height={24} 
          className="mr-2" 
        />
      </div>
    </header>
  );
}
