type PolicyContentProps = {
  title: string;
  body: string | null;
  fallback: string;
};

export function PolicyContent({ title, body, fallback }: PolicyContentProps) {
  const text = body?.trim() || fallback;
  return (
    <article className="prose-store mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display mb-8 text-4xl tracking-tight">{title}</h1>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{text}</div>
    </article>
  );
}
