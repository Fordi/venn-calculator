import { AND, OR, NOT } from './consts.mjs';
import { invert } from './tools.mjs';
import involution from './transforms/involution.mjs';

const OPERATORS = { [AND]: AND, [OR]: OR, [NOT]: NOT };

// If an expression is an expression.  That is, it's an array with the first item being
//  an operator.
export const isExpression = exp => Array.isArray(exp) && !!OPERATORS[exp[0]];
export const isOr = exp => isExpression(exp) && exp[0] === OR;
export const isAnd = exp => isExpression(exp) && exp[0] === AND;
export const isNot = exp => isExpression(exp) && exp[0] === NOT;
export const isSymbol = exp => typeof exp === 'symbol';

// Whether `expression` contains `subexpression`
export const contains = (expression, subexpression) => (
  expression.slice(1).some(se => areEqual(se, subexpression))
);

export const areEqual = (e1, e2) => {
  // Always treat !!EXP as EXP
  [e1, e2] = [e1, e2].map(e => involution(e));
  // If either are falsy, they're inequal (for our purposes)
  if (!e1 || !e2) return false;
  // Fastest end: if they're the same object, they're equal
  if (e1 === e2) return true;
  // If either is a symbol, but they're not the same object, they're inequal.
  if (isSymbol(e1) || isSymbol(e2)) return false;
  // If they're expressions of different lengths, they're inequal
  if (e1.length !== e2.length) return false;
  // If any subpart is inequal, they're inequal.
  if (e1.some((p, i) => !areEqual(e2[i], p))) return false;
  // If all checks pass, they're equal.
  return true;
};

// Whether the expression contains two terms that are complements of one another.
export const hasComplement = (expression) => {
  for (let p = 1; p < (expression.length - 1); p++) {
    const P = expression[p];
    for (let q = p + 1; q < expression.length; q++) {
      const Q = expression[q];
      const notQ = invert(Q);
      if (areEqual(P, notQ)) return true;
    }
  }
  return false;
};

// Expression contains one or more OR operation
export const hasOr = (expression) => expression.slice(1).some(isOr);
// Expression contains one or more AND operation
export const hasAnd = (expression) => expression.slice(1).some(isAnd);
