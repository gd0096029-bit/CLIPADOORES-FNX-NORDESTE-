import type { ReactNode, SVGProps } from "react";
import type { Platform } from "@/lib/clipador/types";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconTrophy = (p: P) => (
  <Base {...p}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
  </Base>
);
export const IconScissors = (p: P) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
  </Base>
);
export const IconAt = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </Base>
);
export const IconShield = (p: P) => (
  <Base {...p}>
    <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);
export const IconPlus = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
export const IconEye = (p: P) => (
  <Base {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);
export const IconFilm = (p: P) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4" />
  </Base>
);
export const IconWallet = (p: P) => (
  <Base {...p}>
    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    <path d="M21 12h-5a2 2 0 0 0 0 4h5v-4Z" />
  </Base>
);
export const IconMedal = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="15" r="6" />
    <path d="m8.5 10-3-7h4l2.5 5M15.5 10l3-7h-4l-2.5 5" />
  </Base>
);
export const IconX = (p: P) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);
export const IconTrash = (p: P) => (
  <Base {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </Base>
);
export const IconExternal = (p: P) => (
  <Base {...p}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Base>
);
export const IconInfo = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Base>
);
export const IconSend = (p: P) => (
  <Base {...p}>
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    <path d="M22 2 11 13" />
  </Base>
);
export const IconSearch = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Base>
);
export const IconClock = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Base>
);
export const IconCheck = (p: P) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);
export const IconAlert = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </Base>
);
export const IconLogout = (p: P) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Base>
);
export const IconUser = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
);
export const IconBook = (p: P) => (
  <Base {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z" />
    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </Base>
);
export const IconBank = (p: P) => (
  <Base {...p}>
    <path d="M3 10h18L12 4 3 10ZM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
  </Base>
);
export const IconArrowUp = (p: P) => (
  <Base {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Base>
);
export const IconLink = (p: P) => (
  <Base {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </Base>
);

/* Ícones das redes (traço simples, sem logos oficiais) */
export const IconTikTok = (p: P) => (
  <Base {...p}>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c.4 2.6 2.2 4.3 5 4.5" />
  </Base>
);
export const IconInstagram = (p: P) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </Base>
);
export const IconYouTube = (p: P) => (
  <Base {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="4" />
    <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
  </Base>
);

export function PlatformIcon({ platform, ...p }: P & { platform: Platform }) {
  if (platform === "tiktok") return <IconTikTok {...p} />;
  if (platform === "instagram") return <IconInstagram {...p} />;
  return <IconYouTube {...p} />;
}

/** Marca: chama estilizada */
export function FenixMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect width="36" height="36" rx="10" fill="var(--accent)" />
      <path
        d="M18 7c1.2 3.6 5.8 6 5.8 11.2A5.8 5.8 0 0 1 18 24a5.8 5.8 0 0 1-5.8-5.8c0-2.3 1.2-3.8 2.4-4.9.1 1.8.9 3 2.1 3.5C16 13.6 17 10 18 7Z"
        fill="#fff"
      />
      <path d="M12 27.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
