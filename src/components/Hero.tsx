import { motion } from "motion/react";
import { HangingCard } from "./HangingCard";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden px-8 pb-16 pt-14 md:px-16">
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.05fr)_auto] md:items-start">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="mb-4 flex items-center gap-3">
            <img
              src="/wordmark.png"
              alt="HH Goa 2026 Logo"
              className="h-20 w-auto"
            />
            <img
              src="/goa.svg"
              alt="HH Goa 2026 Text"
              className="h-15 w-auto"
            />
          </motion.div>

          <motion.p
            variants={item}
            className="mb-8 text-base font-bold text-white/80 md:text-lg"
            style={{ fontFamily: "var(--sekuya)" }}
          >
            GOA, INDIA &nbsp;·&nbsp; 28–31 OCT{" "}
            <span className="bg-hhyellow px-1.5 py-0.5 bg-[#FEE101] text-black">
              2026
            </span>
          </motion.p>

          <motion.h2
            variants={item}
            className="mb-6 text-4xl text-[#FEE101] font-medium leading-[1.1] text-hhyellow md:text-5xl"
          >
            Upload Once.
            <br />
            Ship a Frame.
            <br />
            flex on X.
          </motion.h2>

          <motion.p
            variants={item}
            className="mb-8 max-w-md text-sm text-white"
            style={{ fontFamily: "var(--noto)" }}
          >
            Drop in a picture and take out an HH Goa 2026 profile frame, a
            builder ID with your name and stack, or one frame for your whole
            crew. Drawn in your browser in a few hundred milliseconds.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#make"
              className="inline-flex items-center justify-center text-lg rounded-full border border-[#b80e67] bg-[#FF128B] px-8 py-3 font-black uppercase text-[#FEE101] shadow-[0_6px_0_#8f0b50,0_12px_18px_rgba(0,0,0,0.18)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_0_#8f0b50,0_14px_20px_rgba(0,0,0,0.18)] active:translate-y-1 active:shadow-[0_2px_0_#8f0b50,0_4px_8px_rgba(0,0,0,0.16)]"
            >
              MAKE YOURS
            </a>
          </motion.div>
        </motion.div>

        <div className="flex justify-center md:justify-end">
          <HangingCard />
        </div>
      </div>
    </section>
  );
}
