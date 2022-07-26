import { AND, OR, isAnd, invert, term } from '@fordi-org/bsimp';

// Find all the possible combinations of `set` with `count` members
const group = (count, set) => {
  if (count === 1) return set;
  if (count <= 0) return [];
  if (count > set.length) return [];
  if (count === set.length) return [set.length === 1 ? set[0] : [AND, ...set]];
  const [firstTerm, ...rest] = set;
  return [
    ...group(count - 1, rest).map((t) => isAnd(t) ? [AND, firstTerm, ...t.slice(1)] : [AND, firstTerm, t]),
    ...group(count, rest),
  ];
};

// Find all the possible exclusive regions for `set`
// Note: for sets of 4, this will return two regions that are not
//   visually representable in 2D: A C \ B \ D and B D \ A \ C
//   it gets worse as the set increases in number.
const getRegions = (...set) => {
  return set.reduce((all, _, index) => {
    return [...all, ...group(index + 1, set)];
  }, []).map((g) => {
    const own = isAnd(g) ? g.slice(1) : [g];
    const notOthers = set.filter((t) => own.indexOf(t) === -1).map(invert);
    return [AND, ...own, ...notOthers];
  })
};

export const A = term('A');
export const B = term('B');
export const C = term('C');

const rawRegions = getRegions(A, B, C);

// The list of regions in top-down order (so they're easier to represent as a Venn diagram)
export const REGIONS = [
  rawRegions[0], // A \ B \ C
  rawRegions[3], // A n B \ C
  rawRegions[1], // B \ A \ C
  rawRegions[4], // A n C \ B
  rawRegions[6], // A n B n C
  rawRegions[5], // B n C \ A
  rawRegions[2], // C \ A \ B
];

const getFormula = n => [OR, ...REGIONS.filter((_, bitNo) => ((n >> bitNo) & 1) !== 0)];

export default getFormula;
