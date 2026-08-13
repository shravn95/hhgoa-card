import { motion, useTransform, type MotionValue } from "motion/react";
import { STRING_LENGTH } from "../hooks/useHangingPhysics";

interface LanyardProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: number;
  color?: string;
}

export function Lanyard({ x, y, width, color = "#0b3d2e" }: LanyardProps) {
  const anchorX = width / 2;
  const anchorY = -4;

  const d = useTransform(() => {
    const lx = x.get();
    const ly = y.get();
    const cardX = anchorX + lx;
    const cardY = STRING_LENGTH + ly;
    const midX = anchorX + lx * 0.6;
    const midY = anchorY + (cardY - anchorY) * 0.45;
    return `M ${anchorX} ${anchorY} Q ${midX} ${midY} ${cardX} ${cardY}`;
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      width={width}
      height={STRING_LENGTH + 40}
    >
      <circle cx={anchorX} cy={anchorY} r={5} fill={color} />
      <circle
        cx={anchorX}
        cy={anchorY}
        r={9}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.35}
      />
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
