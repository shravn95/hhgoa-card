import { motion } from "motion/react";

const footerLinks = [
  { label: "Apply", href: "https://hhgoa.com", external: true },
  { label: "247PM Studio", href: "https://x.com/247pmstudio", external: true },
  { label: "Build Your Card", href: "#frame-builder", external: false },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#FEE101]/10 bg-[#063e24] text-[#f6efe0]">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-24 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-[#FEE101]/[0.03] blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-16">
        {/* Top section */}
        <motion.div
          className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Branding */}
          <div className="text-center md:text-left">
            <motion.div
              className="mb-3 text-2xl font-semibold leading-none tracking-[0.08em] text-[#FEE101] md:text-3xl"
              style={{ fontFamily: "var(--heading)" }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              HACKER HOUSE
            </motion.div>

            <div
              className="text-xs font-bold uppercase tracking-[0.35em] text-white"
              style={{ fontFamily: "var(--noto)" }}
            >
              Goa, India · 28–31 Oct 2026
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer noopener" : undefined}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f6efe0]/50 transition-colors hover:text-[#FEE101]"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="my-8 h-px bg-gradient-to-r from-transparent via-[#FEE101]/15 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Bottom bar */}
        <motion.div
          className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6efe0]/25"
            style={{ fontFamily: "var(--noto)" }}
          >
            © 2026 Hacker House Goa · Built with 🌴 by{" "}
            <a
              href="https://x.com/247pmstudio"
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#FEE101]/40 transition-colors hover:text-[#FEE101]"
            >
              247PM Studio
            </a>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6efe0]/25">
              #FRAMEINGOA
            </span>
            <span className="text-[#FEE101]/20">·</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6efe0]/25">
              Build · Ship · Repeat
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
