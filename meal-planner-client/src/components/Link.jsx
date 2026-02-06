// Custom Link component for Vike
// Vike automatically handles client-side navigation for <a> tags
export function Link({ href, children, className, ...props }) {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}
