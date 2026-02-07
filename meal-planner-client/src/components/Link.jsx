// Custom Link component for Vike
// Vike automatically handles client-side navigation for <a> tags
export function Link({ to, href, children, className, ...props }) {
  // Support both 'to' (React Router style) and 'href' (standard)
  const linkHref = to || href;
  return (
    <a href={linkHref} className={className} {...props}>
      {children}
    </a>
  );
}
