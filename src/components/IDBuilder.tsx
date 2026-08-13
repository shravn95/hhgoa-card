import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { motion, AnimatePresence } from "motion/react";

// ============================================================
// CARD TEMPLATE
// ============================================================

const CARD_W = 1023;
const CARD_H = 1537;

const TEMPLATE_PATH = "/id_template.jpeg";

// ============================================================
// PHOTO POSITION
// ============================================================
//
// Based on the actual 1023 × 1537 blank template.
//
// The photo is drawn inside the existing green frame.
// The four cream corner areas are restored from the
// original template after the photo is drawn.
// ============================================================

const PHOTO_X = 220;
const PHOTO_Y = 357;
const PHOTO_W = 585;
const PHOTO_H = 600;

// ============================================================
// PHOTO CORNER OVERLAYS
// ============================================================
//
// These are the four cream/corner areas that belong to the
// original template. They are restored after drawing the photo.
//
// This is MUCH safer than trying to detect colors/pixels.
// ============================================================

const TOP_LEFT_CORNER = {
  x: 220,
  y: 357,
  w: 101,
  h: 82,
};

const TOP_RIGHT_CORNER = {
  x: 720,
  y: 357,
  w: 85,
  h: 82,
};

const BOTTOM_LEFT_CORNER = {
  x: 220,
  y: 856,
  w: 101,
  h: 101,
};

const BOTTOM_RIGHT_CORNER = {
  x: 720,
  y: 856,
  w: 85,
  h: 101,
};

// ============================================================
// NAME
// ============================================================

const NAME_X = 220;
const NAME_Y = 1096;

const NAME_MAX_WIDTH = 535;
const NAME_FONT_SIZE = 52;

// ============================================================
// DEVELOPER TITLE
// ============================================================

const DEV_TITLE_Y = 1178;
const DEV_TITLE_FONT_SIZE = 24;

// ============================================================
// ROLE
// ============================================================

const ROLE_BOX_X = 252;
const ROLE_BOX_Y = 1207;
const ROLE_BOX_W = 519;
const ROLE_BOX_H = 76;

const ROLE_Y = 1245;
const ROLE_FONT_SIZE = 34;
const ROLE_MAX_WIDTH = 430;

// ============================================================
// COLORS
// ============================================================

const DARK_GREEN = "#0b3d2e";
const DEEP_GREEN = "#063e24";
const ROLE_TEXT = "#b7d2aa";
const GOLD = "#c9a84c";
const CREAM = "#f7efdf";
const PINK = "#e6317a";

// ============================================================
// MOTION
// ============================================================

const sectionVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const fadeScale = {
  hidden: {
    opacity: 0,
    scale: 0.92,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const modalOverlay = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const modalContent = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

// ============================================================
// IMAGE LOADER
// ============================================================

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = src;
  });
}

// ============================================================
// ROUNDED RECT
// ============================================================

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);

  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.lineTo(x + w - radius, y);

  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);

  ctx.lineTo(x + w, y + h - radius);

  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);

  ctx.lineTo(x + radius, y + h);

  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);

  ctx.lineTo(x, y + radius);

  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.closePath();
}

// ============================================================
// COVER-FIT IMAGE
// ============================================================

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.width / image.height;

  const targetRatio = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceW = image.width;
  let sourceH = image.height;

  if (imageRatio > targetRatio) {
    sourceW = image.height * targetRatio;

    sourceX = (image.width - sourceW) / 2;
  } else {
    sourceH = image.width / targetRatio;

    sourceY = (image.height - sourceH) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, x, y, width, height);
}

// ============================================================
// RESTORE ORIGINAL TEMPLATE CORNERS
// ============================================================
//
// We copy these areas directly from the original template.
// No color detection.
// No transparency.
// No pixel manipulation.
//
// This eliminates the white/missing/blurry artifacts.
// ============================================================

function restoreTemplateRegion(
  ctx: CanvasRenderingContext2D,
  template: HTMLImageElement,
  region: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
) {
  ctx.drawImage(
    template,
    region.x,
    region.y,
    region.w,
    region.h,
    region.x,
    region.y,
    region.w,
    region.h,
  );
}

// ============================================================
// COMPOSITE CARD
// ============================================================

async function compositeIDCard(
  photoUrl: string,
  name: string,
  role: string,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;

  const [template, photo] = await Promise.all([
    loadImage(TEMPLATE_PATH),
    loadImage(photoUrl),
  ]);

  const canvas = document.createElement("canvas");

  canvas.width = CARD_W;
  canvas.height = CARD_H;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ==========================================================
  // 1. ORIGINAL TEMPLATE
  // ==========================================================

  ctx.drawImage(template, 0, 0, CARD_W, CARD_H);

  // ==========================================================
  // 2. PHOTO
  // ==========================================================
  //
  // Draw the photo into the actual photo area.
  //
  // IMPORTANT:
  // No weird polygon clipping.
  // No pixel transparency.
  // No color detection.
  // ==========================================================

  ctx.save();

  roundedRectPath(ctx, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H, 22);

  ctx.clip();

  drawCoverImage(ctx, photo, PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H);

  ctx.restore();

  // ==========================================================
  // 3. RESTORE TEMPLATE CORNER ARTWORK
  // ==========================================================
  //
  // This restores the original cream corner blocks and
  // pink/yellow accents exactly as they exist in the template.
  // ==========================================================

  restoreTemplateRegion(ctx, template, TOP_LEFT_CORNER);

  restoreTemplateRegion(ctx, template, TOP_RIGHT_CORNER);

  restoreTemplateRegion(ctx, template, BOTTOM_LEFT_CORNER);

  restoreTemplateRegion(ctx, template, BOTTOM_RIGHT_CORNER);

  // ==========================================================
  // 4. NAME
  // ==========================================================

  ctx.save();

  const displayName = name.trim().toUpperCase();

  ctx.fillStyle = DARK_GREEN;

  ctx.textAlign = "center";

  ctx.textBaseline = "middle";

  let nameFontSize = NAME_FONT_SIZE;

  ctx.font = `900 ${nameFontSize}px "Playfair Display", serif`;

  while (
    ctx.measureText(displayName).width > NAME_MAX_WIDTH &&
    nameFontSize > 28
  ) {
    nameFontSize -= 2;

    ctx.font = `900 ${nameFontSize}px "Playfair Display", serif`;
  }

  ctx.fillText(displayName, NAME_X + NAME_MAX_WIDTH / 2, NAME_Y);

  ctx.restore();

  // ==========================================================
  // 5. DEVELOPER TITLE
  // ==========================================================
  //
  // The original template has this in pink.
  // We cover ONLY that small text region and redraw it
  // in the requested darker green.
  // ==========================================================

  ctx.save();

  // Cover the original pink title.
  ctx.fillStyle = CREAM;

  ctx.fillRect(280, 1157, 463, 43);

  // Title
  const developerTitle = "DEVELOPER TITLE";

  ctx.fillStyle = DARK_GREEN;

  ctx.font = `900 ${DEV_TITLE_FONT_SIZE}px "Noto Sans", sans-serif`;

  ctx.textAlign = "center";

  ctx.textBaseline = "middle";

  ctx.fillText(developerTitle, CARD_W / 2, DEV_TITLE_Y);

  // Decorative dashed lines
  ctx.strokeStyle = DARK_GREEN;

  ctx.lineWidth = 2;

  ctx.setLineDash([5, 5]);

  ctx.beginPath();

  ctx.moveTo(285, DEV_TITLE_Y);

  ctx.lineTo(385, DEV_TITLE_Y);

  ctx.moveTo(638, DEV_TITLE_Y);

  ctx.lineTo(738, DEV_TITLE_Y);

  ctx.stroke();

  ctx.setLineDash([]);

  ctx.restore();

  // ==========================================================
  // 6. ROLE BANNER
  // ==========================================================
  //
  // This matches the corrected design:
  //
  // dark green banner
  // gold border
  // bold light-green role
  // gold stars
  // ==========================================================

  ctx.save();

  // Outer banner
  roundedRectPath(ctx, ROLE_BOX_X, ROLE_BOX_Y, ROLE_BOX_W, ROLE_BOX_H, 12);

  ctx.fillStyle = DEEP_GREEN;

  ctx.fill();

  ctx.strokeStyle = GOLD;

  ctx.lineWidth = 3;

  ctx.stroke();

  // Role text
  const displayRole = role.trim().toUpperCase();

  let roleFontSize = ROLE_FONT_SIZE;

  ctx.fillStyle = ROLE_TEXT;

  ctx.textAlign = "center";

  ctx.textBaseline = "middle";

  ctx.font = `900 ${roleFontSize}px "Noto Sans", sans-serif`;

  while (
    ctx.measureText(displayRole).width > ROLE_MAX_WIDTH &&
    roleFontSize > 18
  ) {
    roleFontSize -= 2;

    ctx.font = `900 ${roleFontSize}px "Noto Sans", sans-serif`;
  }

  ctx.fillText(displayRole, CARD_W / 2, ROLE_Y);

  // Stars
  ctx.fillStyle = GOLD;

  ctx.font = "900 19px sans-serif";

  const roleWidth = ctx.measureText(displayRole).width;

  ctx.fillText("✦", CARD_W / 2 - roleWidth / 2 - 24, ROLE_Y);

  ctx.fillText("✦", CARD_W / 2 + roleWidth / 2 + 24, ROLE_Y);

  ctx.restore();

  return canvas;
}

// ============================================================
// COMPONENT
// ============================================================

export function IDCardBuilder() {
  const sectionRef = useRef<HTMLElement>(null);

  const [name, setName] = useState("");

  const [role, setRole] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");

  // Crop modal
  const [showCropModal, setShowCropModal] = useState(false);

  const [imageToCrop, setImageToCrop] = useState("");

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Card modal
  const [showCardModal, setShowCardModal] = useState(false);

  const [isBuilding, setIsBuilding] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const [previewDataUrl, setPreviewDataUrl] = useState("");

  const photoReady = photoUrl.trim() !== "";

  const nameReady = name.trim() !== "";

  const roleReady = role.trim() !== "";

  const isComplete = photoReady && nameReady && roleReady;

  const completedSteps = [photoReady, nameReady, roleReady].filter(
    Boolean,
  ).length;

  // ==========================================================
  // PHOTO UPLOAD
  // ==========================================================

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);

    setCroppedAreaPixels(null);

    setImageToCrop(imageUrl);

    setShowCropModal(true);

    event.target.value = "";
  };

  // ==========================================================
  // CROP COMPLETE
  // ==========================================================

  const handleCropComplete = (_area: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  // ==========================================================
  // CREATE CROPPED PHOTO
  // ==========================================================

  const createCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<string> => {
    const image = new Image();

    image.src = imageSrc;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");

    // High resolution output
    const outputW = 1400;

    const outputH = Math.round(outputW * (PHOTO_H / PHOTO_W));

    canvas.width = outputW;

    canvas.height = outputH;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not create canvas context");
    }

    ctx.imageSmoothingEnabled = true;

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputW,
      outputH,
    );

    return canvas.toDataURL("image/jpeg", 0.98);
  };

  // ==========================================================
  // USE PHOTO
  // ==========================================================

  const handleUsePhoto = async () => {
    if (!imageToCrop || !croppedAreaPixels) {
      return;
    }

    try {
      const croppedImage = await createCroppedImage(
        imageToCrop,
        croppedAreaPixels,
      );

      setPhotoUrl(croppedImage);

      setShowCropModal(false);

      URL.revokeObjectURL(imageToCrop);

      setImageToCrop("");
    } catch (error) {
      console.error("Failed to crop image:", error);
    }
  };

  // ==========================================================
  // CANCEL CROP
  // ==========================================================

  const handleCancelCrop = () => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }

    setImageToCrop("");

    setShowCropModal(false);
  };

  // ==========================================================
  // BUILD CARD
  // ==========================================================

  const handleBuild = useCallback(async () => {
    if (!isComplete) {
      return;
    }

    setIsBuilding(true);

    try {
      const canvas = await compositeIDCard(photoUrl, name, role);

      const dataUrl = canvas.toDataURL("image/png");

      setPreviewDataUrl(dataUrl);

      setShowCardModal(true);
    } catch (error) {
      console.error("Failed to build ID card:", error);
    } finally {
      setIsBuilding(false);
    }
  }, [isComplete, photoUrl, name, role]);

  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const canvas = await compositeIDCard(photoUrl, name, role);

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");

      const safeName = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      link.download = `${safeName || "hacker-house"}-id-card.png`;

      link.href = dataUrl;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download ID card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ==========================================================
  // POST ON X
  // ==========================================================

  const handlePostOnX = () => {
    const text = `Just built my Hacker House Goa 2026 ID card 🌴

${name} — ${role}

#FRAMEINGOA #HackerHouse`;

    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}`;

    window.open(xUrl, "_blank", "noopener,noreferrer");
  };

  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (showCropModal) {
        handleCancelCrop();
        return;
      }

      if (showCardModal) {
        setShowCardModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCropModal, showCardModal, imageToCrop]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ======================================================
          BUILDER
      ======================================================= */}

      <section
        ref={sectionRef}
        id="frame-builder"
        className="relative overflow-hidden bg-[#0B6839] px-5 py-20 text-[#FEE101] md:px-8 md:py-24"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#FEE101]/[0.04] blur-[100px]" />

          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#e6317a]/[0.03] blur-[120px]" />
        </div>

        <motion.div
          className="relative mx-auto max-w-lg"
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: "-60px",
          }}
        >
          {/* Heading */}

          <motion.div className="mb-9 text-center" variants={fadeUp}>
            <motion.div
              className="mb-3 flex items-center justify-center gap-3"
              variants={staggerItem}
            >
              <motion.span
                className="h-px w-8 bg-[#FEE101]"
                initial={{
                  scaleX: 0,
                }}
                whileInView={{
                  scaleX: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                }}
              />

              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                ID CARD GENERATOR
              </span>

              <motion.span
                className="h-px w-8 bg-[#FEE101]"
                initial={{
                  scaleX: 0,
                }}
                whileInView={{
                  scaleX: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                }}
              />
            </motion.div>

            <motion.h2
              className="text-4xl leading-[0.9] md:text-5xl lg:text-6xl"
              style={{
                fontFamily: "var(--heading)",
              }}
              variants={fadeUp}
            >
              Build your Hacker House identity.
            </motion.h2>

            <motion.p
              className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#f6efe0]/60"
              variants={fadeUp}
            >
              Upload your photo, enter your details and create your Hacker House
              Goa 2026 ID card.
            </motion.p>
          </motion.div>

          {/* Form */}

          <motion.div
            className="mx-auto max-w-md rounded-[22px] border border-[#FEE101]/25 bg-[#075c32] p-5 shadow-[0_15px_50px_rgba(0,0,0,0.12)] md:p-7"
            variants={fadeScale}
          >
            {/* Progress */}

            <motion.div
              className="mb-6 flex items-center justify-center gap-2"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#064f2c]"
                  variants={staggerItem}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#FEE101]"
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: completedSteps > i ? "100%" : "0%",
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.05,
                    }}
                  />
                </motion.div>
              ))}

              <span className="ml-2 text-[10px] font-bold tabular-nums text-[#FEE101]/40">
                {completedSteps}/3
              </span>
            </motion.div>

            <div className="flex flex-col gap-5">
              {/* Photo */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
              >
                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em]">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black transition-colors duration-300 ${
                      photoReady
                        ? "bg-[#FEE101] text-[#0B6839]"
                        : "border border-[#FEE101]/30 text-[#FEE101]/40"
                    }`}
                  >
                    {photoReady ? "✓" : "1"}
                  </span>
                  Your photo
                </label>

                <motion.label
                  htmlFor="id-photo"
                  className="group relative flex h-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-[15px] border border-dashed border-[#FEE101]/30 bg-[#064f2c] transition-colors hover:border-[#FEE101]"
                  whileHover={{
                    scale: 1.01,
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {photoUrl ? (
                      <motion.div
                        key="photo-preview"
                        className="absolute inset-0"
                        initial={{
                          opacity: 0,
                          scale: 1.08,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.4,
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt="Selected photo"
                          className="absolute inset-0 h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white">
                            ✏️ Edit photo
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="photo-empty"
                        className="text-center"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                      >
                        <motion.div
                          className="mb-3 text-3xl"
                          animate={{
                            y: [0, -4, 0],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          📸
                        </motion.div>

                        <div className="text-sm font-black uppercase tracking-[0.1em]">
                          Upload your photo
                        </div>

                        <div className="mt-1 text-xs text-[#f6efe0]/35">
                          JPG, PNG or WEBP
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    id="id-photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </motion.label>
              </motion.div>

              {/* Name */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
              >
                <label
                  htmlFor="id-name"
                  className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em]"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black transition-colors duration-300 ${
                      nameReady
                        ? "bg-[#FEE101] text-[#0B6839]"
                        : "border border-[#FEE101]/30 text-[#FEE101]/40"
                    }`}
                  >
                    {nameReady ? "✓" : "2"}
                  </span>
                  Your name
                </label>

                <motion.input
                  id="id-name"
                  type="text"
                  value={name}
                  maxLength={24}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Shravan Chaudhari"
                  className="w-full rounded-[11px] border border-[#FEE101]/20 bg-[#064f2c] px-4 py-3.5 text-sm font-bold text-[#f6efe0] outline-none transition-all placeholder:text-[#f6efe0]/25 focus:border-[#FEE101] focus:shadow-[0_0_0_3px_rgba(254,225,1,0.1)]"
                  whileFocus={{
                    scale: 1.01,
                  }}
                />
              </motion.div>

              {/* Role */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
              >
                <label
                  htmlFor="id-role"
                  className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em]"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black transition-colors duration-300 ${
                      roleReady
                        ? "bg-[#FEE101] text-[#0B6839]"
                        : "border border-[#FEE101]/30 text-[#FEE101]/40"
                    }`}
                  >
                    {roleReady ? "✓" : "3"}
                  </span>
                  Developer title
                </label>

                <motion.input
                  id="id-role"
                  type="text"
                  value={role}
                  maxLength={24}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Frontend Alchemist"
                  className="w-full rounded-[11px] border border-[#FEE101]/20 bg-[#064f2c] px-4 py-3.5 text-sm font-bold uppercase text-[#f6efe0] outline-none transition-all placeholder:text-[#f6efe0]/25 focus:border-[#FEE101] focus:shadow-[0_0_0_3px_rgba(254,225,1,0.1)]"
                  whileFocus={{
                    scale: 1.01,
                  }}
                />
              </motion.div>

              {/* Build */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
              >
                <motion.button
                  type="button"
                  onClick={handleBuild}
                  disabled={!isComplete || isBuilding}
                  className="relative mt-1 w-full overflow-hidden rounded-full bg-[#FEE101] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#0B6839] disabled:cursor-not-allowed disabled:opacity-30"
                  whileHover={
                    isComplete && !isBuilding
                      ? {
                          y: -2,
                          boxShadow: "0 8px 0 #e6317a",
                        }
                      : {}
                  }
                  whileTap={
                    isComplete && !isBuilding
                      ? {
                          y: 0,
                          scale: 0.98,
                        }
                      : {}
                  }
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  {isComplete && !isBuilding && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 3,
                      }}
                    />
                  )}

                  <span className="relative">
                    {isBuilding
                      ? "Building your ID card..."
                      : "Build my ID card →"}
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ======================================================
          CROP MODAL
      ======================================================= */}

      <AnimatePresence>
        {showCropModal && imageToCrop && (
          <motion.div
            key="crop-overlay"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#031f13]/90 px-4 py-5 backdrop-blur-md"
            {...modalOverlay}
          >
            <motion.div
              className="flex max-h-[94vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[22px] border border-[#FEE101]/20 bg-[#0B6839] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
              {...modalContent}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#FEE101]/15 px-5 py-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FEE101]/60">
                    Step 01
                  </div>

                  <div className="mt-1 text-sm font-black uppercase tracking-[0.08em]">
                    Crop your photo
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleCancelCrop}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FEE101]/20 text-lg transition hover:bg-[#FEE101] hover:text-[#0B6839]"
                  whileHover={{
                    rotate: 90,
                  }}
                  whileTap={{
                    scale: 0.85,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  ×
                </motion.button>
              </div>

              <div
                className="relative mx-auto my-5 w-[min(82vw,420px)] overflow-hidden rounded-[14px] bg-black"
                style={{
                  aspectRatio: `${PHOTO_W} / ${PHOTO_H}`,
                }}
              >
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={PHOTO_W / PHOTO_H}
                  cropShape="rect"
                  showGrid={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  objectFit="contain"
                />
              </div>

              <div className="px-6 pb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Zoom
                  </span>

                  <span className="text-[10px] font-bold text-[#FEE101]/50">
                    {zoom.toFixed(1)}×
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-[#FEE101]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#FEE101]/15 bg-[#075c32] p-4">
                <motion.button
                  type="button"
                  onClick={handleCancelCrop}
                  className="rounded-full border border-[#FEE101]/30 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition hover:border-[#FEE101]"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleUsePhoto}
                  className="rounded-full bg-[#FEE101] px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-[#0B6839]"
                  whileHover={{
                    y: -2,
                    boxShadow: "0 5px 0 #e6317a",
                  }}
                  whileTap={{
                    y: 0,
                    scale: 0.97,
                  }}
                >
                  Use this photo →
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          CARD PREVIEW MODAL
      ======================================================= */}

      <AnimatePresence>
        {showCardModal && previewDataUrl && (
          <motion.div
            key="card-overlay"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#031f13]/90 px-4 py-5 backdrop-blur-md"
            {...modalOverlay}
            onMouseDown={(event: React.MouseEvent) => {
              if (event.target === event.currentTarget) {
                setShowCardModal(false);
              }
            }}
          >
            <motion.div
              className="flex max-h-[95vh] w-full max-w-[460px] flex-col overflow-hidden rounded-[22px] border border-[#FEE101]/20 bg-[#0B6839] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
              {...modalContent}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#FEE101]/15 px-5 py-4">
                <div>
                  <motion.div
                    className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FEE101]/60"
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.2,
                    }}
                  >
                    Your ID card is ready
                  </motion.div>

                  <motion.div
                    className="mt-1 text-sm font-black uppercase tracking-[0.08em]"
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.3,
                    }}
                  >
                    Hacker House Goa 2026
                  </motion.div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FEE101]/20 text-lg transition hover:bg-[#FEE101] hover:text-[#0B6839]"
                  whileHover={{
                    rotate: 90,
                  }}
                  whileTap={{
                    scale: 0.85,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  ×
                </motion.button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-[#063e24] p-5 md:p-7">
                <motion.div
                  className="relative mx-auto overflow-hidden rounded-[6px] border-[4px] border-[#0b3d2e] bg-[#f6efe0] shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
                  style={{
                    width: "100%",
                    maxWidth: "360px",
                    aspectRatio: `${CARD_W} / ${CARD_H}`,
                  }}
                  initial={{
                    opacity: 0,
                    y: 20,
                    rotateX: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                  }}
                  transition={{
                    delay: 0.15,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <img
                    src={previewDataUrl}
                    alt={`${name} - ${role} ID Card`}
                    className="block h-full w-full object-contain"
                    draggable={false}
                  />
                </motion.div>
              </div>

              <motion.div
                className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#FEE101]/15 bg-[#075c32] p-4"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                }}
              >
                <motion.button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="rounded-full bg-[#FEE101] px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#0B6839] disabled:opacity-50"
                  whileHover={{
                    y: -2,
                    boxShadow: "0 5px 0 #e6317a",
                  }}
                  whileTap={{
                    y: 0,
                    scale: 0.97,
                  }}
                >
                  {isDownloading ? "Creating..." : "↓ Download ID Card"}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handlePostOnX}
                  className="rounded-full border-2 border-[#FEE101] px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#FEE101] transition hover:bg-[#FEE101] hover:text-[#0B6839]"
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  𝕏 Post on X
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
