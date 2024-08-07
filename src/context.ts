import { createContext } from '@lit/context';
import type { DivcordTable } from './DivcordTable';

export const divcordTableContext = createContext<DivcordTable>(Symbol('divcordTable'));
export const activeCardContext = createContext<string | null>(Symbol('active-card'));
