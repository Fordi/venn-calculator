import { AND, OR } from './boolean/consts.mjs';
import { invert, term } from './boolean/tools.mjs';

const A = term('A');
const B = term('B');
const C = term('C');

const _A = invert(A);
const _B = invert(B);
const _C = invert(C);

// Reverse polish notation, since that's easier to code around.
const REGIONS = [
  [AND, A, _B, _C], // A \ B \ C
  [AND, A, B, _C],  // A n B \ C
  [AND, B, _A, _C], // B \ A \ C
  [AND, A, C, _B],  // A n C \ B
  [AND, A, B, C],   // A n B n C
  [AND, B, C, _A],  // B n C \ A
  [AND, C, _A, _B], // C \ A \ B
];

const getFormula = n => [OR, ...REGIONS.filter((_, bitNo) => ((n >> bitNo) & 1) !== 0)];

export default getFormula;
