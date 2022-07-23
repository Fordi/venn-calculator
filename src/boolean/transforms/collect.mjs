

import { AND, OR } from "../consts.mjs";
import { areEqual, hasComplement, isAnd, isOr } from "../tests.mjs";
import { findCommon, without } from "../tools.mjs";
import absorption from "./absorption.mjs";

// (∪ (∩ P Q) (∩ P R)) => (∩ P (∪ Q R))
// Do this only if this is an OR and the parent is an AND
const collect = (exp, p) => {
  if (!(isOr(exp) && p !== OR)) return exp;
  const ands = exp.slice(1).filter(isAnd);
  if (ands.length < 2) return exp;
  for (let pi = 0; pi < ands.length - 1; pi++) {
    for (let qi = pi + 1; qi < ands.length; qi++) {
      const { common, left, right } = findCommon(ands[pi], ands[qi]);
      if (!common) continue;
      const others = without(without(exp, ands[pi]), ands[qi]);
      // It's possible that left and right are each other's complements
      const uQR = [OR, left, right];
      // No advantage; try the next pair.
      if (!(
        others.length === 1
        || hasComplement(uQR)
        || !areEqual(uQR, absorption(uQR))
      )) continue;
      const group = [AND, common, uQR];
      if (others.length > 1) {
        return [...others, group];
      }
      return group;
    }
  }
  return exp;
};

export default collect;
