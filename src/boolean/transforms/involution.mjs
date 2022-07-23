import { isNot } from "../tests.mjs";

// !!P => P
const involution = (exp) => {
  if (isNot(exp) && isNot(exp[1])) {
    return exp[1][1];
  }
  return exp;
};

export default involution;
