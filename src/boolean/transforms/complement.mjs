import { FALSE, TRUE } from "../consts.mjs";
import { hasComplement, isAnd, isNot, isOr, isSymbol } from "../tests.mjs";

// https://en.wikipedia.org/wiki/Boolean_algebra#Nonmonotone_laws (complementation)
// (∪ P !P ...) => TRUE
// (∩ P !P ...) => FALSE
const complement = (exp) => {
  if (isNot(exp) || isSymbol(exp) || !hasComplement(exp)) return exp;
  if (isAnd(exp)) return FALSE;
  if (isOr(exp)) return TRUE;
  // other logic ops?
  return exp;
};

export default complement;
