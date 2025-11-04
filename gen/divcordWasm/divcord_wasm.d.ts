/* tslint:disable */
/* eslint-disable */
export function find_cards_by_source_types_strings(types: string, records: string, poe_data: string): string;
export function slug(s: string): string;
export function find_cards_by_source_types(types: any, records: any, poe_data: any): any;
/**
 * Fetch spreadsheet and parse.
 */
export function fetch_divcord_records(poe_data: any, on_error: Function): Promise<any>;
export function slugify(s: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly fetch_divcord_records: (a: any, b: any) => any;
  readonly find_cards_by_source_types: (a: any, b: any, c: any) => any;
  readonly find_cards_by_source_types_strings: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly slug: (a: number, b: number) => [number, number];
  readonly slugify: (a: number, b: number) => [number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly closure217_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure259_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
