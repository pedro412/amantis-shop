export default function ProductoLoading() {
  return (
    <>
      <div className="aspect-[4/5] w-full bg-surface-alt" aria-hidden />
      <div className="px-5 pt-5">
        <div className="h-3 w-20 rounded bg-surface-alt" aria-hidden />
        <div className="mt-2 h-7 w-3/4 rounded bg-surface-alt" aria-hidden />
        <div className="mt-3 h-7 w-32 rounded bg-surface-alt" aria-hidden />
        <div className="mt-4 space-y-1.5">
          <div className="h-3 w-full rounded bg-surface-alt" aria-hidden />
          <div className="h-3 w-5/6 rounded bg-surface-alt" aria-hidden />
        </div>
      </div>
      <span className="sr-only">Cargando producto…</span>
    </>
  );
}
