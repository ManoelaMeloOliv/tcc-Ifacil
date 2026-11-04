const estilosCategoria = {
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-700",
  slate: "bg-slate-100 text-slate-600",
};

export function EtiquetaCategoria({ categoria }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${estilosCategoria[categoria.cor] ?? estilosCategoria.slate}`}
    >
      {categoria.nome}
    </span>
  );
}
