import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    if (typeof title === "string" && title.trim()) {
      document.title = title;
    }
  }, [title]);
}
