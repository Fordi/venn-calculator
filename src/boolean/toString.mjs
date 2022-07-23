import { AND, FALSE, NOT, OR, TRUE } from './consts.mjs';
import { isExpression } from './tests.mjs';

export const SET = Symbol('set notation');
export const RPN = Symbol('reverse polish notation');
export const LOGIC = Symbol('logic notation');
export const SOURCE = Symbol('pasteable');

let defaultNotation = SET;

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

export const toRpnString = exp => {
  if (typeof exp === 'symbol') {
    return exp.description;
  }
  if (isExpression(exp) && exp.length === 1) {
    return '()';
  }
  if (!exp[RPN]) {
    const [operation, ...operands] = exp;
    const value = operation === NOT
      ? `${toRpnString(operation)}${toRpnString(operands[0])}`
      : `(${toRpnString(operation).trim()} ${operands.map(toRpnString).join(' ')})`;
    Object.defineProperty(exp, RPN, { value });
  }
  return exp[RPN];
};

export const toLogicString = exp => {
  if (exp === TRUE) return '1';
  if (exp === FALSE) return '0';
  if (typeof exp === 'symbol') {
    return exp.description;
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

const srcMap = {
  [AND]: 'AND',
  [OR]: 'OR',
  [NOT]: 'NOT',
  [TRUE]: 'TRUE',
  [FALSE]: 'FALSE',
};

export const toSource = (exp) => {
  if (typeof exp === 'symbol') {
    return srcMap[exp] ?? exp.description;
  }
  if (isExpression(exp) && exp.length === 1) {
    return 'undefined';
  }
  if (!exp[SOURCE]) {
    Object.defineProperty(exp, SOURCE, {
      value: `[${exp.map(toSource).join(', ')}]`
    });
  }
  return exp[SOURCE];
};

const toString = (exp, mode) => {
  const m = mode ?? defaultNotation;
  if (m === SET) {
    return (
      stringify(exp)
        .replace(/∩ !/g, '∖ ')
        .replace(/^\((.*)\)$/g, '$1')
    ) ?? 'Empty Set';
  }
  if (m === RPN) {
    return toRpnString(exp);
  }
  if (m === LOGIC) {
    return (
      toLogicString(exp)
        .replace(/^\((.*)\)$/g, '$1')
    );
  }
  if (m === SOURCE) {
    return toSource(exp);
  }
};

export const setNotation = (v) => {
  defaultNotation = v;
};

Object.assign(toString, {
  setNotation,
  SET,
  RPN,
  LOGIC,
  SOURCE,
});

export default toString;