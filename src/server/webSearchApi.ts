import type { IncomingMessage, ServerResponse } from 'http';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export async function handleSearchRequest(req: IncomingMessage, res: ServerResponse) {
  try {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost:3000'}`);
    const query = parsedUrl.searchParams.get('q') || '';

    if (!query.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Falta el parámetro de búsqueda "q"' }));
      return;
    }

    const results: SearchResultItem[] = [];

    // 1. DuckDuckGo HTML parser con headers de navegador
    try {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const ddgRes = await fetch(ddgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (ddgRes.ok) {
        const html = await ddgRes.text();
        const blocks = html.split(/class="[^"]*web-result[^"]*"/);
        for (let i = 1; i < blocks.length && results.length < 6; i++) {
          const b = blocks[i];
          const titleMatch = b.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
          const snippetMatch = b.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/);
          if (titleMatch) {
            let itemUrl = titleMatch[1];
            if (itemUrl.includes('uddg=')) {
              const u = itemUrl.match(/uddg=([^&]+)/);
              if (u) itemUrl = decodeURIComponent(u[1]);
            }
            const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();
            const snippet = snippetMatch 
              ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim() 
              : '';
            
            try {
              const parsedItemUrl = new URL(itemUrl);
              const domain = parsedItemUrl.hostname.replace(/^www\./, '');
              if (!results.some(r => r.url === itemUrl)) {
                results.push({ title, url: itemUrl, snippet, domain });
              }
            } catch {
              // URL inválida ignorada
            }
          }
        }
      }
    } catch (err) {
      console.error('[WebSearchApi] Error consultando DuckDuckGo:', err);
    }

    // 2. Si hay pocos resultados, enriquecer con Google News RSS o Wikipedia
    if (results.length < 4) {
      try {
        const wikiRes = await fetch(
          `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`,
          { headers: { 'User-Agent': 'BDRWorkspace/1.0' } }
        );
        if (wikiRes.ok) {
          const wikiData = (await wikiRes.json()) as { query?: { search?: Array<{ title: string; snippet: string }> } };
          for (const item of (wikiData.query?.search || []).slice(0, 3)) {
            const title = item.title;
            const snippet = item.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
            const wikiUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
            if (!results.some(r => r.url === wikiUrl)) {
              results.push({ title: `${title} - Wikipedia`, url: wikiUrl, snippet, domain: 'es.wikipedia.org' });
            }
          }
        }
      } catch (err) {
        console.error('[WebSearchApi] Error consultando Wikipedia:', err);
      }
    }

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({ query, results, total: results.length }));
  } catch (error) {
    console.error('[WebSearchApi] Error global en búsqueda:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Fallo al procesar la búsqueda web', results: [] }));
  }
}

export async function handleScrapeRequest(req: IncomingMessage, res: ServerResponse) {
  try {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost:3000'}`);
    const targetUrl = parsedUrl.searchParams.get('url') || '';

    if (!targetUrl.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Falta el parámetro "url"' }));
      return;
    }

    const fetchRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!fetchRes.ok) {
      res.writeHead(fetchRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `La página respondió con HTTP ${fetchRes.status}`, url: targetUrl }));
      return;
    }

    const html = await fetchRes.text();

    // Extraer título
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : targetUrl;

    // Limpiar etiquetas no deseadas
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Límite de texto para el contexto de Qwen 2.5 3B (aprox. 3500 caracteres para ser eficiente y no saturar RAM)
    const truncated = cleanText.slice(0, 3500);

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({
      url: targetUrl,
      title,
      text: truncated,
      totalLength: cleanText.length,
    }));
  } catch (error) {
    console.error('[WebSearchApi] Error al extraer contenido de URL:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No se pudo descargar o leer la página web solicitada' }));
  }
}
