import { motion } from "motion/react";
import { useRef } from "react";
import { useHangingPhysics, STRING_LENGTH } from "../hooks/useHangingPhysics";
import { Lanyard } from "./Lanyard";
import { IDCard } from "./IDCard";

const CONTAINER_WIDTH = 340;

export function HangingCard() {
  const { x, y, rotate, isDragging, onDragStart, onDragEnd } =
    useHangingPhysics();
  const constraintsRef = useRef(null);

  return (
    <div
      ref={constraintsRef}
      className="relative mx-auto"
      style={{ width: CONTAINER_WIDTH, height: STRING_LENGTH + 420 }}
    >
      <Lanyard x={x} y={y} width={CONTAINER_WIDTH} />

      {/* small clip connecting string to card top edge */}
      <div
        className="absolute left-1/2 h-4 w-8 -translate-x-1/2  bg-[#0b3d2e]"
        style={{ top: STRING_LENGTH - 14 }}
      />

      <motion.div
        className="absolute left-1/2 origin-top cursor-grab active:cursor-grabbing"
        style={{ top: STRING_LENGTH, x, y, rotate, translateX: "-50%" }}
        drag
        dragConstraints={{ top: -60, bottom: 100, left: -140, right: 140 }}
        dragElastic={0.55}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 14 }}
        dragSnapToOrigin
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.04, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}
        animate={!isDragging ? { rotate: [0, 3, 0, -3, 0] } : undefined}
        transition={
          !isDragging
            ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
      >
        <IDCard
          name="Sujal Sakla"
          role="Rust Developer"
          builderId="#HH-GOA-7072"
          photoUrl="/id-card.png"
          cardImageUrl="/id-card.png"
        />
      </motion.div>
    </div>
  );
}
