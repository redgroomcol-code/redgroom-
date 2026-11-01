export interface AnalyticsEventRecord {
  id: string;
  timestamp: string;
  eventName: string;
  params: Record<string, string | number>;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initializedMeasurementId = '';

export function initGoogleAnalytics(measurementId: string) {
  const cleanId = measurementId.trim();
  if (!cleanId || cleanId === initializedMeasurementId) return;

  initializedMeasurementId = cleanId;

  if (!document.getElementById('ga-gtag-script')) {
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanId)}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', cleanId, {
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function trackCommercialEvent(
  eventName: string,
  params: Record<string, string | number> = {},
  onEventLogged?: (event: AnalyticsEventRecord) => void
) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  if (onEventLogged) {
    onEventLogged({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      eventName,
      params,
    });
  }
}
