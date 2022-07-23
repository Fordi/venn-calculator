import { NOT } from "./consts.mjs";
import { areEqual, isExpression, isNot, isSymbol } from "./tests.mjs";

export const findCommon = (exp1, exp2) => {
  if (!isExpression(exp1) || !isExpression(exp2) || exp1[0] !== exp2[0]) {
    //Different operations or non-expression; return nothing.
    return {};
  }
  const P = [exp1[0]];
  let Q = exp1;
  let R = exp2;
  for (let p = 1; p < exp1.length; p++) {
    for (let q = 1; q < exp2.length; q++) {
      if (areEqual(exp1[p], exp2[q])) {
        P.push(exp1[p]);
        Q = without(Q, exp1[p]);
        R = without(R, exp2[q]);
      }
    }
  }
  // No common values.
  if (!P.length) return {};
  // Return as subexpressions
  return {
    common: P.length > 2 ? P : P[1],
    left: Q.length > 2 ? Q : Q[1],
    right: R.length > 2 ? R : R[1],
  };
};

export const without = (exp, sub) => [exp[0], ...exp.slice(1).filter(se => !areEqual(se, sub))];

const terms = {};

// Create the symbol
export const term = name => {
  if (isSymbol(name)) {
    name = name.description;
  }
  if (!terms[name]) {
    terms[name] = {
      term: Symbol(name),
      index: Object.keys(terms).length,
    };
  }
  return terms[name].term;
};

export const order = (t, p) => {
  if (isSymbol(t) || typeof t === 'string') {
    return terms[term(t).description].index * 2;
  }
  if (isNot(t)) return order(t[1]) + 1;
  return (Object.keys(terms).length * (p === t[0] ? 2 : 4)) + t.slice(1).reduce((s, p) => s + order(p), 0);
};

export const sortExpr = (exp) => {
  if (isNot(exp) || isSymbol(exp)) return exp;
  const [p, ...subs] = exp;
  const exprs = subs.sort((a, b) => order(a, p) - order(b, p)).map(s => sortExpr(s));
  // Rewrite the expression
  if (!exprs.some((a) => !isNot(a))) {
    return exp;
  } else while (isNot(exprs[0])) {
    // Rotate until the first arg is not a NOT.
    exprs.push(exprs.shift());
  }
  return [p, ...exprs];
};

export const invert = (expression) => {
  if (isNot(expression)) return expression[1];
  return [NOT, expression];
};
