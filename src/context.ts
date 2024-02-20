import { createContext } from '@lit/context';
import type { DivcordTable } from './divcord';

export const divcordTableContext = createContext<DivcordTable>(Symbol('divcordTable'));
