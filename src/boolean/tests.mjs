import { AND, OR, NOT } from './consts.mjs';
import involution from './transforms/involution.mjs';

export const isExpression = exp => Array.isArray(exp);
export const isOr = exp => isExpression(exp) && exp[0] === OR;
export const isAnd = exp => isExpression(exp) && exp[0] === AND;
export const isNot = exp => isExpression(exp) && exp[0] === NOT;
export const isSymbol = exp => typeof exp === 'symbol';

export const contains = (exp, sub) => exp.slice(1).some(se => areEqual(se, sub));

export const areEqual = (e1, e2) => {
  // If either are falsy, they're inequal (for our purposes)
  if (!e1 || !e2) return false;
  // Fastest end: if they're the same object, they're equal
  if (e1 === e2) return true;
  // If either is a symbol, but they're not the same object, they're inequal.
  if (isSymbol(e1) || isSymbol(e2)) return false;
  // If they're expressions of different lengths, they're inequal
  if (e1.length !== e2.length) return false;
  // Recursively sort
  // If any subpart is inequal, they're inequal.
  if (e1.some((p, i) => !areEqual(e2[i], p))) return false;
  // If all checks pass, they're equal.
  return true;
};

export const hasComplement = (exp) => {
  for (let p = 1; p < (exp.length - 1); p++) {
    const P = exp[p];
    for (let q = p + 1; q < exp.length; q++) {
      const Q = exp[q];
      const notQ = involution([NOT, Q]);
      if (areEqual(P, notQ)) return true;
    }
  }
  return false;
};

export const hasOr = (exp) => exp.slice(1).some(isOr);
export const hasAnd = (exp) => exp.slice(1).some(isAnd);
