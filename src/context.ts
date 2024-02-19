import { createContext } from '@lit/context';
import type { SourcefulDivcordTable } from './divcord';

export const divcordTableContext = createContext<SourcefulDivcordTable>(Symbol('divcordTable'));
