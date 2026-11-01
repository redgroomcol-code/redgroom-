import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  FileText,
  Settings,
  Download,
  Trash2,
  Plus,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  Search,
} from 'lucide-react';
import {
  FranchiseLead,
  LeadStatus,
  FAQItem,
  SiteConfig,
  GalleryItem,
} from '../data/redGroomData';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  createLeadsSpreadsheet,
  syncLeadsToGoogleSheet,
} from '../services/googleSheets';
import { AnalyticsEventRecord } from '../services/analytics';
import type { User } from 'firebase/auth';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  leads: FranchiseLead[];
  onUpdateLeads: (leads: FranchiseLead[]) => void;
  faqs: FAQItem[];
  onUpdateFaqs: (faqs: FAQItem[]) => void;
  siteConfig: SiteConfig;
  onUpdateSiteConfig: (config: SiteConfig) => void;
  gallery: GalleryItem[];
  onUpdateGallery: (gallery: GalleryItem[]) => void;
  analyticsEvents: AnalyticsEventRecord[];
  onResetDefaults: () => void;
}

const LEAD_STATUSES: LeadStatus[] = [
  'Nuevo Prospecto',
  'Contactado',
  'En Evaluación',
  'Propuesta Enviada',
  'Cerrado / Franquiciado',
  'Descartado',
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  leads,
  onUpdateLeads,
  faqs,
  onUpdateFaqs,
  siteConfig,
  onUpdateSiteConfig,
  gallery,
  onUpdateGallery,
  analyticsEvents,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'cms' | 'faqs' | 'integrations'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Google Auth & Sheets state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsStatusMsg, setSheetsStatusMsg] = useState<string | null>(null);
  const [sheetsErrorMsg, setSheetsErrorMsg] = useState<string | null>(null);

  // Explicit Confirmation Modal state for destructive/mutating operations
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // New FAQ state
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Condiciones Comerciales');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.whatsapp.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    onUpdateLeads(updated);
  };

  const handleDeleteLead = (lead: FranchiseLead) => {
    setConfirmDialog({
      title: '¿Eliminar prospecto comercial?',
      description: `Se eliminará permanentemente el registro de "${lead.fullName}" (${lead.city}). Esta acción no se puede deshacer.`,
      confirmLabel: 'Confirmar eliminación',
      onConfirm: () => {
        onUpdateLeads(leads.filter((l) => l.id !== lead.id));
        setConfirmDialog(null);
      },
    });
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Fecha',
      'Ciudad',
      'Nombre Completo',
      'WhatsApp',
      'Correo',
      'Experiencia Mascotas',
      'Dispone Local',
      'Presupuesto',
      'Tiempo Inicio',
      'Estado Comercial',
    ];
    const rows = leads.map((l) =>
      [
        l.id,
        l.createdAt,
        l.city,
        l.fullName,
        l.whatsapp,
        l.email,
        l.hasPetExperience,
        l.hasPremises,
        l.availableBudget,
        l.startTimeline,
        l.status,
      ]
        .map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `red-groom-prospectos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setSheetsErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setSheetsStatusMsg('Cuenta de Google conectada correctamente.');
      }
    } catch (err: any) {
      setSheetsErrorMsg(err?.message || 'Error al autenticar con Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      setSheetsErrorMsg('Inicia sesión con Google primero para crear una hoja de cálculo.');
      return;
    }

    setIsSyncingSheets(true);
    setSheetsErrorMsg(null);
    setSheetsStatusMsg(null);
    try {
      const created = await createLeadsSpreadsheet(token);
      onUpdateSiteConfig({
        ...siteConfig,
        googleSpreadsheetId: created.spreadsheetId,
      });
      const syncResult = await syncLeadsToGoogleSheet(created.spreadsheetId, leads, token);
      onUpdateLeads(leads.map((l) => ({ ...l, syncedToSheets: true })));
      setSheetsStatusMsg(
        `Hoja creada y sincronizada (${syncResult.updatedRows} prospectos en pestaña "${syncResult.sheetName}").`
      );
    } catch (err: any) {
      setSheetsErrorMsg(err?.message || 'No se pudo crear la hoja en Google Sheets.');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleRequestSyncToGoogleSheets = () => {
    if (!siteConfig.googleSpreadsheetId.trim()) {
      setSheetsErrorMsg('Ingresa un Spreadsheet ID o crea una nueva hoja automáticamente.');
      return;
    }

    // Mandatory User Confirmation before mutating/updating Google Sheets data
    setConfirmDialog({
      title: '¿Actualizar datos en Google Sheets?',
      description: `Se escribirán ${leads.length} registros de prospectos comerciales en la hoja de cálculo vinculada (${siteConfig.googleSpreadsheetId}). Confirma para proceder con la actualización.`,
      confirmLabel: 'Confirmar y sincronizar',
      onConfirm: async () => {
        setConfirmDialog(null);
        const token = await getAccessToken();
        if (!token) {
          setSheetsErrorMsg('Tu sesión de Google expiró. Vuelve a iniciar sesión.');
          return;
        }
        setIsSyncingSheets(true);
        setSheetsErrorMsg(null);
        setSheetsStatusMsg(null);
        try {
          const result = await syncLeadsToGoogleSheet(
            siteConfig.googleSpreadsheetId.trim(),
            leads,
            token
          );
          onUpdateLeads(leads.map((l) => ({ ...l, syncedToSheets: true })));
          setSheetsStatusMsg(
            `Sincronización completada: ${result.updatedRows} prospectos actualizados en la pestaña "${result.sheetName}".`
          );
        } catch (err: any) {
          setSheetsErrorMsg(err?.message || 'Error al sincronizar con Google Sheets.');
        } finally {
          setIsSyncingSheets(false);
        }
      },
    });
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      category: newFaqCategory.trim() || 'General',
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
    };
    onUpdateFaqs([...faqs, newItem]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleDeleteFaq = (faq: FAQItem) => {
    setConfirmDialog({
      title: '¿Eliminar pregunta frecuente?',
      description: `Se eliminará la pregunta "${faq.question}" del listado público del sitio.`,
      confirmLabel: 'Confirmar eliminación',
      onConfirm: () => {
        onUpdateFaqs(faqs.filter((item) => item.id !== faq.id));
        setConfirmDialog(null);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl border border-[#D6E2EE] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B2545] text-white">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Panel de Administración · RED GROOM
            </h2>
            <p className="text-xs text-[#B8D4EE]">
              Gestión de prospectos comerciales, sincronización con Google Sheets y administración de contenidos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar panel de administración"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#EDF3F8] border-b border-[#D6E2EE]">
          <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-[#D6E2EE]">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'leads'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#4A607A] hover:text-[#0F1E2E]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Prospectos ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'faqs'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#4A607A] hover:text-[#0F1E2E]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Preguntas Frecuentes ({faqs.length})
            </button>
            <button
              onClick={() => setActiveTab('cms')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'cms'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#4A607A] hover:text-[#0F1E2E]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Contenidos y Contacto
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'integrations'
                  ? 'bg-[#0B2545] text-white'
                  : 'text-[#4A607A] hover:text-[#0F1E2E]'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Google Sheets & Analytics
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B2545] bg-white border border-[#0B2545]/25 rounded-lg hover:bg-[#E6F0FA] transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar CSV
            </button>
            <button
              onClick={() =>
                setConfirmDialog({
                  title: '¿Restaurar contenidos predeterminados?',
                  description:
                    'Se restaurarán los textos originales, preguntas frecuentes y galería de RED GROOM. Los prospectos registrados se mantendrán intactos.',
                  confirmLabel: 'Restaurar textos',
                  onConfirm: () => {
                    onResetDefaults();
                    setConfirmDialog(null);
                  },
                })
              }
              className="px-3 py-2 text-xs font-medium text-[#5C728A] hover:text-[#0F1E2E] transition-colors whitespace-nowrap shrink-0"
            >
              Restaurar textos base
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LEADS CRM */}
          {activeTab === 'leads' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#5C728A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, ciudad, correo o WhatsApp..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      statusFilter === 'ALL'
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-[#EDF3F8] text-[#4A607A] hover:text-[#0F1E2E]'
                    }`}
                  >
                    Todos ({leads.length})
                  </button>
                  {LEAD_STATUSES.map((st) => {
                    const count = leads.filter((l) => l.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          statusFilter === st
                            ? 'bg-[#0B2545] text-white'
                            : 'bg-[#EDF3F8] text-[#4A607A] hover:text-[#0F1E2E]'
                        }`}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center border border-[#D6E2EE] rounded-xl bg-[#F6F9FC]">
                  <p className="text-sm font-medium text-[#0F1E2E]">
                    No se encontraron prospectos con los filtros actuales.
                  </p>
                  <p className="text-xs text-[#5C728A] mt-1">
                    Los formularios enviados en la página se registran automáticamente aquí.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#D6E2EE] rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EDF3F8] border-b border-[#D6E2EE] text-xs font-semibold text-[#4A607A]">
                        <th className="py-3 px-4">Fecha · Ciudad</th>
                        <th className="py-3 px-4">Interesado</th>
                        <th className="py-3 px-4">Perfil & Local</th>
                        <th className="py-3 px-4">Presupuesto & Plazo</th>
                        <th className="py-3 px-4">Estado Comercial</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6E2EE] text-sm">
                      {filteredLeads.map((lead) => {
                        const cleanPhone = lead.whatsapp.replace(/\D/g, '');
                        const waText = encodeURIComponent(
                          `Hola ${lead.fullName}, te escribimos del equipo de expansión de RED GROOM respecto a tu solicitud de microfranquicia en ${lead.city}.`
                        );
                        return (
                          <tr key={lead.id} className="hover:bg-[#F6F9FC] transition-colors">
                            <td className="py-3.5 px-4 align-top">
                              <div className="font-mono text-xs tabular-nums text-[#5C728A]">
                                {lead.createdAt}
                              </div>
                              <div className="font-semibold text-[#0B2545] mt-0.5">{lead.city}</div>
                            </td>
                            <td className="py-3.5 px-4 align-top">
                              <div className="font-semibold text-[#0F1E2E]">{lead.fullName}</div>
                              <div className="font-mono text-xs tabular-nums text-[#4A607A] mt-0.5">
                                {lead.whatsapp}
                              </div>
                              <div className="text-xs text-[#5C728A]">{lead.email}</div>
                            </td>
                            <td className="py-3.5 px-4 align-top text-xs text-[#4A607A]">
                              <div>
                                <span className="font-semibold text-[#0F1E2E]">Experiencia:</span>{' '}
                                {lead.hasPetExperience}
                              </div>
                              <div className="mt-1">
                                <span className="font-semibold text-[#0F1E2E]">Local:</span>{' '}
                                {lead.hasPremises}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 align-top text-xs text-[#4A607A]">
                              <div>
                                <span className="font-semibold text-[#0F1E2E]">Presupuesto:</span>{' '}
                                {lead.availableBudget}
                              </div>
                              <div className="mt-1">
                                <span className="font-semibold text-[#0F1E2E]">Inicio:</span>{' '}
                                {lead.startTimeline}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 align-top">
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  handleStatusChange(lead.id, e.target.value as LeadStatus)
                                }
                                className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#D6E2EE] rounded-lg text-[#0B2545] focus:outline-none focus:border-[#1D4ED8]"
                              >
                                {LEAD_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4 align-top text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`https://wa.me/${cleanPhone}?text=${waText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors whitespace-nowrap shrink-0"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  WhatsApp
                                </a>
                                <button
                                  onClick={() => handleDeleteLead(lead)}
                                  className="p-1.5 text-[#5C728A] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  aria-label="Eliminar prospecto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FAQ EDITOR */}
          {activeTab === 'faqs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleAddFaq}
                  className="p-5 bg-[#F6F9FC] border border-[#D6E2EE] rounded-xl space-y-4"
                >
                  <h3 className="text-base font-bold text-[#0F1E2E]">
                    Agregar Nueva Pregunta Frecuente
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Categoría temática
                    </label>
                    <input
                      type="text"
                      value={newFaqCategory}
                      onChange={(e) => setNewFaqCategory(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6E2EE] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Pregunta
                    </label>
                    <input
                      type="text"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      placeholder="Ej. ¿Cómo se gestiona la exclusividad de zona?"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6E2EE] rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Respuesta comercial oficial
                    </label>
                    <textarea
                      rows={4}
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      placeholder="Escribe la respuesta clara y verificable..."
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6E2EE] rounded-lg"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Publicar Pregunta Frecuente
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-base font-bold text-[#0F1E2E]">
                  Preguntas Frecuentes Activas (Editables en vivo)
                </h3>
                {faqs.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className="p-4 bg-white border border-[#D6E2EE] rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#5C728A]">
                        {String(idx + 1).padStart(2, '0')} · {faq.category}
                      </span>
                      <button
                        onClick={() => handleDeleteFaq(faq)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const next = faqs.map((item) =>
                          item.id === faq.id ? { ...item, question: e.target.value } : item
                        );
                        onUpdateFaqs(next);
                      }}
                      className="w-full px-3 py-1.5 text-sm font-semibold text-[#0F1E2E] bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                    />
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => {
                        const next = faqs.map((item) =>
                          item.id === faq.id ? { ...item, answer: e.target.value } : item
                        );
                        onUpdateFaqs(next);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-[#4A607A] bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CMS CONTENT & GALLERY */}
          {activeTab === 'cms' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#0F1E2E]">
                  Mensajes Principales y Condiciones Comerciales
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    Título Principal (Hero)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroTitle}
                    onChange={(e) =>
                      onUpdateSiteConfig({ ...siteConfig, heroTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    Subtítulo Principal
                  </label>
                  <textarea
                    rows={2}
                    value={siteConfig.heroSubtitle}
                    onChange={(e) =>
                      onUpdateSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    Eslogan Complementario
                  </label>
                  <input
                    type="text"
                    value={siteConfig.complementarySlogan}
                    onChange={(e) =>
                      onUpdateSiteConfig({ ...siteConfig, complementarySlogan: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    Nota de Condiciones Comerciales (Sección Equipamiento / Tecnología)
                  </label>
                  <textarea
                    rows={3}
                    value={siteConfig.commercialConditionsNote}
                    onChange={(e) =>
                      onUpdateSiteConfig({
                        ...siteConfig,
                        commercialConditionsNote: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#0F1E2E]">
                  Canales de Contacto, WhatsApp y Cobertura
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Número WhatsApp Comercial (con código de país)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.whatsappNumber}
                      onChange={(e) =>
                        onUpdateSiteConfig({ ...siteConfig, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm font-mono bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Teléfono Corporativo
                    </label>
                    <input
                      type="text"
                      value={siteConfig.contactPhone}
                      onChange={(e) =>
                        onUpdateSiteConfig({ ...siteConfig, contactPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm font-mono bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    Correo Electrónico de Expansión
                  </label>
                  <input
                    type="email"
                    value={siteConfig.contactEmail}
                    onChange={(e) =>
                      onUpdateSiteConfig({ ...siteConfig, contactEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    Cobertura Geográfica
                  </label>
                  <input
                    type="text"
                    value={siteConfig.geographicCoverage}
                    onChange={(e) =>
                      onUpdateSiteConfig({ ...siteConfig, geographicCoverage: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={siteConfig.instagramHandle}
                      onChange={(e) =>
                        onUpdateSiteConfig({ ...siteConfig, instagramHandle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={siteConfig.facebookHandle}
                      onChange={(e) =>
                        onUpdateSiteConfig({ ...siteConfig, facebookHandle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={siteConfig.linkedinHandle}
                      onChange={(e) =>
                        onUpdateSiteConfig({ ...siteConfig, linkedinHandle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F6F9FC] border border-[#D6E2EE] rounded-lg"
                    />
                  </div>
                </div>

                {/* Custom Image URL overrides for Gallery */}
                <div className="pt-4 border-t border-[#D6E2EE]">
                  <h4 className="text-xs font-bold text-[#0F1E2E] mb-2">
                    Personalizar Imágenes de Galería (URL opcional con respaldo automático)
                  </h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {gallery.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#4A607A] w-44 truncate shrink-0">
                          {item.title}
                        </span>
                        <input
                          type="url"
                          value={item.customImageUrl || ''}
                          onChange={(e) => {
                            const next = gallery.map((g) =>
                              g.id === item.id ? { ...g, customImageUrl: e.target.value } : g
                            );
                            onUpdateGallery(next);
                          }}
                          placeholder="URL de fotografía personalizada (opcional)"
                          className="flex-1 px-2.5 py-1 text-xs bg-[#F6F9FC] border border-[#D6E2EE] rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE SHEETS & GOOGLE ANALYTICS */}
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Google Sheets Card */}
              <div className="p-6 bg-[#F6F9FC] border border-[#D6E2EE] rounded-xl space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#0F1E2E]">
                    Integración con Google Sheets (Almacenamiento de Prospectos)
                  </h3>
                  <p className="text-xs text-[#5C728A] mt-1 leading-relaxed">
                    Conecta tu cuenta de Google para crear o vincular una hoja de cálculo donde se
                    registran automáticamente fecha, ciudad, perfil y estado comercial de cada
                    prospecto.
                  </p>
                </div>

                {/* Official Google Sign-In Button or Connected State */}
                {!googleUser || !accessToken ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isSigningIn}
                      className="gsi-material-button"
                    >
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            style={{ display: 'block' }}
                          >
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            ></path>
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            ></path>
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            ></path>
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            ></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isSigningIn ? 'Conectando...' : 'Sign in with Google'}
                        </span>
                      </div>
                    </button>
                    <p className="text-xs text-[#5C728A]">
                      Se solicitará permiso para crear y actualizar hojas de cálculo de Google
                      Sheets.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white border border-[#D6E2EE] rounded-lg">
                      <div className="text-xs">
                        <div className="font-semibold text-[#0B2545]">
                          Sesión activa: {googleUser.displayName || googleUser.email}
                        </div>
                        <div className="text-[#5C728A]">{googleUser.email}</div>
                      </div>
                      <button
                        onClick={logoutGoogle}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Cerrar sesión
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                        ID de Hoja de Cálculo (Google Spreadsheet ID)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={siteConfig.googleSpreadsheetId}
                          onChange={(e) =>
                            onUpdateSiteConfig({
                              ...siteConfig,
                              googleSpreadsheetId: e.target.value,
                            })
                          }
                          placeholder="Ej. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                          className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-[#D6E2EE] rounded-lg"
                        />
                        {siteConfig.googleSpreadsheetId && (
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${siteConfig.googleSpreadsheetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#0B2545] bg-white border border-[#D6E2EE] rounded-lg hover:bg-[#E6F0FA]"
                          >
                            Abrir
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={handleCreateSpreadsheet}
                        disabled={isSyncingSheets}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] disabled:opacity-50 transition-colors"
                      >
                        {isSyncingSheets
                          ? 'Procesando...'
                          : 'Crear Nueva Hoja en Google Sheets'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestSyncToGoogleSheets}
                        disabled={isSyncingSheets || !siteConfig.googleSpreadsheetId.trim()}
                        className="px-4 py-2 text-xs font-semibold text-[#0B2545] bg-white border border-[#0B2545] rounded-lg hover:bg-[#E6F0FA] disabled:opacity-50 transition-colors"
                      >
                        Sincronizar Prospectos ({leads.length})
                      </button>
                    </div>
                  </div>
                )}

                {sheetsStatusMsg && (
                  <div className="flex items-start gap-2 p-3 text-xs text-[#0B2545] bg-[#E6F0FA] border border-[#7DD3FC] rounded-lg">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{sheetsStatusMsg}</span>
                  </div>
                )}

                {sheetsErrorMsg && (
                  <div className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{sheetsErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Google Analytics 4 Card */}
              <div className="p-6 bg-[#F6F9FC] border border-[#D6E2EE] rounded-xl space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#0F1E2E]">
                    Google Analytics 4 & Registro de Eventos de Conversión
                  </h3>
                  <p className="text-xs text-[#5C728A] mt-1 leading-relaxed">
                    Configura tu ID de medición de Google Analytics (GA4) para medir tráfico,
                    clics a WhatsApp y envíos del formulario de microfranquicia.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A607A] mb-1">
                    ID de Medición GA4 (Measurement ID)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.googleAnalyticsId}
                    onChange={(e) =>
                      onUpdateSiteConfig({
                        ...siteConfig,
                        googleAnalyticsId: e.target.value,
                      })
                    }
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-[#D6E2EE] rounded-lg"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0F1E2E] mb-2">
                    Eventos Comerciales Registrados en esta Sesión ({analyticsEvents.length})
                  </h4>
                  <div className="bg-white border border-[#D6E2EE] rounded-lg max-h-48 overflow-y-auto divide-y divide-[#D6E2EE]">
                    {analyticsEvents.length === 0 ? (
                      <div className="p-4 text-xs text-[#5C728A] text-center">
                        Aún no se han disparado eventos en esta sesión.
                      </div>
                    ) : (
                      analyticsEvents.map((ev) => (
                        <div key={ev.id} className="px-3.5 py-2 text-xs flex items-center justify-between gap-2">
                          <div>
                            <span className="font-mono font-semibold text-[#1D4ED8]">
                              {ev.eventName}
                            </span>
                            <span className="text-[#5C728A] ml-2">
                              {Object.entries(ev.params)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' · ')}
                            </span>
                          </div>
                          <span className="font-mono tabular-nums text-[#5C728A] shrink-0">
                            {ev.timestamp}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explicit User Confirmation Modal for Mutating/Destructive Actions */}
        {confirmDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl border border-[#D6E2EE] p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-[#0F1E2E]">{confirmDialog.title}</h3>
              <p className="text-xs text-[#4A607A] leading-relaxed">{confirmDialog.description}</p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#4A607A] bg-[#EDF3F8] rounded-lg hover:bg-[#D6E2EE] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] transition-colors"
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
