// Shopify product descriptions are free-form HTML from the admin editor (or
// pasted from elsewhere): embedded videos, sizing tables, fixed-width images,
// inline styles. Before rendering one inside the page we
//  - drop <script>, <style> and <link>, which would run or restyle the whole page;
//  - wrap each <table> in a box that scrolls sideways on its own;
//  - wrap each <iframe>/<video>/<embed>/<object> in a box that keeps the
//    embed's aspect ratio (from its width/height attributes, else 16:9) and
//    scales to the column.
// The .rt CSS (shop.css) then caps everything else at the column width.

const dim = (attrs: string, name: string) => {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']?(\\d+(?:\\.\\d+)?)(?:px)?["']?`, "i"));
  const n = m ? Number(m[1]) : NaN;
  return n > 0 ? n : null;
};

function wrapEmbed(tag: string, attrs: string, inner: string, close: string) {
  const w = dim(attrs, "width"), h = dim(attrs, "height");
  const ratio = w && h ? `${w} / ${h}` : "16 / 9";
  return `<div class="rt-embed" style="aspect-ratio:${ratio}"><${tag}${attrs}>${inner}${close}</div>`;
}

export function prepareRichText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|link)\b[^>]*\/?>/gi, "")
    .replace(/<table\b/gi, '<div class="rt-table"><table')
    .replace(/<\/table\s*>/gi, "</table></div>")
    .replace(/<(iframe|video|object)\b([^>]*)>([\s\S]*?)(<\/\1\s*>)/gi, (_, tag: string, attrs: string, inner: string, close: string) => wrapEmbed(tag, attrs, inner, close))
    .replace(/<embed\b([^>]*?)\/?>/gi, (_, attrs: string) => wrapEmbed("embed", attrs, "", ""));
}
