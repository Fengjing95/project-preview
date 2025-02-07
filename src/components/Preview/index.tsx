import { forwardRef } from 'react';

interface PreviewProps {
  url?: string;
}

export const Preview = forwardRef<HTMLIFrameElement, PreviewProps>((_, ref) => {
  return (
    <div className="h-full w-full">
      <iframe
        ref={ref}
        className="h-full w-full"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
});