"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Catalog } from "@/lib/domain/types";
import { indexLots, type LotIndex } from "@/lib/domain/coffee";

type Ctx = Catalog & { idx: LotIndex };
const C = createContext<Ctx | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  const value = useMemo(() => ({ ...catalog, idx: indexLots(catalog.green) }), [catalog]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useCatalog() {
  const v = useContext(C);
  if (!v) throw new Error("useCatalog outside CatalogProvider");
  return v;
}
