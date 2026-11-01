export type LeadStatus =
  | 'Nuevo Prospecto'
  | 'Contactado'
  | 'En Evaluación'
  | 'Propuesta Enviada'
  | 'Cerrado / Franquiciado'
  | 'Descartado';

export interface FranchiseLead {
  id: string;
  createdAt: string;
  fullName: string;
  whatsapp: string;
  email: string;
  city: string;
  hasPetExperience: string;
  hasPremises: string;
  availableBudget: string;
  startTimeline: string;
  status: LeadStatus;
  notes?: string;
  syncedToSheets?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Spas & Estaciones' | 'Antes y Después' | 'Groomers en Acción' | 'Cosmética & Equipos' | 'Experiencias';
  subtitle: string;
  specLabel: string;
  visualType: 'hero_spa' | 'bath_station' | 'groomtek_table' | 'cosmetics_line' | 'before_after' | 'client_experience';
  customImageUrl?: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  centralConcept: string;
  complementarySlogan: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  geographicCoverage: string;
  instagramHandle: string;
  facebookHandle: string;
  linkedinHandle: string;
  commercialConditionsNote: string;
  googleAnalyticsId: string;
  googleSpreadsheetId: string;
}

export const INITIAL_SITE_CONFIG: SiteConfig = {
  heroTitle: 'ABRE TU PROPIO SPA GROOMING',
  heroSubtitle:
    'Únete a RED GROOM y desarrolla tu propio negocio de estética y bienestar para mascotas con el respaldo de una red profesional.',
  centralConcept: 'RED GROOM – Tu propio Spa Grooming, respaldado por una red profesional.',
  complementarySlogan: 'Transforma tu pasión por las mascotas en un negocio profesional.',
  whatsappNumber: '573001234567',
  contactEmail: 'redgroomcol@gmail.com',
  contactPhone: '+57 (601) 580 9400',
  geographicCoverage: 'Expansión Nacional · Principales ciudades y cabeceras departamentales',
  instagramHandle: '@redgroom.oficial',
  facebookHandle: '/RedGroomFranquicias',
  linkedinHandle: 'RED GROOM Microfranquicias',
  commercialConditionsNote:
    'Los componentes de equipamiento, comodato de dispensadores y abastecimiento están sujetos al formato de establecimiento seleccionado y a las condiciones contractuales vigentes de la red.',
  googleAnalyticsId: '',
  googleSpreadsheetId: '',
};

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Perfil del Franquiciado',
    question: '¿Necesito experiencia en peluquería canina?',
    answer:
      'No es indispensable contar con experiencia previa como groomer. El modelo RED GROOM está diseñado tanto para profesionales del sector que desean estandarizar y escalar su negocio como para emprendedores e inversionistas. Incluimos capacitación estructurada en protocolos de baño, manejo cosmético, atención al cliente y administración básica del establecimiento.',
  },
  {
    id: 'faq-2',
    category: 'Inversión y Condiciones',
    question: '¿Cuánto cuesta adquirir una microfranquicia?',
    answer:
      'La propuesta económica se define de acuerdo con el formato de establecimiento y las condiciones del local disponible. Una vez evaluamos tu perfil y ubicación en el paso inicial, nuestro equipo de expansión te presenta el desglose técnico y comercial adaptado a tu proyecto.',
  },
  {
    id: 'faq-3',
    category: 'Infraestructura',
    question: '¿Qué espacio necesito?',
    answer:
      'El formato de microfranquicia RED GROOM está concebido para optimizar cada metro cuadrado, permitiendo operar en locales comerciales compactos y de fácil adecuación que integren zona de recepción, estación de baño profesional, área de secado y estación de peluquería GROOM-TEK con flujo eficiente.',
  },
  {
    id: 'faq-4',
    category: 'Equipamiento',
    question: '¿Qué equipamiento incluye?',
    answer:
      'Según el formato acordado, tu microfranquicia integra estación de baño profesional, mesa profesional de grooming, herramientas de trabajo, equipos y accesorios bajo el sistema GROOM-TEK, además del dispensador mural en comodato para el sistema de Costo por Baño Garantizado.',
  },
  {
    id: 'faq-5',
    category: 'Formación',
    question: '¿Recibo capacitación?',
    answer:
      'Sí. Antes de la apertura recibes formación integral que abarca procesos de baño profesional, protocolos de atención y bienestar animal, dosificación y manejo de nuestra línea cosmética especializada, servicio al cliente y administración operativa del establecimiento.',
  },
  {
    id: 'faq-6',
    category: 'Cobertura',
    question: '¿Puedo abrir en cualquier ciudad?',
    answer:
      'RED GROOM cuenta con un plan de expansión nacional. Durante la etapa de evaluación analizamos el potencial comercial de tu ciudad y la zona específica para asegurar una ubicación adecuada y proteger el territorio operativo de cada franquiciado.',
  },
  {
    id: 'faq-7',
    category: 'Operación',
    question: '¿Cómo funciona el abastecimiento?',
    answer:
      'Contamos con un sistema centralizado de abastecimiento profesional. Recibes directamente nuestra línea de cosmética concentrada, champús, acondicionadores y tratamientos de mantenimiento del manto, garantizando calidad constante y control exacto de inventario.',
  },
  {
    id: 'faq-8',
    category: 'Implementación',
    question: '¿Cuánto tiempo tarda la apertura?',
    answer:
      'El cronograma de apertura depende del estado de adecuación del local comercial. Tras la formalización del acuerdo, activamos en paralelo el diseño de imagen corporativa, la entrega de equipamiento y la capacitación para lograr una apertura ágil y ordenada.',
  },
  {
    id: 'faq-9',
    category: 'Soporte',
    question: '¿Qué acompañamiento recibo?',
    answer:
      'Recibes asesoría desde la validación del local y apertura, entrega de manuales operativos estandarizados, lineamientos de estrategia comercial local y acompañamiento continuo en la implementación del ecosistema RED GROOM.',
  },
  {
    id: 'faq-10',
    category: 'Proceso Comercial',
    question: '¿Cómo solicito información comercial?',
    answer:
      'Completa el formulario de captación al final de esta página o escríbenos directamente a través de los botones de WhatsApp. Un asesor de expansión de RED GROOM se comunicará contigo para agendar la evaluación inicial.',
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Arquitectura Interior Spa RED GROOM',
    category: 'Spas & Estaciones',
    subtitle: 'Ambientes luminosos, higiénicos y diseñados para reducir el estrés de la mascota durante cada sesión.',
    specLabel: 'Estándar Arquitectónico · Iluminación Cálida 4000K',
    visualType: 'hero_spa',
    customImageUrl: '/assets/aistudio/image_dba75e9a.png',
  },
  {
    id: 'gal-2',
    title: 'Estación de Baño y Dosificación Mural',
    category: 'Cosmética & Equipos',
    subtitle: 'Tina en acero inoxidable con dispensador mural calibrado para control exacto de cosmética concentrada.',
    specLabel: 'Sistema Costo por Baño Garantizado · Comodato',
    visualType: 'bath_station',
    customImageUrl: '/assets/aistudio/image_23796831.png',
  },
  {
    id: 'gal-3',
    title: 'Línea Cosmética y Recuperación del Manto',
    category: 'Antes y Después',
    subtitle: 'Resultado de protocolo de baño profundo, mascarilla de hidratación botánica y cosmética concentrada.',
    specLabel: 'Protocolo Dermocosmético · 4 Fases',
    visualType: 'before_after',
    customImageUrl: '/assets/aistudio/image_12fe1088.png',
  },
  {
    id: 'gal-4',
    title: 'Estación de Trabajo GROOM-TEK',
    category: 'Groomers en Acción',
    subtitle: 'Mesa profesional de grooming con organización ergonómica de herramientas, secado y seguridad.',
    specLabel: 'Ecosistema GROOM-TEK · Ergonomía Operativa',
    visualType: 'groomtek_table',
  },
  {
    id: 'gal-5',
    title: 'Línea Cosmética Profesional Especializada',
    category: 'Cosmética & Equipos',
    subtitle: 'Champús concentrados, acondicionadores y tratamientos formulados según el tipo de pelaje.',
    specLabel: 'Abastecimiento Exclusivo · Alta Concentración',
    visualType: 'cosmetics_line',
    customImageUrl: '/assets/aistudio/image_12fe1088.png',
  },
  {
    id: 'gal-6',
    title: 'Recepción y Entrega de Experiencia Spa',
    category: 'Experiencias',
    subtitle: 'Zona de recepción corporativa donde el tutor percibe transparencia, orden y respaldo de marca.',
    specLabel: 'Identidad Corporativa · Experiencia del Tutor',
    visualType: 'client_experience',
  },
];

export interface EstablishmentZone {
  id: string;
  code: string;
  name: string;
  areaShare: string;
  purpose: string;
  features: string[];
  coordinates: { x: number; y: number };
}

export const ESTABLISHMENT_ZONES: EstablishmentZone[] = [
  {
    id: 'zone-recepcion',
    code: 'Z-01',
    name: 'Zona de Recepción e Imagen Corporativa',
    areaShare: 'Acceso Frontal · Visibilidad Comercial',
    purpose:
      'Primer punto de contacto con el tutor. Proyecta orden, limpieza y confianza mediante señalización corporativa RED GROOM y exhibición limpia.',
    features: [
      'Mostrador de atención y diagnóstico inicial del manto',
      'Señalización interior y fachada corporativa estandarizada',
      'Exhibidor de línea cosmética de mantenimiento',
      'Espera segura con separación física del área húmeda',
    ],
    coordinates: { x: 20, y: 74 },
  },
  {
    id: 'zone-bano',
    code: 'Z-02',
    name: 'Estación de Baño Profesional',
    areaShare: 'Zona Húmeda · Control Hidráulico',
    purpose:
      'Equipada para ejecutar protocolos de higiene profunda e hidratación con ergonomía para el operador y seguridad antideslizante para la mascota.',
    features: [
      'Bañera profesional de acceso ergonómico',
      'Dispensador mural de cosmética concentrada (Costo por Baño Garantizado)',
      'Ducha de presión controlada y temperatura regulada',
      'Superficies lavables de alta higiene',
    ],
    coordinates: { x: 24, y: 26 },
  },
  {
    id: 'zone-secado',
    code: 'Z-03',
    name: 'Área de Secado Técnico',
    areaShare: 'Transición Térmica · Flujo Lineal',
    purpose:
      'Contigua a la estación de baño para eliminar desplazamientos innecesarios, preparando el manto mediante expulsión de agua y estirado.',
    features: [
      'Equipos expulsadores y secadores de flujo regulado',
      'Control acústico y térmico para bienestar animal',
      'Superficie de apoyo con sujeción de seguridad',
      'Optimización de tiempos entre baño y corte',
    ],
    coordinates: { x: 52, y: 26 },
  },
  {
    id: 'zone-peluqueria',
    code: 'Z-04',
    name: 'Mesa de Peluquería y Estación GROOM-TEK',
    areaShare: 'Zona de Estilismo · Alta Precisión',
    purpose:
      'Núcleo técnico del Spa donde el groomer realiza cortes de raza, arreglo higiénico y acabados cosméticos con herramientas organizadas.',
    features: [
      'Mesa profesional de grooming con brazo de sujeción',
      'Módulo de herramientas y accesorios GROOM-TEK',
      'Iluminación cenital sin sombras para trabajo de detalle',
      'Visibilidad limpia que transmite confianza al cliente',
    ],
    coordinates: { x: 78, y: 42 },
  },
  {
    id: 'zone-cosmetica',
    code: 'Z-05',
    name: 'Módulo de Productos Cosméticos Profesionales',
    areaShare: 'Abastecimiento & Dosificación',
    purpose:
      'Almacenamiento técnico y dispensación de champús, acondicionadores y tratamientos especializados según tipo de pelaje.',
    features: [
      'Conexión directa al sistema de dosificación mural',
      'Organización por línea: limpieza, hidratación y recuperación',
      'Control visual de stock para reabastecimiento programado',
      'Estandarización de fórmulas aprobadas por la red',
    ],
    coordinates: { x: 52, y: 74 },
  },
];

export const INITIAL_SAMPLE_LEADS: FranchiseLead[] = [
  {
    id: 'lead-demo-1',
    createdAt: '2026-10-29 14:20',
    fullName: 'Carlos Andrés Mejía',
    whatsapp: '+57 310 482 9102',
    email: 'c.mejia@inversioneslocales.co',
    city: 'Medellín',
    hasPetExperience: 'No, perfil inversionista / administrativo',
    hasPremises: 'En búsqueda activa de local',
    availableBudget: 'Presupuesto completo disponible',
    startTimeline: 'De 1 a 3 meses',
    status: 'Propuesta Enviada',
    notes: 'Interesado en zona Laureles / El Poblado.',
    syncedToSheets: false,
  },
  {
    id: 'lead-demo-2',
    createdAt: '2026-10-31 09:45',
    fullName: 'Laura Valentina Ríos',
    whatsapp: '+57 315 892 3341',
    email: 'laura.rios.vet@gmail.com',
    city: 'Bogotá',
    hasPetExperience: 'Sí, experiencia en sector mascotas / grooming',
    hasPremises: 'Sí, dispongo de local propio o en arriendo',
    availableBudget: 'Presupuesto completo disponible',
    startTimeline: 'Inmediato (menos de 1 mes)',
    status: 'En Evaluación',
    notes: 'Cuenta con local de 38 m² en Cedritos.',
    syncedToSheets: false,
  },
];
