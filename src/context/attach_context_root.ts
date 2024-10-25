/**
 * Import as effectful module inside each context before context creation.
 * ## Example
 * ```js
 *   // 'divcord-provider.ts'
 *   import './attach_context_root'
 *   // then create a context
 * ```
 */

import { ContextRoot } from '@lit/context';

export const context_root = new ContextRoot();

let attached = false;
if (!attached) {
	context_root.attach(document.body);
	attached = true;
}
