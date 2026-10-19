/** "Talk to us" support trigger, bottom-right on every learner page. */
export function WhatsAppFab({ href = "https://wa.me/" }: { href?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
    >
      <i className="fa-brands fa-whatsapp text-lg" />
      Talk to us
    </a>
  );
}
