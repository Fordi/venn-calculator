import { areEqual, isExpression, isSymbol } from "./tests.mjs";
import { sortExpr } from "./tools.mjs";
import toString from "./toString.mjs";
import transforms from './transforms/index.mjs';

// Turn on for debugging...
const LOG = false;
let depth = 0;

const simpSubs = exp => {
  if (!isExpression(exp)) return exp;
  depth += 1;
  const r = [exp[0], ...exp.slice(1).map(se => simplify(se, exp[0]))];
  depth -= 1;
  return r;
};

const indent = () => new Array(depth + 1).join('  ');

const pass = (exp, p = null) => {
  if (isSymbol(exp)) return exp;
  exp = sortExpr(simpSubs(exp));
  const names = Object.keys(transforms);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const r = transforms[name](exp, p);
    if (!areEqual(exp, r)) {
      if (LOG) {
        console.log(`${indent()}${name}: ${toString(exp)} -> ${toString(r)}`);
      }
      return sortExpr(simpSubs(r));
    }
  }
  return exp;
};

export const simplify = (exp, p = null) => {
  if (isSymbol(exp)) return exp;
  if (isExpression(exp) && exp.length === 1) return exp;
  let next;
  while (!areEqual(next, exp)) {
    exp = next ?? exp;
    next = pass(exp, p);
  }
  return next;
};
