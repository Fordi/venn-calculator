import { AND, FALSE, NOT, OR, TRUE } from './consts.mjs';
import { isExpression } from './tests.mjs';

export const SET = Symbol('set notation');
export const RPN = Symbol('reverse polish notation');
export const LOGIC = Symbol('logic notation');

const stringify = exp => {
  if (typeof exp === 'symbol') {
    return exp.description;
  }
  if (isExpression(exp) && exp.length === 1) {
    return 'Empty set';
  }

  if (!exp[SET]) {
    if (isExpression(exp)) {
      const [operation, ...operands] = exp;
      const value = operation === NOT
        ? (stringify(operation) + stringify(operands[0]))
        : `(${operands.map(stringify).join(stringify(operation))})`;
      Object.defineProperty(exp, SET, { value });
    } else {
      console.error(exp, 'is not a valid expression.');
      process.exit(-1);
    }
  }
  return exp[SET];
};

const rpnMap = {
  [AND]: 'AND',
  [OR]: 'OR',
  [NOT]: 'NOT',
  [TRUE]: 'TRUE',
  [FALSE]: 'FALSE',
};

export const toRpnString = exp => {
  if (typeof exp === 'symbol') {
    return rpnMap[exp] ?? exp.description;
  }
  if (isExpression(exp) && exp.length === 1) {
    return '()';
  }
  if (!exp[RPN]) {
    const [operation, ...operands] = exp;
    const value = operation === NOT
      ? `(${toRpnString(operation)} ${toRpnString(operands[0])})`
      : `(${toRpnString(operation)} ${operands.map(toRpnString).join(' ')})`;
    Object.defineProperty(exp, RPN, { value });
  }
  return exp[RPN];
};

export const toLogicString = exp => {
  if (typeof exp === 'symbol') {
    return rpnMap[exp] ?? exp.description;
  }
  if (isExpression(exp) && exp.length === 1) {
    return '∅';
  }
  if (!exp[LOGIC]) {
    const [operation, ...operands] = exp;
    let value;
    if (operation === NOT) {
      value = `!${toLogicString(operands[0])}`;
    }
    if (operation === AND) {
      value = operands.map(toLogicString).join('');
    }
    if (operation === OR) {
      value = `(${operands.map(toLogicString).join('+')})`;
    }
    Object.defineProperty(exp, LOGIC, { value });
  }
  return exp[LOGIC];
};

export default (exp, mode = SET) => {
  if (mode === SET) {
    return (
      stringify(exp)
        .replace(/∩ !/g, '∖ ')
        .replace(/^\((.*)\)$/g, '$1')
    ) ?? 'Empty Set';
  }
  if (mode === RPN) {
    return toRpnString(exp);
  }
  if (mode === LOGIC) {
    return (
      toLogicString(exp)
        .replace(/^\((.*)\)$/g, '$1')
    );
  }
};