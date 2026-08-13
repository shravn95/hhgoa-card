export function Header() {
  return (
    <header className="relative bg-[#0B6839] z-50 overflow-hidden border-b border-white/10 px-8 py-4 md:px-16">
      <div className="relative flex items-center justify-between">
        <a
          href="https://x.com/247pmstudio"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open 247PM Studio on X in a new tab"
          className="leading-none"
        >
          <img
            src="/studio-247.svg"
            alt="247PM Studio Logo"
            className="h-10 w-auto"
          />
        </a>

        <nav className="flex items-center gap-3">
          <a
            href="https://hhgoa.com"
            className="inline-flex items-center justify-center rounded-full border border-[#b80e67] bg-[#FF128B] px-5 py-2 text-base font-black uppercase text-[#FEE101] shadow-[0_6px_0_#8f0b50,0_12px_18px_rgba(0,0,0,0.18)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_0_#8f0b50,0_14px_20px_rgba(0,0,0,0.18)] active:translate-y-1 active:shadow-[0_2px_0_#8f0b50,0_4px_8px_rgba(0,0,0,0.16)]"
          >
            APPLY @ HHGOA.COM
          </a>
        </nav>
      </div>
    </header>
  );
}
