import { isNot } from "../tests.mjs";

// !!P => P; !!!!P => P; etc.
const involution = (exp) => {
  while (isNot(exp) && isNot(exp[1])) {
    exp = exp[1][1];
  }
  return exp;
};

export default involution;
