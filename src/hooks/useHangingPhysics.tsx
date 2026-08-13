import { useState } from "react";
import { useMotionValue, useSpring, useTransform, animate } from "motion/react";

export const STRING_LENGTH = 120; // px from peg to card's top edge at rest

export function useHangingPhysics() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  // Swing angle follows horizontal displacement, like a real pendulum,
  // then gets smoothed through a spring so it never snaps instantly.
  const rotateRaw = useTransform(x, [-160, 160], [-20, 20]);
  const rotate = useSpring(rotateRaw, {
    stiffness: 260,
    damping: 18,
    mass: 0.4,
  });

  function onDragStart() {
    setIsDragging(true);
  }

  function onDragEnd() {
    setIsDragging(false);
    // little settle bounce so it doesn't feel like it just stops dead
    animate(y, [y.get(), y.get() * 0.3, 0], {
      type: "spring",
      stiffness: 220,
      damping: 12,
    });
  }

  return { x, y, rotate, isDragging, onDragStart, onDragEnd };
}
