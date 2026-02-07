// Simple Link wrapper - Vike automatically handles <a> tag navigation
export function Link({ to, href, children, className, onClick, ...props }) {
  // Support both 'to' (React Router style) and 'href' (standard)
  const linkHref = to || href;

  return (
    <a href={linkHref} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}
