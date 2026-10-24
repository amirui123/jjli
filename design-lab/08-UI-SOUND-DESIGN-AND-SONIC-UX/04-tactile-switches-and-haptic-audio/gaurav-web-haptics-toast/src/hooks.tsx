import React from 'react';

export const useIsDocumentHidden = () => {
  // Guard for SSR: `document` doesn't exist on the server.
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(
    () => typeof document !== 'undefined' && document.hidden,
  );

  React.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', callback);
    return () => document.removeEventListener('visibilitychange', callback);
  }, []);

  return isDocumentHidden;
};
