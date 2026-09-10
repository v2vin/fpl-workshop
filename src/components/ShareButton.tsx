/** Opens WhatsApp with the text prefilled; the user picks the chat. */
export default function ShareButton({
  text,
  label = 'Share to WhatsApp ↗',
  className = '',
}: {
  text: string
  label?: string
  className?: string
}) {
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-whatsapp ${className}`}
    >
      {label}
    </a>
  )
}
