import { createContext } from '@lit/context';
import type { SourcefulDivcordTable } from './data/SourcefulDivcordTableRecord';
import type { CardsFinder } from './data/CardsFinder';

export const divcordTableContext = createContext<SourcefulDivcordTable>(Symbol('divcordTable'));
export const cardsFinderContext = createContext<CardsFinder>(Symbol('cardsFinder'));
