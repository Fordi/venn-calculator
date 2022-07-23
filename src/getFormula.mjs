import { AND, OR, NOT } from './boolean/consts.mjs';
import { simplify } from './boolean/simplify.mjs';
import { term } from './boolean/tools.mjs';
import toString, { SET } from './boolean/toString.mjs';

const A = term('A');
const B = term('B');
const C = term('C');

const NOT_A = [NOT, A];
const NOT_B = [NOT, B];
const NOT_C = [NOT, C];

// Reverse polish notation, since that's easier to code around.
const REGIONS = [
  [AND, A, NOT_B, NOT_C], // A \ B \ C
  [AND, A, B, NOT_C],     // A n B \ C
  [AND, B, NOT_A, NOT_C], // B \ A \ C
  [AND, A, C, NOT_B],     // A n C \ B
  [AND, A, B, C],         // A n B n C
  [AND, B, C, NOT_A],     // B n C \ A
  [AND, C, NOT_A, NOT_B], // C \ A \ B
];

const getFormula = (n, t = SET) => toString(simplify(
  [OR, ...REGIONS.filter((_, bitNo) => ((n >> bitNo) & 1) !== 0)]
), t);

export default getFormula;
