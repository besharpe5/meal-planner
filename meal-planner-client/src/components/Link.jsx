import { navigate } from 'vike/client/router';

// Custom Link component for Vike with explicit client-side navigation
export function Link({ to, href, children, className, onClick, ...props }) {
  // Support both 'to' (React Router style) and 'href' (standard)
  const linkHref = to || href;

  const handleClick = (e) => {
    // Call user's onClick first (e.g., haptics)
    if (onClick) {
      onClick(e);
    }

    // Then handle navigation
    if (!e.defaultPrevented && linkHref) {
      e.preventDefault();
      navigate(linkHref);
    }
  };

  return (
    <a href={linkHref} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
