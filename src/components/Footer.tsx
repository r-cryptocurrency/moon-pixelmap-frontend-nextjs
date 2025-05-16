import Image from 'next/image';

const Footer = () => {
  return (
    <footer 
      className="text-white mt-auto bg-cover bg-center h-12 min-h-12"
      style={{ backgroundImage: "url('/Banner_1.jpg')" }}
    >
      <div className="w-full h-full flex items-center justify-between bg-black bg-opacity-50">
        <div className="flex-grow text-center">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} Moon Pixel Map. All rights reserved.</p>
        </div>
        <Image 
          src="/cc_256_logo.svg" 
          alt="Creative Commons Logo" 
          width={24} 
          height={24} 
          className="m-2"
        />
      </div>
    </footer>
  );
};

export default Footer;
