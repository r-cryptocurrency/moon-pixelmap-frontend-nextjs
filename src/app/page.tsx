export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 mx-auto w-full max-w-[1000px] text-center">
      {/* Final snapshot of the pixel map */}
      <div className="panel p-2 lg:p-3 w-full bg-black/20 rounded-2xl shadow-2xl">
        <img
          src="/final-snapshot.png"
          alt="Final snapshot of the Moonplace pixel map"
          className="w-full h-auto rounded-xl border border-white/20"
        />
      </div>

      <h1 className="mt-8 text-3xl md:text-5xl font-extrabold text-balance drop-shadow-lg">
        So long, and thanks for all the fish 🐬
      </h1>

      <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/90 text-balance">
        Moonplace — the Moon Pixel Map — has reached the end of its journey. The
        canvas above is its final snapshot, preserved as it was. Arbitrum Nova is
        deprecated, and Moonplace is now in permanent archive mode: no more
        pixels, no chat, no transactions. Thank you to everyone who placed a
        pixel. This isn&apos;t the end of the story — something new is coming.
        Watch this space. 🌒
      </p>
    </div>
  );
}
