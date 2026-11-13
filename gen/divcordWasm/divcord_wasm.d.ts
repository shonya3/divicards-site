/* tslint:disable */
/* eslint-disable */

/**
 * Fetch spreadsheet and parse.
 */
export function fetch_divcord_records(poe_data: any, on_error: Function): Promise<any>;

export function find_cards_by_source_types(types: any, records: any, poe_data: any): any;

export function find_cards_by_source_types_strings(types: string, records: string, poe_data: string): string;

export function slug(s: string): string;

export function slugify(s: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly fetch_divcord_records: (a: any, b: any) => any;
    readonly find_cards_by_source_types: (a: any, b: any, c: any) => any;
    readonly find_cards_by_source_types_strings: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly slug: (a: number, b: number) => [number, number];
    readonly slugify: (a: number, b: number) => [number, number];
    readonly wasm_bindgen_ca4176edc5d4a10a___convert__closures_____invoke___wasm_bindgen_ca4176edc5d4a10a___JsValue__core_6c1206e26a8948b0___result__Result_____wasm_bindgen_ca4176edc5d4a10a___JsError___true_: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen_ca4176edc5d4a10a___convert__closures_____invoke___js_sys_c599e39dad3be57___Function_fn_wasm_bindgen_ca4176edc5d4a10a___JsValue_____wasm_bindgen_ca4176edc5d4a10a___sys__Undefined___js_sys_c599e39dad3be57___Function_fn_wasm_bindgen_ca4176edc5d4a10a___JsValue_____wasm_bindgen_ca4176edc5d4a10a___sys__Undefined_______true_: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen_ca4176edc5d4a10a___convert__closures_____invoke_______true_: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
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
