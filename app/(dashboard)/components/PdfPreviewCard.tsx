"use client";
import React from "react";

type Props = {
  file: any;
  onPreview: () => void;
};

export default function PdfPreviewCard({ file, onPreview }: Props) {
  const { name: filename = "Document.pdf", previewUrl, pageCount = 1 } = file;

  // Cloudinary page preview helper (if you want to show a small stacked preview)
  const renderStackPreview = () => {
    const pagesToShow = Math.min(pageCount, 3);
    const imgs: React.ReactElement[] = [];
    for (let i = 1; i <= pagesToShow; i++) {
      // If you don't have pre-generated derived images per page, you can generate by
      // replacing pg_1 with pg_{i} in the previewUrl (Cloudinary supports pg_i)
      const pageImg = previewUrl
        ? previewUrl.replace(/pg_1/, `pg_${i}`).replace(/_pg_1/, `_pg_${i}`) // attempt safe replace
        : null;
      imgs.push(
        <img
          key={i}
          src={pageImg || previewUrl}
          alt={`${filename} page ${i}`}
          className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm"
          style={{ transform: `translate(${(i - 1) * 6}px, ${(i - 1) * 4}px)`, zIndex: 10 - i }}
          loading="lazy"
        />
      );
    }
    return <div className="relative w-32 h-40">{imgs}</div>;
  };

  return (
      <div
        className="flex items-center gap-4 cursor-pointer"
        role="button"
        onClick={onPreview}
        onKeyDown={(e) => e.key === "Enter" && onPreview()}
        tabIndex={0}
      >
        {previewUrl ? (
          <div className="relative">
            {renderStackPreview()}
            {pageCount > 1 && (
              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {pageCount} pages
              </span>
            )}
          </div>
        ) : (
          <div className="w-32 h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
            <svg /* pdf icon */ width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg>
          </div>
        )}

        <div>
          <div className="text-sm font-semibold truncate max-w-[18rem] dark:text-gray-100">{filename}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Click to preview</div>
        </div>
      </div>
  );
}