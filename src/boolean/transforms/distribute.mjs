import { AND, OR } from "../consts.mjs";
import { isAnd, isOr } from "../tests.mjs";
import association from "./association.mjs";

// (∩ (∪ A B C) (∪ E F G)) => (u AE BE CE AF BF CF AG BG CG)
// only do this if the parent node is an OR, and the expression contains ORs
// This helps us associatively collapse the expression
const distribute = (exp, p) => {
  if (!isAnd(exp) || p !== OR || !exp.slice(1).some(isOr)) return exp;
  const ors = exp.slice(1).map(a => isOr(a) ? a : [OR, a]);
  let work = ors.shift();
  const crossProduct = (exprs1, exprs2) => {
    const product = [];
    for (let pi = 1; pi < exprs1.length; pi++) {
      for (let qi = 1; qi < exprs2.length; qi++) {
        const res = association([AND, exprs1[pi], exprs2[qi]]);
        product.push(res);
      }
    }
    return product;
  };
  while (ors.length) {
    work = [OR, ...crossProduct(work, ors.shift())];
  }
  return work;
};

export default distribute;
