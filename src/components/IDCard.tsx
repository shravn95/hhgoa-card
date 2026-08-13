interface IDCardProps {
  name: string;
  role: string;
  builderId: string;
  photoUrl: string;
  cardImageUrl?: string;
}

export function IDCard({
  name,
  role,
  builderId,
  photoUrl,
  cardImageUrl,
}: IDCardProps) {
  const altText = `${name} ${role} ${builderId}`;

  if (cardImageUrl) {
    return (
      <figure className="w-[340px] select-none">
        <div className="overflow-hidden rounded-[28px] border-[6px] border-[#0b3d2e] bg-[#f6efe0] shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
          <img
            src={cardImageUrl}
            alt={altText}
            className="block h-auto w-full"
            draggable={false}
            loading="eager"
            fetchPriority="high"
          />
        </div>

        <figcaption className="sr-only">
          {name} {role} {builderId}
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="relative w-[340px] overflow-hidden rounded-[2px] border-[6px] border-[#0b3d2e] bg-[#f6efe0] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.24)] select-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(254,225,1,0.18),transparent_22%),radial-gradient(circle_at_12%_12%,rgba(230,49,122,0.08),transparent_16%),radial-gradient(circle_at_88%_84%,rgba(11,61,46,0.08),transparent_18%)]" />

      <div className="relative flex items-start justify-between gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#0b3d2e]">
        <span>Goa</span>
        <span>India</span>
      </div>

      <div className="relative mt-2 text-center">
        <div
          className="text-[2.6rem] font-semibold leading-[0.9] tracking-[0.08em] text-[#0b3d2e]"
          style={{ fontFamily: "var(--heading)" }}
        >
          HACKER HOUSE
        </div>
      </div>

      <div className="relative mx-auto mt-4 overflow-hidden rounded-[30px] border-[5px] border-[#0b3d2e] bg-white p-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
        <div className="overflow-hidden rounded-[24px] border-2 border-[#f2c94c] bg-[#e9e0cc]">
          <img
            src={photoUrl}
            alt={name}
            className="h-[250px] w-full object-cover object-center"
            draggable={false}
          />
        </div>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[#cfae20] bg-[#f2c94c] px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#0b3d2e] shadow-[0_8px_18px_rgba(0,0,0,0.14)]">
          Let&apos;s Build in Goa
        </div>
      </div>

      <div className="relative mt-7 text-center">
        <div className="text-[2rem] font-black uppercase leading-none tracking-[0.18em] text-[#0b3d2e]">
          {name}
        </div>
        <div className="mt-2 text-[11px] font-black uppercase tracking-[0.5em] text-[#e6317a]">
          Developer Title
        </div>
      </div>

      <div className="relative mx-auto mt-4 max-w-[260px] rounded-[16px] border-[3px] border-[#0b3d2e] bg-[#0b3d2e] px-4 py-3 text-center shadow-[0_10px_0_#153f31]">
        <div className="text-[1.05rem] font-black uppercase tracking-[0.18em] text-[#b7d2aa]">
          {role}
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-[#0b3d2e]">
        <span>#FRAMEINGOA</span>
        <span>{builderId}</span>
      </div>
    </div>
  );
}
