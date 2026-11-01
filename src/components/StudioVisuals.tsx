import React, { useState } from 'react';

interface StudioSceneProps {
  variant:
    | 'hero_spa'
    | 'bath_station'
    | 'groomtek_table'
    | 'cosmetics_line'
    | 'before_after'
    | 'client_experience'
    | 'service_bath'
    | 'service_grooming'
    | 'service_cosmetics'
    | 'service_hydration'
    | 'service_coat'
    | 'service_wellness';
  customImageUrl?: string;
  alt: string;
  className?: string;
}

export const StudioVisual: React.FC<StudioSceneProps> = ({
  variant,
  customImageUrl,
  alt,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const defaultVariantImages: Partial<Record<StudioSceneProps['variant'], string>> = {
    hero_spa: '/assets/aistudio/image_dba75e9a.png',
    bath_station: '/assets/aistudio/image_23796831.png',
    service_bath: '/assets/aistudio/image_23796831.png',
    before_after: '/assets/aistudio/image_12fe1088.png',
    cosmetics_line: '/assets/aistudio/image_12fe1088.png',
    service_cosmetics: '/assets/aistudio/image_12fe1088.png',
    service_hydration: '/assets/aistudio/image_12fe1088.png',
    service_coat: '/assets/aistudio/image_12fe1088.png',
  };

  const resolvedImageUrl = customImageUrl || defaultVariantImages[variant];
  const isProductCutout =
    resolvedImageUrl === '/assets/aistudio/image_23796831.png' ||
    variant === 'bath_station' ||
    variant === 'service_bath';

  if (resolvedImageUrl && !imgError) {
    return (
      <div
        className={`relative overflow-hidden ${
          isProductCutout ? 'bg-white p-2' : 'bg-[#0B2545]'
        } ${className}`}
      >
        <img
          src={resolvedImageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full ${isProductCutout ? 'object-contain' : 'object-cover'}`}
        />
        {!isProductCutout && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
        )}
      </div>
    );
  }

  switch (variant) {
    case 'hero_spa':
      return (
        <div className={`relative overflow-hidden bg-[#071930] ${className}`} role="img" aria-label={alt}>
          <svg
            viewBox="0 0 800 540"
            className="w-full h-full object-cover"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="heroBg" x1="0" y1="0" x2="800" y2="540" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0B2545" />
                <stop offset="55%" stopColor="#133B6E" />
                <stop offset="100%" stopColor="#061527" />
              </linearGradient>
              <linearGradient id="skyGlow" x1="400" y1="40" x2="400" y2="460" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="stainless" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2ECF5" />
                <stop offset="50%" stopColor="#B8C9DA" />
                <stop offset="100%" stopColor="#8CA1B8" />
              </linearGradient>
            </defs>

            {/* Architectural Salon Background */}
            <rect width="800" height="540" fill="url(#heroBg)" />
            <circle cx="520" cy="180" r="260" fill="url(#skyGlow)" />

            {/* Subtle Architectural Vertical Slats */}
            <g opacity="0.16" stroke="#7DD3FC" strokeWidth="1.5">
              <line x1="70" y1="0" x2="70" y2="410" />
              <line x1="100" y1="0" x2="100" y2="410" />
              <line x1="130" y1="0" x2="130" y2="410" />
              <line x1="160" y1="0" x2="160" y2="410" />
              <line x1="190" y1="0" x2="190" y2="410" />
              <line x1="650" y1="0" x2="650" y2="410" />
              <line x1="680" y1="0" x2="680" y2="410" />
              <line x1="710" y1="0" x2="710" y2="410" />
            </g>

            {/* Salon Floor Perspective */}
            <path d="M0 410 L800 410 L800 540 L0 540 Z" fill="#051324" />
            <line x1="0" y1="410" x2="800" y2="410" stroke="#7DD3FC" strokeOpacity="0.3" strokeWidth="1.5" />

            {/* Illuminated Branded Wall Arch */}
            <rect
              x="230"
              y="48"
              width="340"
              height="362"
              rx="170"
              fill="#113563"
              stroke="#7DD3FC"
              strokeOpacity="0.45"
              strokeWidth="2"
            />
            <text
              x="400"
              y="112"
              textAnchor="middle"
              fill="#7DD3FC"
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontWeight="700"
              fontSize="16"
              letterSpacing="4"
            >
              RED GROOM SPA
            </text>
            <text
              x="400"
              y="132"
              textAnchor="middle"
              fill="#D4E6F7"
              fontFamily="DM Sans, sans-serif"
              fontSize="11"
              letterSpacing="1.5"
              opacity="0.85"
            >
              ESTACIÓN PROFESIONAL GROOM-TEK
            </text>

            {/* Wall-Mounted Dosing Unit (Left Station) */}
            <rect
              x="86"
              y="145"
              width="96"
              height="145"
              rx="10"
              fill="#0E2C52"
              stroke="#7DD3FC"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <rect x="102" y="162" width="64" height="22" rx="4" fill="#06172B" />
            <text x="134" y="177" textAnchor="middle" fill="#7DD3FC" fontFamily="JetBrains Mono, monospace" fontSize="10">
              15.0 mL/BAÑO
            </text>
            <rect x="102" y="198" width="16" height="62" rx="4" fill="#7DD3FC" fillOpacity="0.9" />
            <rect x="126" y="198" width="16" height="62" rx="4" fill="#3B82F6" fillOpacity="0.9" />
            <rect x="150" y="198" width="16" height="62" rx="4" fill="#0284C7" fillOpacity="0.9" />
            <text x="134" y="278" textAnchor="middle" fill="#B8D4EE" fontFamily="DM Sans, sans-serif" fontSize="8">
              DOSIFICADOR MURAL
            </text>

            {/* Professional Groomer Silhouette (Behind Hydraulic Table) */}
            <circle cx="355" cy="195" r="28" fill="#D8E5F2" />
            <path
              d="M305 315 C305 252 325 234 355 234 C385 234 405 252 405 315 Z"
              fill="#0B2545"
              stroke="#7DD3FC"
              strokeWidth="1.5"
            />
            {/* Groomer Apron Emblem */}
            <rect x="335" y="256" width="40" height="48" rx="4" fill="#17447E" stroke="#7DD3FC" strokeOpacity="0.6" />
            <text x="355" y="278" textAnchor="middle" fill="#FFFFFF" fontWeight="700" fontSize="8">
              RG
            </text>

            {/* Stylized Dog on Grooming Table (Poodle / Bichon Spa Silhouette) */}
            <g transform="translate(415, 208)">
              {/* Fluffy Body & Head */}
              <circle cx="48" cy="64" r="32" fill="#F6F9FC" />
              <circle cx="84" cy="68" r="28" fill="#F6F9FC" />
              <circle cx="32" cy="30" r="26" fill="#FFFFFF" />
              <circle cx="14" cy="36" r="14" fill="#E6EFF8" />
              <circle cx="48" cy="18" r="14" fill="#FFFFFF" />
              {/* Cute Eyes & Nose */}
              <circle cx="25" cy="28" r="3" fill="#0F1E2E" />
              <circle cx="38" cy="28" r="3" fill="#0F1E2E" />
              <ellipse cx="31" cy="35" rx="4" ry="3" fill="#0F1E2E" />
              {/* Spa Sky Blue Bandana */}
              <path d="M18 48 L46 48 L32 64 Z" fill="#38BDF8" />
              {/* Legs */}
              <rect x="28" y="82" width="12" height="32" rx="6" fill="#EDF3F8" />
              <rect x="52" y="84" width="12" height="30" rx="6" fill="#DCE8F3" />
              <rect x="78" y="82" width="12" height="32" rx="6" fill="#EDF3F8" />
              <rect x="96" y="84" width="12" height="30" rx="6" fill="#DCE8F3" />
              {/* Tail */}
              <circle cx="114" cy="48" r="14" fill="#FFFFFF" />
              {/* Soft Spa Foam Bubbles */}
              <circle cx="66" cy="36" r="7" fill="#7DD3FC" fillOpacity="0.65" />
              <circle cx="78" cy="26" r="5" fill="#38BDF8" fillOpacity="0.85" />
              <circle cx="58" cy="22" r="4" fill="#FFFFFF" fillOpacity="0.9" />
            </g>

            {/* GROOM-TEK Hydraulic Table & Overhead Arm */}
            <path
              d="M275 322 L545 322 L545 140 L435 140"
              stroke="#7DD3FC"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Grooming Safety Loop */}
            <line x1="448" y1="140" x2="448" y2="236" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="4 3" />
            {/* Table Surface */}
            <rect x="260" y="318" width="300" height="18" rx="6" fill="url(#stainless)" />
            {/* Hydraulic Scissor Base */}
            <path d="M330 336 L470 435 M470 336 L330 435" stroke="#B8C9DA" strokeWidth="8" strokeLinecap="round" />
            <rect x="300" y="432" width="200" height="14" rx="5" fill="url(#stainless)" />

            {/* Right Side GROOM-TEK Tool & Cosmetics Caddy */}
            <rect
              x="610"
              y="220"
              width="112"
              height="210"
              rx="10"
              fill="#0E2C52"
              stroke="#7DD3FC"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
            <rect x="626" y="242" width="80" height="8" rx="4" fill="#7DD3FC" fillOpacity="0.5" />
            {/* Cosmetic Bottles on Shelf */}
            <rect x="630" y="268" width="18" height="42" rx="4" fill="#7DD3FC" />
            <rect x="656" y="262" width="18" height="48" rx="4" fill="#F6F9FC" />
            <rect x="682" y="272" width="18" height="38" rx="4" fill="#2563EB" />
            <line x1="622" y1="312" x2="710" y2="312" stroke="#7DD3FC" strokeOpacity="0.4" strokeWidth="2" />
            <rect x="628" y="330" width="76" height="34" rx="5" fill="#06172B" />
            <text x="666" y="351" textAnchor="middle" fill="#7DD3FC" fontFamily="JetBrains Mono, monospace" fontSize="9">
              GROOM-TEK
            </text>
          </svg>
        </div>
      );

    case 'bath_station':
    case 'service_bath':
      return (
        <div className={`relative overflow-hidden bg-[#0A2240] ${className}`} role="img" aria-label={alt}>
          <svg viewBox="0 0 600 450" className="w-full h-full object-cover" fill="none">
            <rect width="600" height="450" fill="#091E3A" />
            {/* Ceramic Tile Grid */}
            <g stroke="#7DD3FC" strokeOpacity="0.12" strokeWidth="1">
              <line x1="0" y1="90" x2="600" y2="90" />
              <line x1="0" y1="180" x2="600" y2="180" />
              <line x1="0" y1="270" x2="600" y2="270" />
              <line x1="120" y1="0" x2="120" y2="360" />
              <line x1="240" y1="0" x2="240" y2="360" />
              <line x1="360" y1="0" x2="360" y2="360" />
              <line x1="480" y1="0" x2="480" y2="360" />
            </g>
            {/* Wall Mounted Dosing System */}
            <rect x="70" y="55" width="145" height="175" rx="12" fill="#123868" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="88" y="75" width="109" height="28" rx="4" fill="#051324" />
            <text x="142" y="93" textAnchor="middle" fill="#7DD3FC" fontFamily="JetBrains Mono, monospace" fontSize="11">
              DOSIFICACIÓN EXACTA
            </text>
            <rect x="92" y="118" width="26" height="82" rx="5" fill="#7DD3FC" />
            <rect x="129" y="118" width="26" height="82" rx="5" fill="#38BDF8" />
            <rect x="166" y="118" width="26" height="82" rx="5" fill="#2563EB" />
            {/* Dosing Hose to Sprayer */}
            <path d="M215 150 C285 150 285 95 360 95 L360 155" stroke="#7DD3FC" strokeWidth="4" fill="none" />
            <circle cx="360" cy="165" r="14" fill="#2563EB" />
            {/* Water Spray Rays */}
            <path d="M352 182 L330 245 M360 182 L360 250 M368 182 L390 245" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="4 4" />
            {/* Stainless Steel Bathing Tub */}
            <rect x="130" y="250" width="370" height="135" rx="16" fill="#D5E3F0" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="150" y="270" width="330" height="45" rx="8" fill="#B5C9DE" />
            <text x="315" y="348" textAnchor="middle" fill="#0B2545" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="15">
              ESTACIÓN DE BAÑO RED GROOM
            </text>
            <text x="315" y="368" textAnchor="middle" fill="#0F1E2E" fontFamily="JetBrains Mono, monospace" fontSize="11">
              CONTROL DE CONSUMO POR SERVICIO
            </text>
          </svg>
        </div>
      );

    case 'groomtek_table':
    case 'service_grooming':
      return (
        <div className={`relative overflow-hidden bg-[#0B223E] ${className}`} role="img" aria-label={alt}>
          <svg viewBox="0 0 600 450" className="w-full h-full object-cover" fill="none">
            <rect width="600" height="450" fill="#0A1E38" />
            <circle cx="300" cy="200" r="190" fill="#7DD3FC" fillOpacity="0.1" />
            {/* Overhead Lighting Bar */}
            <rect x="150" y="38" width="300" height="12" rx="6" fill="#7DD3FC" />
            <path d="M180 50 L130 260 L470 260 L420 50 Z" fill="#7DD3FC" fillOpacity="0.07" />
            {/* GROOM-TEK Table & Arm */}
            <path d="M170 270 L430 270 L430 95 L310 95" stroke="#7DD3FC" strokeWidth="5" strokeLinecap="round" />
            <rect x="155" y="266" width="290" height="18" rx="6" fill="#DCE8F5" />
            <path d="M220 284 L380 390 M380 284 L220 390" stroke="#9AB2C9" strokeWidth="8" strokeLinecap="round" />
            <rect x="190" y="388" width="220" height="14" rx="5" fill="#DCE8F5" />
            {/* Tool Organizer Panel */}
            <rect x="52" y="110" width="84" height="180" rx="8" fill="#133866" stroke="#7DD3FC" strokeOpacity="0.5" strokeWidth="1.5" />
            <rect x="66" y="130" width="56" height="10" rx="3" fill="#7DD3FC" />
            <rect x="66" y="152" width="56" height="32" rx="4" fill="#071629" />
            <rect x="66" y="196" width="56" height="32" rx="4" fill="#071629" />
            <rect x="66" y="240" width="56" height="32" rx="4" fill="#2563EB" fillOpacity="0.9" />
            <text x="300" y="242" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="16" letterSpacing="2">
              SISTEMA GROOM-TEK
            </text>
          </svg>
        </div>
      );

    case 'cosmetics_line':
    case 'service_cosmetics':
    case 'service_hydration':
      return (
        <div className={`relative overflow-hidden bg-[#0C2647] ${className}`} role="img" aria-label={alt}>
          <svg viewBox="0 0 600 450" className="w-full h-full object-cover" fill="none">
            <rect width="600" height="450" fill="#0A213E" />
            {/* Travertine Stone Podium */}
            <rect x="70" y="320" width="460" height="65" rx="8" fill="#E3EBF3" />
            <rect x="100" y="300" width="400" height="24" rx="4" fill="#F2F6FA" />
            {/* Bottle 1 - Concentrated Shampoo */}
            <rect x="135" y="135" width="82" height="165" rx="14" fill="#071930" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="162" y="105" width="28" height="30" rx="4" fill="#7DD3FC" />
            <rect x="147" y="175" width="58" height="86" rx="4" fill="#F6F9FC" />
            <text x="176" y="205" textAnchor="middle" fill="#0B2545" fontWeight="700" fontSize="9">
              RED GROOM
            </text>
            <text x="176" y="222" textAnchor="middle" fill="#0F1E2E" fontSize="8">
              CHAMPÚ PRO
            </text>
            <text x="176" y="244" textAnchor="middle" fill="#2563EB" fontFamily="JetBrains Mono, monospace" fontSize="8">
              CONCENTRADO
            </text>

            {/* Bottle 2 - Coat Hydration Mask (Center Feature) */}
            <rect x="250" y="110" width="100" height="190" rx="18" fill="#154078" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="284" y="76" width="32" height="34" rx="5" fill="#2563EB" />
            <rect x="264" y="155" width="72" height="105" rx="6" fill="#FFFFFF" />
            <text x="300" y="188" textAnchor="middle" fill="#0B2545" fontWeight="700" fontSize="11">
              RED GROOM
            </text>
            <text x="300" y="208" textAnchor="middle" fill="#0F1E2E" fontSize="9">
              HIDRATACIÓN
            </text>
            <text x="300" y="224" textAnchor="middle" fill="#0F1E2E" fontSize="9">
              DEL MANTO
            </text>
            <text x="300" y="246" textAnchor="middle" fill="#1D4ED8" fontFamily="JetBrains Mono, monospace" fontSize="8">
              FÓRMULA SPA
            </text>

            {/* Bottle 3 - Conditioner */}
            <rect x="383" y="145" width="82" height="155" rx="14" fill="#071930" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="410" y="115" width="28" height="30" rx="4" fill="#7DD3FC" />
            <rect x="395" y="182" width="58" height="80" rx="4" fill="#7DD3FC" />
            <text x="424" y="212" textAnchor="middle" fill="#0B2545" fontWeight="700" fontSize="9">
              RED GROOM
            </text>
            <text x="424" y="229" textAnchor="middle" fill="#0B2545" fontSize="8">
              ACONDICIONADOR
            </text>
          </svg>
        </div>
      );

    case 'before_after':
    case 'service_coat':
      return (
        <div className={`relative overflow-hidden bg-[#0A2240] ${className}`} role="img" aria-label={alt}>
          <svg viewBox="0 0 600 450" className="w-full h-full object-cover" fill="none">
            <rect width="300" height="450" fill="#122338" />
            <rect x="300" width="300" height="450" fill="#0B2545" />
            <line x1="300" y1="0" x2="300" y2="450" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="6 6" />
            {/* Left: Coat Diagnosis */}
            <text x="150" y="75" textAnchor="middle" fill="#9CB3C9" fontFamily="JetBrains Mono, monospace" fontSize="12">
              01 · DIAGNÓSTICO PREVIO
            </text>
            <circle cx="150" cy="215" r="78" fill="#1D3452" stroke="#627D98" strokeWidth="2" />
            <circle cx="150" cy="205" r="46" fill="#C2D0DE" />
            <text x="150" y="345" textAnchor="middle" fill="#D5E3F0" fontSize="13">
              Manto deshidratado y sin estructura
            </text>
            {/* Right: Spa Result */}
            <text x="450" y="75" textAnchor="middle" fill="#7DD3FC" fontFamily="JetBrains Mono, monospace" fontSize="12">
              02 · RESULTADO SPA RED GROOM
            </text>
            <circle cx="450" cy="215" r="84" fill="#154078" stroke="#7DD3FC" strokeWidth="2.5" />
            <circle cx="450" cy="205" r="52" fill="#FFFFFF" />
            <path d="M432 238 L468 238 L450 256 Z" fill="#38BDF8" />
            <text x="450" y="345" textAnchor="middle" fill="#FFFFFF" fontWeight="600" fontSize="13">
              Nutrición, volumen y corte estandarizado
            </text>
          </svg>
        </div>
      );

    case 'client_experience':
    case 'service_wellness':
    default:
      return (
        <div className={`relative overflow-hidden bg-[#0B2545] ${className}`} role="img" aria-label={alt}>
          <svg viewBox="0 0 600 450" className="w-full h-full object-cover" fill="none">
            <rect width="600" height="450" fill="#081D36" />
            <rect x="65" y="55" width="470" height="340" rx="18" fill="#113461" stroke="#7DD3FC" strokeOpacity="0.4" strokeWidth="2" />
            <rect x="110" y="95" width="380" height="58" rx="10" fill="#061527" />
            <text x="300" y="130" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fontSize="20" letterSpacing="4">
              RED GROOM
            </text>
            <rect x="110" y="185" width="175" height="165" rx="10" fill="#16437D" />
            <text x="197" y="255" textAnchor="middle" fill="#7DD3FC" fontWeight="700" fontSize="14">
              RECEPCIÓN
            </text>
            <text x="197" y="278" textAnchor="middle" fill="#E2EEF8" fontSize="11">
              Diagnóstico y Bienvenida
            </text>
            <rect x="315" y="185" width="175" height="165" rx="10" fill="#F6F9FC" />
            <text x="402" y="255" textAnchor="middle" fill="#0B2545" fontWeight="700" fontSize="14">
              EXPERIENCIA SPA
            </text>
            <text x="402" y="278" textAnchor="middle" fill="#0F1E2E" fontSize="11">
              Bienestar & Transparencia
            </text>
          </svg>
        </div>
      );
  }
};
