const categoryStyles = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-red-50 text-red-600 ring-red-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function EtiquetaCategoria({ category }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${categoryStyles[category.color] ?? categoryStyles.slate}`}
    >
      {category.name}
    </span>
  );
}
