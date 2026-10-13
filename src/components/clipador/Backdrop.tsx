/**
 * Fundo das áreas logadas: camadas de serra do sertão nos tons do "QG dos Clipadores",
 * desfocadas e fixas atrás do conteúdo. Sem sol, só o brilho de fim de tarde no horizonte.
 */
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="bd-ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0D0906" />
            <stop offset="0.3" stopColor="#1C0B05" />
            <stop offset="0.5" stopColor="#4A1A08" />
            <stop offset="0.62" stopColor="#7A2E0D" />
          </linearGradient>
          <radialGradient id="bd-brasa" cx="0.6" cy="0.58" r="0.6">
            <stop offset="0" stopColor="#D9631F" stopOpacity="0.35" />
            <stop offset="1" stopColor="#D9631F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bd-chao" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.5" stopColor="#0D0906" stopOpacity="0" />
            <stop offset="1" stopColor="#0D0906" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#bd-ceu)" />
        <rect width="1440" height="900" fill="url(#bd-brasa)" />
        {/* serra do fundo */}
        <path d="M0 410 L110 345 L210 385 L330 300 L450 370 L560 320 L690 390 L800 305 L910 360 L1020 270 L1120 345 L1240 295 L1340 360 L1440 315 L1440 900 L0 900 Z" fill="#6B2709" opacity="0.55" />
        {/* serra do meio */}
        <path d="M0 480 L140 410 L260 455 L380 385 L520 460 L650 405 L790 470 L930 390 L1060 455 L1190 400 L1320 460 L1440 415 L1440 900 L0 900 Z" fill="#3A160A" />
        {/* serra da frente */}
        <path d="M0 560 L180 500 L320 545 L470 490 L640 555 L800 505 L980 565 L1150 510 L1300 550 L1440 515 L1440 900 L0 900 Z" fill="#1C0B05" />
        {/* chão */}
        <path d="M0 630 L220 600 L430 635 L640 605 L870 640 L1100 610 L1300 635 L1440 615 L1440 900 L0 900 Z" fill="#100805" />
        <rect width="1440" height="900" fill="url(#bd-chao)" />
      </svg>
    </div>
  );
}
