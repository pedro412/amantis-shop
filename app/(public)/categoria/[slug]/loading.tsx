export default function CategoriaLoading() {
  return (
    <>
      {/* Mirror the listing header height so layout doesn't jump. */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-surface-alt" aria-hidden />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-16 rounded bg-surface-alt" aria-hidden />
          <div className="h-5 w-40 rounded bg-surface-alt" aria-hidden />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-3 pt-1">
        <div className="h-10 w-24 rounded-full bg-surface-alt" aria-hidden />
        <div className="h-10 w-44 rounded-full bg-surface-alt" aria-hidden />
      </div>

      <ul className="grid grid-cols-2 gap-x-3.5 gap-y-6 px-4 pt-3" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <div className="aspect-[3/4] w-full rounded-lg bg-surface-alt" />
            <div className="mt-2 h-3.5 w-3/4 rounded bg-surface-alt" />
            <div className="mt-1.5 h-3 w-1/3 rounded bg-surface-alt" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Cargando productos…</span>
    </>
  );
}
