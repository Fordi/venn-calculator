import { NOT } from "../consts.mjs";
import { contains, isAnd, isOr } from "../tests.mjs";
import { without } from "../tools.mjs";
import unwrap from "./unwrap.mjs";

// (∪ P (∩ P Q) ...) <=> (∪ P ...)
// (∪ (∩ !P Q) P) <=> (∪ P Q)
// (∪ (∩ P Q) !P) <=> (∪ !P Q)
const absorption = (exp) => {
  if (!isOr(exp)) return exp;
  let work = exp;
  for (let pi = 1; pi < work.length; pi++) {
    const P = work[pi];
    if (!isAnd(P)) continue;
    for (let qi = 1; qi < work.length; qi++) {
      if (qi === pi) continue;
      const Q = work[qi];
      if (contains(P, Q)) {
        work = without(work, P);
      } else if (contains(P, [NOT, Q])) {
        work = [...work];
        work[pi] = unwrap(without(P, [NOT, Q]));
      }
    }
  }
  return work;
};

export default absorption;
