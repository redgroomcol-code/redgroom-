import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Settings,
  X,
  Award,
  Wrench,
  BookOpen,
  Compass,
  Droplets,
} from 'lucide-react';
import {
  FranchiseLead,
  FAQItem,
  GalleryItem,
  SiteConfig,
  INITIAL_SITE_CONFIG,
  INITIAL_FAQS,
  INITIAL_GALLERY,
  INITIAL_SAMPLE_LEADS,
} from './data/redGroomData';
import { StudioVisual } from './components/StudioVisuals';
import { AdminPanel } from './components/AdminPanel';
import {
  initGoogleAnalytics,
  trackCommercialEvent,
  AnalyticsEventRecord,
} from './services/analytics';
import { getAccessToken, appendLeadToGoogleSheet } from './services/googleSheets';

const STORAGE_KEYS = {
  LEADS: 'redgroom_leads_v1',
  FAQS: 'redgroom_faqs_v1',
  CONFIG: 'redgroom_config_v1',
  GALLERY: 'redgroom_gallery_v1',
};

export type SimpleTabId = 'todo' | 'inicio' | 'modelo' | 'proceso' | 'faq' | 'contacto';

const TABS: { id: SimpleTabId; label: string }[] = [
  { id: 'todo', label: 'Inicio' },
  { id: 'modelo', label: 'Qué Incluye' },
  { id: 'proceso', label: 'Cómo Funciona' },
  { id: 'faq', label: 'Preguntas' },
  { id: 'contacto', label: 'Solicitar Información' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<SimpleTabId>('todo');

  // Persistent state
  const [leads, setLeads] = useState<FranchiseLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_LEADS;
    } catch {
      return INITIAL_SAMPLE_LEADS;
    }
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAQS);
      return saved ? JSON.parse(saved) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? { ...INITIAL_SITE_CONFIG, ...JSON.parse(saved) } : INITIAL_SITE_CONFIG;
    } catch {
      return INITIAL_SITE_CONFIG;
    }
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return saved ? JSON.parse(saved) : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });

  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEventRecord[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(INITIAL_FAQS[0].id);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<{
    title: string;
    detail: string;
  } | null>(null);

  // Lead Form State
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [hasPetExperience, setHasPetExperience] = useState(
    'Sí, experiencia en sector mascotas / grooming'
  );
  const [hasPremises, setHasPremises] = useState('En búsqueda activa de local');
  const [availableBudget, setAvailableBudget] = useState('Presupuesto completo disponible');
  const [startTimeline, setStartTimeline] = useState('De 1 a 3 meses');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<FranchiseLead | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch {}
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
    } catch {}
  }, [faqs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(siteConfig));
    } catch {}
    if (siteConfig.googleAnalyticsId) {
      initGoogleAnalytics(siteConfig.googleAnalyticsId);
    }
  }, [siteConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    } catch {}
  }, [gallery]);

  const logEvent = (eventName: string, params: Record<string, string | number> = {}) => {
    trackCommercialEvent(eventName, params, (record) => {
      setAnalyticsEvents((prev) => [record, ...prev.slice(0, 49)]);
    });
  };

  const selectTab = (tab: SimpleTabId, scrollId?: string) => {
    setActiveTab(tab);
    logEvent('tab_select', { tab });
    setTimeout(() => {
      if (scrollId) {
        const el = document.getElementById(scrollId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 20);
  };

  const cleanWaNumber = siteConfig.whatsappNumber.replace(/\D/g, '') || '573001234567';

  const getWhatsAppUrl = (customMessage?: string) => {
    const text = encodeURIComponent(
      customMessage ||
        'Hola RED GROOM, quiero recibir información sobre la microfranquicia de Spa Grooming.'
    );
    return `https://wa.me/${cleanWaNumber}?text=${text}`;
  };

  const handleResetDefaults = () => {
    setSiteConfig(INITIAL_SITE_CONFIG);
    setFaqs(INITIAL_FAQS);
    setGallery(INITIAL_GALLERY);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !whatsapp.trim() || !email.trim() || !city.trim()) {
      setFormError('Por favor completa tu nombre, WhatsApp, correo y ciudad.');
      return;
    }

    const nowFormatted = new Date().toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newLead: FranchiseLead = {
      id: `RG-${Date.now().toString().slice(-6)}`,
      createdAt: nowFormatted,
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      city: city.trim(),
      hasPetExperience,
      hasPremises,
      availableBudget,
      startTimeline,
      status: 'Nuevo Prospecto',
      syncedToSheets: false,
    };

    try {
      const token = await getAccessToken();
      if (token && siteConfig.googleSpreadsheetId.trim()) {
        const ok = await appendLeadToGoogleSheet(
          siteConfig.googleSpreadsheetId.trim(),
          newLead,
          token
        );
        if (ok) newLead.syncedToSheets = true;
      }
    } catch {}

    setLeads((prev) => [newLead, ...prev]);
    setSubmittedLead(newLead);
    logEvent('generate_lead', { city: newLead.city });

    setNotificationToast({
      title: 'Solicitud registrada con éxito',
      detail: `${newLead.fullName} · ${newLead.city}`,
    });
    setTimeout(() => setNotificationToast(null), 6000);
  };

  const showHeroAndAbout = activeTab === 'todo' || activeTab === 'inicio';
  const showModelAndIncludes = activeTab === 'todo' || activeTab === 'modelo';
  const showProcessAndGallery = activeTab === 'todo' || activeTab === 'proceso';
  const showFaq = activeTab === 'todo' || activeTab === 'faq';
  const showContact = activeTab === 'todo' || activeTab === 'contacto';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F9FC] text-[#0F1E2E]">
      {/* Simple Notification Toast */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-40 max-w-xs bg-[#0B2545] text-white p-4 rounded-xl shadow-lg flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#7DD3FC]">{notificationToast.title}</div>
            <div className="text-xs text-white mt-0.5">{notificationToast.detail}</div>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="text-white/70 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SINGLE CLEAN HEADER WITH INTEGRATED HORIZONTAL TABS */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D6E2EE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => selectTab('todo')}
            className="text-xl font-bold tracking-tight text-[#0B2545] whitespace-nowrap shrink-0 cursor-pointer"
          >
            RED GROOM
          </button>

          {/* Zone 2: Horizontal Navigation Tabs */}
          <nav
            role="tablist"
            aria-label="Secciones principales"
            className="flex items-center gap-1 overflow-x-auto py-1"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0B2545] text-white'
                      : 'text-[#4A607A] hover:text-[#0B2545] hover:bg-[#EDF3F8]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA */}
          <div className="hidden sm:flex items-center shrink-0">
            <button
              type="button"
              onClick={() => selectTab('contacto', 'formulario')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Quiero ser Franquiciado
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. PORTADA Y QUÉ ES RED GROOM */}
        {showHeroAndAbout && (
          <>
            <section className="bg-[#0B2545] text-white py-14 sm:py-20 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="text-xs font-semibold text-[#7DD3FC]">
                    Microfranquicias de Spa Grooming Profesional
                  </div>

                  <h1
                    className="font-display font-bold text-white tracking-tight balance-text leading-tight"
                    style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
                  >
                    {siteConfig.heroTitle}
                  </h1>

                  <p className="text-base text-[#D4E6F7] leading-relaxed">
                    {siteConfig.heroSubtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => selectTab('contacto', 'formulario')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      QUIERO SER FRANQUICIADO
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectTab('modelo')}
                      className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      CONOCE EL MODELO DE NEGOCIO
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl overflow-hidden border border-white/15 shadow-xl aspect-16/10 bg-[#061527]">
                    <img
                      src={gallery[0]?.customImageUrl || '/assets/aistudio/image_dba75e9a.png'}
                      alt="Spa Grooming Profesional RED GROOM"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ¿QUÉ ES RED GROOM? (3 PILARES SIMPLES) */}
            <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#D6E2EE]">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="max-w-2xl space-y-2">
                  <div className="text-xs font-semibold text-[#1D4ED8]">¿Qué es RED GROOM?</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E2E] balance-text">
                    Una nueva forma de emprender en el mundo de las mascotas
                  </h2>
                  <p className="text-sm sm:text-base text-[#4A607A]">
                    Opera tu propio Spa Grooming bajo una marca profesional, procesos estandarizados
                    y abastecimiento directo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-[#F6F9FC] border border-[#D6E2EE] space-y-2">
                    <div className="font-mono text-xs font-bold text-[#1D4ED8]">01</div>
                    <h3 className="text-lg font-bold text-[#0F1E2E]">
                      Modelo de negocio estandarizado
                    </h3>
                    <p className="text-sm text-[#4A607A] leading-relaxed">
                      Protocolos claros de recepción, baño, hidratación y peluquería para ofrecer
                      calidad constante.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-[#F6F9FC] border border-[#D6E2EE] space-y-2">
                    <div className="font-mono text-xs font-bold text-[#1D4ED8]">02</div>
                    <h3 className="text-lg font-bold text-[#0F1E2E]">
                      Productos y equipamiento profesional
                    </h3>
                    <p className="text-sm text-[#4A607A] leading-relaxed">
                      Estaciones de trabajo GROOM-TEK, dosificación controlada y línea cosmética
                      especializada.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-[#F6F9FC] border border-[#D6E2EE] space-y-2">
                    <div className="font-mono text-xs font-bold text-[#1D4ED8]">03</div>
                    <h3 className="text-lg font-bold text-[#0F1E2E]">
                      Capacitación y acompañamiento
                    </h3>
                    <p className="text-sm text-[#4A607A] leading-relaxed">
                      Formación técnica y administrativa antes de abrir, manuales operativos y
                      asesoría comercial.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 2. QUÉ INCLUYE Y DIFERENCIACIÓN TECNOLÓGICA */}
        {showModelAndIncludes && (
          <>
            <section className="py-16 px-4 sm:px-6 bg-[#F6F9FC] border-b border-[#D6E2EE]">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="max-w-2xl space-y-2">
                  <div className="text-xs font-semibold text-[#1D4ED8]">Tu Microfranquicia</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E2E]">
                    ¿Qué incluye tu microfranquicia RED GROOM?
                  </h2>
                  <p className="text-sm sm:text-base text-[#4A607A]">
                    Todo el sistema necesario para adecuar y operar tu establecimiento con
                    estándares profesionales.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      icon: Award,
                      title: 'Identidad Corporativa',
                      items: [
                        'Uso de marca RED GROOM según contrato',
                        'Diseño de fachada y señalización',
                        'Imagen comercial y material publicitario',
                      ],
                    },
                    {
                      icon: Wrench,
                      title: 'Equipamiento Profesional',
                      items: [
                        'Estación de baño profesional',
                        'Mesa profesional de grooming',
                        'Herramientas y equipos según formato',
                      ],
                    },
                    {
                      icon: Droplets,
                      title: 'Productos Cosméticos',
                      items: [
                        'Línea de cosmética especializada',
                        'Champús y acondicionadores concentrados',
                        'Tratamientos de hidratación del manto',
                      ],
                    },
                    {
                      icon: BookOpen,
                      title: 'Capacitación Integral',
                      items: [
                        'Procesos de baño y manejo de productos',
                        'Protocolos de atención y servicio al cliente',
                        'Administración básica del establecimiento',
                      ],
                    },
                    {
                      icon: Compass,
                      title: 'Acompañamiento',
                      items: [
                        'Asesoría de adecuación y apertura',
                        'Manuales operativos estandarizados',
                        'Estrategia comercial de lanzamiento',
                      ],
                    },
                  ].map((box, i) => {
                    const IconComponent = box.icon;
                    return (
                      <div
                        key={i}
                        className="p-6 bg-white rounded-xl border border-[#D6E2EE] space-y-4"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#0B2545] text-[#7DD3FC] flex items-center justify-center">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-[#0F1E2E]">{box.title}</h3>
                        <ul className="space-y-2 text-sm text-[#4A607A]">
                          {box.items.map((it, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}

                  {/* Resumen del Local Ideal */}
                  <div className="p-6 bg-[#0B2545] text-white rounded-xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#7DD3FC]">
                        Distribución del Local
                      </div>
                      <h3 className="text-base font-bold">Espacio optimizado y funcional</h3>
                      <p className="text-xs text-[#D4E6F7] leading-relaxed">
                        Tu local integra Zona de Recepción, Estación de Baño, Área de Secado, Mesa
                        de Peluquería y Módulo Cosmético en un flujo limpio.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTab('contacto', 'formulario')}
                      className="w-full py-2.5 px-4 text-xs font-bold text-[#0B2545] bg-[#7DD3FC] rounded-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      Consultar por mi local →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* TECNOLOGÍA Y SERVICIOS SPA SIMPLIFICADOS */}
            <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#D6E2EE]">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="max-w-2xl space-y-2">
                  <div className="text-xs font-semibold text-[#1D4ED8]">
                    Tecnología y Diferenciación
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E2E]">
                    No solo ofrecemos peluquería. Creamos experiencias de Spa con costos controlados
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-7 rounded-2xl bg-[#0B2545] text-white space-y-3">
                    <div className="text-xs font-mono text-[#7DD3FC]">SISTEMA EN COMODATO</div>
                    <h3 className="text-xl font-bold">Costo por Baño Garantizado</h3>
                    <p className="text-sm text-[#D4E6F7] leading-relaxed">
                      Dispensador mural conectado a nuestra cosmética concentrada que dosifica la
                      cantidad exacta por mascota, evitando desperdicios y estandarizando el costo
                      operativo de cada baño.
                    </p>
                  </div>

                  <div className="p-7 rounded-2xl bg-[#0B2545] text-white space-y-3">
                    <div className="text-xs font-mono text-[#7DD3FC]">EQUIPAMIENTO DE ESTACIÓN</div>
                    <h3 className="text-xl font-bold">Sistema GROOM-TEK</h3>
                    <p className="text-sm text-[#D4E6F7] leading-relaxed">
                      Estaciones de trabajo profesionales con herramientas organizadas, ergonomía
                      para el groomer, mantenimiento y abastecimiento continuo sujeto al formato
                      comercial elegido.
                    </p>
                  </div>
                </div>

                {/* Ventajas Comparativas en formato simple */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#F6F9FC] border border-[#D6E2EE] space-y-4">
                  <h3 className="text-lg font-bold text-[#0F1E2E]">
                    ¿Por qué elegir RED GROOM en lugar de iniciar solo?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-[#0F1E2E]">
                    {[
                      'Marca e identidad comercial lista',
                      'Procesos y manuales estandarizados',
                      'Abastecimiento directo de cosmética',
                      'Control exacto de insumos por baño',
                    ].map((adv, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-3.5 bg-white rounded-lg border border-[#D6E2EE]"
                      >
                        <Check className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                        <span className="font-medium text-xs sm:text-sm">{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 3. CÓMO FUNCIONA (6 PASOS) Y GALERÍA */}
        {showProcessAndGallery && (
          <section className="py-16 px-4 sm:px-6 bg-[#F6F9FC] border-b border-[#D6E2EE]">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="max-w-2xl space-y-2">
                <div className="text-xs font-semibold text-[#1D4ED8]">Paso a Paso</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E2E]">
                  ¿Cómo funciona abrir tu Spa RED GROOM?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    n: '01',
                    t: 'Solicita información',
                    d: 'Déjanos tus datos en el formulario o escríbenos por WhatsApp.',
                  },
                  {
                    n: '02',
                    t: 'Evaluamos tu perfil y ubicación',
                    d: 'Validamos tu ciudad y el potencial de tu local comercial.',
                  },
                  {
                    n: '03',
                    t: 'Conoces la propuesta económica',
                    d: 'Te presentamos el formato ideal y las condiciones comerciales.',
                  },
                  {
                    n: '04',
                    t: 'Formalizamos el acuerdo',
                    d: 'Firmamos el contrato de microfranquicia e iniciamos adecuación.',
                  },
                  {
                    n: '05',
                    t: 'Capacitación y equipamiento',
                    d: 'Recibes tus estaciones GROOM-TEK, cosmética y entrenamiento.',
                  },
                  {
                    n: '06',
                    t: 'Abrimos tu Spa RED GROOM',
                    d: 'Inicias operación con acompañamiento comercial y manuales.',
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="p-6 bg-white rounded-xl border border-[#D6E2EE] space-y-2"
                  >
                    <div className="font-mono text-xs font-bold text-[#1D4ED8]">
                      PASO {step.n}
                    </div>
                    <h3 className="text-base font-bold text-[#0F1E2E]">{step.t}</h3>
                    <p className="text-sm text-[#4A607A] leading-relaxed">{step.d}</p>
                  </div>
                ))}
              </div>

              {/* Galería Compacta de 3 Vistas Clave */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-[#0F1E2E]">
                  Nuestros espacios y estaciones de trabajo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {gallery.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-[#D6E2EE] overflow-hidden"
                    >
                      <div className="h-48 w-full border-b border-[#D6E2EE]">
                        <StudioVisual
                          variant={item.visualType}
                          customImageUrl={item.customImageUrl}
                          alt={item.title}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-sm font-bold text-[#0F1E2E]">{item.title}</div>
                        <p className="text-xs text-[#4A607A] mt-1">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. PREGUNTAS FRECUENTES */}
        {showFaq && (
          <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#D6E2EE]">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="text-xs font-semibold text-[#1D4ED8]">Preguntas Frecuentes</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1E2E]">
                  Resolvemos tus dudas principales
                </h2>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border border-[#D6E2EE] bg-[#F6F9FC] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#EDF3F8] transition-colors cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-[#0F1E2E]">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#1D4ED8] shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 pt-2 text-sm text-[#4A607A] bg-white border-t border-[#D6E2EE] leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. FORMULARIO DE CAPTACIÓN Y CIERRE */}
        {showContact && (
          <section id="formulario" className="py-16 px-4 sm:px-6 bg-[#0B2545] text-white">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div className="text-xs font-semibold text-[#7DD3FC]">
                  Contacto directo de expansión
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  TU PRÓXIMO NEGOCIO PUEDE COMENZAR AQUÍ
                </h2>
                <p className="text-sm text-[#D4E6F7] leading-relaxed">
                  Déjanos tus datos para recibir la información comercial de RED GROOM o escríbenos
                  directamente por WhatsApp.
                </p>

                <div className="pt-2">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logEvent('whatsapp_click', { location: 'contact_section' })}
                    className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-[#0B2545] bg-[#7DD3FC] rounded-lg hover:bg-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    CONTACTAR POR WHATSAPP
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                {submittedLead ? (
                  <div className="p-8 rounded-2xl bg-white text-[#0F1E2E] space-y-5">
                    <div className="w-10 h-10 rounded-lg bg-[#E6F0FA] text-[#1D4ED8] flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">
                      ¡Gracias, {submittedLead.fullName}! Recibimos tu solicitud.
                    </h3>
                    <p className="text-sm text-[#4A607A]">
                      Un asesor comercial de RED GROOM te contactará muy pronto para evaluar tu
                      proyecto en <strong>{submittedLead.city}</strong>.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a
                        href={getWhatsAppUrl(
                          `Hola RED GROOM, soy ${submittedLead.fullName} de ${submittedLead.city}. Acabo de enviar el formulario y quiero recibir información.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF]"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Hablar ahora por WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedLead(null);
                          setFullName('');
                          setWhatsapp('');
                          setEmail('');
                          setCity('');
                        }}
                        className="px-4 py-3 text-xs font-semibold text-[#4A607A] hover:text-[#0F1E2E]"
                      >
                        Enviar otro registro
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleFormSubmit}
                    className="p-6 sm:p-8 rounded-2xl bg-white text-[#0F1E2E] space-y-4 shadow-xl"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Nombre completo *</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">WhatsApp *</label>
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+57 300 000 0000"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Correo electrónico *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Ciudad *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ciudad de interés"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          ¿Tienes experiencia en mascotas?
                        </label>
                        <select
                          value={hasPetExperience}
                          onChange={(e) => setHasPetExperience(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                        >
                          <option value="Sí, experiencia en sector mascotas / grooming">
                            Sí, tengo experiencia
                          </option>
                          <option value="No, perfil inversionista / emprendedor">
                            No, busco invertir / emprender
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          ¿Dispones de un local?
                        </label>
                        <select
                          value={hasPremises}
                          onChange={(e) => setHasPremises(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                        >
                          <option value="Sí, dispongo de local">Sí, tengo local</option>
                          <option value="En búsqueda activa de local">Estoy buscando local</option>
                          <option value="Aún no tengo local">Aún no tengo local</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Presupuesto disponible
                        </label>
                        <select
                          value={availableBudget}
                          onChange={(e) => setAvailableBudget(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                        >
                          <option value="Presupuesto completo disponible">
                            Capital disponible para iniciar
                          </option>
                          <option value="Capital parcial + financiación">
                            Capital parcial + financiación
                          </option>
                          <option value="Deseo conocer la propuesta económica">
                            Deseo conocer la inversión requerida
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          ¿En cuánto tiempo deseas iniciar?
                        </label>
                        <select
                          value={startTimeline}
                          onChange={(e) => setStartTimeline(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                        >
                          <option value="Inmediato (menos de 1 mes)">Inmediato</option>
                          <option value="De 1 a 3 meses">De 1 a 3 meses</option>
                          <option value="Más de 3 meses">Más de 3 meses</option>
                        </select>
                      </div>
                    </div>

                    {formError && (
                      <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {formError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 text-sm font-bold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer"
                    >
                      QUIERO RECIBIR INFORMACIÓN
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* SIMPLE CLEAN FOOTER */}
      <footer className="bg-[#061527] text-[#B8D4EE] py-8 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-white text-sm">RED GROOM</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#7DD3FC]" />
              {siteConfig.contactPhone}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#7DD3FC]" />
              {siteConfig.contactEmail}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#7DD3FC]" />
              {siteConfig.geographicCoverage}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/10 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#7DD3FC]" />
            Administrar ({leads.length})
          </button>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logEvent('whatsapp_click', { location: 'floating_button' })}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] rounded-full shadow-lg hover:bg-[#1E40AF] transition-colors"
      >
        <MessageCircle className="w-4 h-4 text-[#7DD3FC]" />
        <span>WhatsApp</span>
      </a>

      {/* ADMIN PANEL */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        leads={leads}
        onUpdateLeads={setLeads}
        faqs={faqs}
        onUpdateFaqs={setFaqs}
        siteConfig={siteConfig}
        onUpdateSiteConfig={setSiteConfig}
        gallery={gallery}
        onUpdateGallery={setGallery}
        analyticsEvents={analyticsEvents}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
