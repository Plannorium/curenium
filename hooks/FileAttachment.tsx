"use client";

import { Download, ExternalLink, Eye, Copy } from "lucide-react";
import { Button } from '@/components/ui/button';

interface FileAttachmentProps {
  file: any;
  onPreview: () => void;
  onOpenLightbox?: (url: string) => void;
}

const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileAttachment = ({
  file,
  onPreview,
  onOpenLightbox,
}: FileAttachmentProps) => {
  const isImage = file.resource_type?.startsWith?.("image") ||
                  file.type?.startsWith?.("image") ||
                  /\.(jpe?g|png|webp|gif)$/i.test(file.url);

  // Image → inline preview (handled in MessageBubble)
  if (isImage) return null;

  const name = file.name ?? file.url?.split("/").pop() ?? "File";
  const size = formatFileSize(file.size);

  return (
    <div className="group relative p-4 rounded-lg bg-background/50 border border-border/50 max-w-xs sm:max-w-sm w-full overflow-hidden">
      <div className="relative flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="lucide lucide-file w-8 h-8 text-gray-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>

        <div className="flex-1 min-w-0">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm truncate block hover:underline"
          >
            {name}
          </a>
          <p className="text-xs text-muted-foreground">{size}</p>

          <div className="mt-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onPreview}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                const a = document.createElement("a");
                a.href = file.url;
                a.download = name;
                a.click();
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Hover actions – copy link & open in new tab */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(file.url);
          }}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => window.open(file.url, "_blank")}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};