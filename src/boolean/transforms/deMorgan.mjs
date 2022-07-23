import { AND, FALSE, NOT, OR, TRUE } from "../consts.mjs";
import { isAnd, isNot, isOr } from "../tests.mjs";

// !(n ...) => (u !...)
// !(u ...) => (n !...)
// !TRUE => FALSE
// !FALSE => TRUE
const deMorgan = (exp) => {
  if (!isNot(exp)) return exp;
  const inner = exp[1];
  if (inner === TRUE) return FALSE;
  if (inner === FALSE) return TRUE;
  const a = isAnd(inner);
  const o = isOr(inner);
  if (!(a || o)) return exp;
  return [a ? OR : AND, ...inner.slice(1).map(a => [NOT, a])];
};

export default deMorgan;
