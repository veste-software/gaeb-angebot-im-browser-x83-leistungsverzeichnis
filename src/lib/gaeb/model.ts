export interface Item {
  kind: 'item';
  id: string;
  oz: string;
  shortText: string;
  longText: string;
  qty: number;
  qu: string;
  /** Bedarfsposition without total (does not count into the sums). */
  withoutTotal: boolean;
  /** Alternative (Wahl-) position: priced, but not part of the base total. */
  alternative: boolean;
  /** Item is marked not applicable. */
  notAppl: boolean;
  /** EP in cents if the file already carries one (X84). */
  up: number | null;
}

export interface Category {
  kind: 'cat';
  id: string;
  oz: string;
  label: string;
  children: Array<Category | Item>;
}

export interface Lv {
  /** "3.1" | "3.2" | "3.3" (as far as it could be told) */
  version: string;
  phase: number;
  namespace: string;
  projectName: string;
  projectLabel: string;
  owner: string;
  currency: string;
  boqId: string;
  nodes: Array<Category | Item>;
  items: Item[];
  categories: Category[];
}
