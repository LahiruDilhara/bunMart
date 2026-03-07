import { useState, useEffect } from "react";
import { getProductImage } from "@/service/productService";

function toDataUrl(base64: string): string {
  if (base64.startsWith("data:")) return base64;
  return `data:image/jpeg;base64,${base64}`;
}

export function ProductImage({
  productId,
  hasImage,
  alt,
  className,
}: {
  productId: string;
  hasImage: boolean;
  alt: string;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasImage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getProductImage(productId).then((res) => {
      if (cancelled) return;
      setDataUrl(res ? toDataUrl(res.imageBase64) : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [productId, hasImage]);

  if (!hasImage || loading) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          background: "var(--stone-200, #e7e5e4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <span className="material-symbols-outlined text-stone-400 animate-spin">progress_activity</span>
        ) : (
          <span className="material-symbols-outlined text-stone-400 text-4xl">bakery_dining</span>
        )}
      </div>
    );
  }

  if (dataUrl) {
    return <img src={dataUrl} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <div
      className={className}
      aria-hidden
      style={{
        background: "var(--stone-200, #e7e5e4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span className="material-symbols-outlined text-stone-400 text-4xl">bakery_dining</span>
    </div>
  );
}
