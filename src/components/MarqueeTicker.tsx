import { motion } from "motion/react";

const items = ["2:47 PM STUDIO", "GOA, INDIA", "28–31 OCT 2026", "#FRAMEINGOA"];

export function MarqueeTicker() {
  const track = [...items, ...items]; // duplicated for a seamless loop

  return (
    <div className="overflow-hidden border-y-2 bg-[#FEE101] py-2.5">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap text-xs font-bold tracking-wider text-black"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {track.map((text, i) => (
          <span key={i} className="flex items-center gap-10">
            {text}
            <span className="text-[#FF128B]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
