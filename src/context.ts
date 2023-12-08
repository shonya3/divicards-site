import { createContext } from '@lit/context';
import type { SourcefulDivcordTable } from './divcord';
import type { CardsFinder } from './CardsFinder';

export const divcordTableContext = createContext<SourcefulDivcordTable>(Symbol('divcordTable'));
export const cardsFinderContext = createContext<CardsFinder>(Symbol('cardsFinder'));
