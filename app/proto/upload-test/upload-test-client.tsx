'use client';

import { useState } from 'react';

import { ImageUpload } from '@/components/admin/image-upload';
import { imagePublicUrls } from '@/lib/image-url';

export function UploadTestClient() {
  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [productKey, setProductKey] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <ImageUpload
          namespace="categories"
          value={categoryKey}
          onChange={setCategoryKey}
          label="Imagen de categoría"
        />
        <Variants keyBase={categoryKey} />
      </section>

      <section>
        <ImageUpload
          namespace="products"
          value={productKey}
          onChange={setProductKey}
          label="Imagen de producto"
          hint="Toma o elige una foto"
        />
        <Variants keyBase={productKey} />
      </section>
    </div>
  );
}

function Variants({ keyBase }: { keyBase: string | null }) {
  if (!keyBase) return null;
  const urls = imagePublicUrls(keyBase);
  return (
    <div className="mt-3 space-y-1.5 rounded-md border border-border bg-surface p-3 font-sans text-[11px] text-fg-muted">
      <p className="font-medium text-fg">keyBase: <code className="text-primary">{keyBase}</code></p>
      {Object.entries(urls).map(([variant, url]) => (
        <p key={variant} className="break-all">
          <span className="font-medium text-fg">{variant}:</span>{' '}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {url}
          </a>
        </p>
      ))}
    </div>
  );
}
