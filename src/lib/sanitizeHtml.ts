const BLOCKED = "script,style,iframe,object,embed,link,meta,base,form,input,button,textarea,select";

/**
 * Strips scripts, embeds, forms, inline event handlers and javascript: URLs from CMS HTML
 * before it's rendered with dangerouslySetInnerHTML. Browser only (uses DOMParser).
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll(BLOCKED).forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || name === "style" || ((name === "href" || name === "src" || name === "xlink:href") && /^(javascript|data|vbscript):/.test(value))) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
  return doc.body.innerHTML;
}
