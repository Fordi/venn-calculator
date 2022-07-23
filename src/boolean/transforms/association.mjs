import { AND, OR } from "../consts.mjs";
import { isExpression, isNot, isSymbol } from "../tests.mjs";
import { invert } from "../tools.mjs";

// https://en.wikipedia.org/wiki/Boolean_algebra#Monotone_laws
// (∪ (∪ P Q) R) => (∪ P Q R)
// (∩ (∩ P Q) R) => (∩ P Q R)
// (∪ !(n P Q) R) => (∪ P Q R)
// (n !(u P Q) R) => (u P Q R)
const association = (exp) => {
  if (isNot(exp) || isSymbol(exp)) return exp;
  const [op, ...exprs] = exp;
  const nop = op === AND ? OR : AND;
  const res = [op];
  exprs.forEach((se) => {
    if (isNot(se) && isExpression(se[1]) && se[1][0] === nop) {
      res.push(...se[1].slice(1).map(invert));
      return;
    }
    if (se[0] === op) {
      res.push(...se.slice(1));
      return;
    } 
    res.push(se);
  });
  return res;
};

export default association;
