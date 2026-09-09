/** Opens WhatsApp with the text prefilled; the user picks the chat. */
export default function ShareButton({
  text,
  label = 'Share to WhatsApp',
}: {
  text: string
  label?: string
}) {
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 font-medium text-white shadow-sm hover:brightness-95"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
      </svg>
      {label}
    </a>
  )
}
