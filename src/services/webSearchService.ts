import { WebSearchResult } from '../types';

export interface ScrapedPageResult {
  url: string;
  title: string;
  text: string;
  totalLength: number;
}

/**
 * Detecta si un texto contiene URLs http:// o https://
 */
export function extractUrlsFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s"'<>()[\]{}]+)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

/**
 * Consulta la búsqueda web a través de la API local o fallback a Wikipedia
 */
export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map((item: any, idx: number) => ({
          id: `src-${Date.now()}-${idx + 1}`,
          title: item.title || 'Resultado web',
          url: item.url,
          snippet: item.snippet || '',
          domain: item.domain || (new URL(item.url).hostname.replace(/^www\./, '')),
          publishedDate: 'Reciente',
        }));
      }
    }
  } catch (err) {
    console.warn('[WebSearchService] Fallo en /api/search, intentando fallback cliente:', err);
  }

  // Fallback directo desde el cliente a la API abierta de Wikipedia
  try {
    const wikiRes = await fetch(
      `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json&origin=*`
    );
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const hits = wikiData.query?.search || [];
      return hits.slice(0, 4).map((item: any, idx: number) => ({
        id: `wiki-${Date.now()}-${idx + 1}`,
        title: `${item.title} - Wikipedia`,
        url: `https://es.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
        snippet: item.snippet.replace(/<[^>]+>/g, '').trim(),
        domain: 'es.wikipedia.org',
        publishedDate: 'Enciclopedia en vivo',
      }));
    }
  } catch (wikiErr) {
    console.error('[WebSearchService] Error en fallback Wikipedia:', wikiErr);
  }

  return [];
}

/**
 * Descarga y extrae el texto limpio de una página web
 */
export async function scrapeUrl(url: string): Promise<ScrapedPageResult | null> {
  try {
    const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url || url,
        title: data.title || url,
        text: data.text || '',
        totalLength: data.totalLength || 0,
      };
    }
  } catch (err) {
    console.error('[WebSearchService] Error al scrapear URL:', err);
  }
  return null;
}

/**
 * Construye el prompt con inyección de contexto web fundamentado (RAG)
 * optimizado para modelos 3B como Qwen 2.5
 */
export function buildGroundedPrompt(
  userQuery: string,
  searchResults: WebSearchResult[],
  scrapedPage?: ScrapedPageResult | null
): string {
  let contextBlock = '';

  if (scrapedPage && scrapedPage.text) {
    contextBlock += `--- CONTENIDO EXTRAÍDO DE LA PÁGINA WEB [${scrapedPage.title}] (${scrapedPage.url}) ---\n`;
    contextBlock += `${scrapedPage.text}\n---\n\n`;
  }

  if (searchResults.length > 0) {
    contextBlock += `--- INFORMACIÓN OBTENIDA EN TIEMPO REAL DESDE LA WEB ---\n`;
    searchResults.forEach((r, idx) => {
      contextBlock += `[Fuente ${idx + 1}]: "${r.title}"\n`;
      contextBlock += `URL: ${r.url} | Dominio: ${r.domain}\n`;
      if (r.snippet) {
        contextBlock += `Extracto: ${r.snippet}\n`;
      }
      contextBlock += `\n`;
    });
    contextBlock += `--- FIN DE RESULTADOS WEB ---\n\n`;
  }

  const systemInstruction = 
    `Actúa como asistente corporativo BDR conectado a internet en tiempo real. ` +
    `Utiliza los datos web actualizados y extraídos de arriba para responder con máxima precisión, ` +
    `citando siempre las fuentes correspondientes con formato [1], [2], etc. al referirte a cada dato. ` +
    `Si la información no está en los resultados, indícalo con honestidad sin inventar datos.`;

  return `${systemInstruction}\n\n${contextBlock}CONSULTA DEL USUARIO:\n${userQuery}`;
}

/**
 * Comprueba si Ollama está en ejecución localmente
 */
export async function checkOllamaLive(baseUrl: string = 'http://localhost:11434'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Envía la petición a Ollama local (si está accesible en localhost:11434)
 */
export async function queryLocalOllama(
  modelTag: string,
  prompt: string,
  baseUrl: string = 'http://localhost:11434'
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelTag,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Baja temperatura para mayor fidelidad a los hechos web
          num_ctx: 4096,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data.response || null;
    }
  } catch (err) {
    console.warn('[WebSearchService] No se pudo comunicar con Ollama en localhost:11434:', err);
  }
  return null;
}
