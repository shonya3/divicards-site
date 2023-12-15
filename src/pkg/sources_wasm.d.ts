/* tslint:disable */
/* eslint-disable */
/**
* @param {any} divcord_table
* @param {any} poe_data
* @param {Function} toast
* @returns {any}
*/
export function parsed_records(divcord_table: any, poe_data: any, toast: Function): any;
/**
* @param {any} types
* @param {any} records
* @returns {any}
*/
export function find_cards_by_source_types(types: any, records: any): any;
/**
* @param {any} types
* @param {any} records
* @param {any} poe_data
* @returns {any}
*/
export function find_cards_by_source_types_argument(types: any, records: any, poe_data: any): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly parsed_records: (a: number, b: number, c: number, d: number) => void;
  readonly find_cards_by_source_types: (a: number, b: number) => number;
  readonly find_cards_by_source_types_argument: (a: number, b: number, c: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
