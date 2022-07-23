import { NOT } from "../consts.mjs";
import { areEqual, contains, isAnd, isOr } from "../tests.mjs";
import { without } from "../tools.mjs";
import involution from "./involution.mjs";

// (u (n P Q) (n P !R) (n Q R) ...) => (u (n P !R) (n Q R) ...)

const testConsensus = (...args) => {
  const terms = [];
  let nots = 0;
  args.forEach(e => {
    e.slice(1).forEach(x => {
      if (!terms.some(a => {
        const neg = areEqual(a, involution([NOT, x]));
        if (neg) nots++;
        return areEqual(a, x) || neg;
      })) {
        terms.push(x);
      }
    });
  });
  if (nots !== 1) return [];
  if (terms.length !== 3) return [];
  // Locate the inverted term...
  const inv = terms.find(t => args.find(e => contains(e, involution([NOT, t]))));
  // Return the arg without the inverted term; that's the one that can be dropped.
  return args.find(a => !contains(a, inv) && !contains(a, involution([NOT, inv])));
};

const consensus = (exp) => {
  if (!isOr(exp)) return exp;
  let work = exp;
  const ands = exp.slice(1).filter(isAnd).filter(a => a.length === 3);
  if (ands.length < 3) return exp;

  for (let i = 0; i < ands.length - 2; i++) {
    for (let j = i + 1; j < ands.length - 1; j++) {
      for (let k = j + 1; k < ands.length; k++) {
        const remove = testConsensus(ands[i], ands[j], ands[k]);
        if (remove) {
          work = without(work, remove);
        }
      }
    }
  }
  return work;
};

export default consensus;
