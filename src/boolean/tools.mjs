import { AND, FALSE, KEYWORDS, NOT, OR, TRUE } from "./consts.mjs";
import { areEqual, isExpression, isNot, isSymbol } from "./tests.mjs";

export const findCommon = (...exps) => {
  const nExps = exps.length;
  //Different operations or non-expression; return nothing.
  if (nExps < 2 || exps.some((e) => !isExpression(e) || e[0] !== exps[0][0])) {
    return {};
  }
  const terms = [];
  exps.forEach((exp, ei) => {
    exp.slice(1).forEach((t) => {
      const haveCommon = terms.some((item) => {
        if (areEqual(t, item[0])) {
          item[1].push(ei);
          return true;
        }
        return false;
      });
      if (!haveCommon) {
        terms.push([t, [ei]]);
      }
    });
  });
  const common = terms.filter((t) => t[1].length === nExps).map(([T]) => T);
  const unique = terms.reduce((r, [T, where]) => {
    if (where.length === nExps) return r;
    where.forEach((ei) => {
      r[ei].push(T);
    });
    return r;
  }, exps.map(() => []));

  // No common values.
  if (!common.length) return {};
  // Return as subexpressions
  return {
    common,
    unique
  };
};

export const without = (exp, sub) => [exp[0], ...exp.slice(1).filter(se => !areEqual(se, sub))];

const terms = {};

// Create the symbol
export const term = name => {
  if (isSymbol(name)) {
    name = name.description;
  }
  if (!terms[name]) {
    terms[name] = {
      term: Symbol(name),
      index: Object.keys(terms).length,
    };
  }
  return terms[name].term;
};

export const order = (t, p) => {
  if (isSymbol(t) || typeof t === 'string') {
    return terms[term(t).description].index * 2;
  }
  if (isNot(t)) return order(t[1]) + 1;
  return (Object.keys(terms).length * (p === t[0] ? 2 : 4)) + t.slice(1).reduce((s, p) => s + order(p), 0);
};

export const sortExpr = (exp) => {
  if (isNot(exp) || isSymbol(exp)) return exp;
  const [p, ...subs] = exp;
  const exprs = subs.sort((a, b) => order(a, p) - order(b, p)).map(s => sortExpr(s));
  // Rewrite the expression
  if (exprs.some((a) => !isNot(a))) {
    while (isNot(exprs[0])) {
      // Rotate until the first arg is not a NOT.
      // This is so !ABC can be written with SET notation's `\`, e.g.,
      // !ABC -> BC!A -> B n C \ A.
      // !A!BC -> C \ A \ B
      // What happens if they're all nots?  You get a leading not, that's all,
      // e.g., !A!B!C -> !A \ B \ C
      // This is technically an empty set, though.
      exprs.push(exprs.shift());
    }
    return [p, ...exprs];
  }
  return exp;
};

export const invert = (expression) => {
  if (isNot(expression)) return expression[1];
  if (expression === TRUE) return FALSE;
  if (expression === FALSE) return TRUE;
  return [NOT, expression];
};

export const symbolize = (expression) => {
  if (typeof expression === 'string') return KEYWORDS[expression] ?? term(expression);
  if (isSymbol(expression)) return expression;
  if (Array.isArray(expression)) return expression.map(t => symbolize(t));
  throw new Error(`Invalid expression: ${expression.toString()}`);
};

export const getSymbols = (expression) => {
  const result = new Set();
  const addExpression = (exp) => {
    if (isSymbol(exp)) {
      if (exp === AND || exp === OR || exp === NOT || exp === TRUE || exp === FALSE) {
        return;
      }
      result.add(exp);
      return;
    }
    exp.forEach(e => addExpression(e));
  };
  addExpression(symbolize(expression));
  return Array.from(result);
};

export const interpret = (expression) => {
  if (expression === TRUE) return () => true;
  if (expression === FALSE) return () => false;
  if (isSymbol(expression) && !KEYWORDS[expression]) {
    return (props) => props[expression.description];
  }
  if (isExpression(expression)) {
    if (expression[0] === OR) {
      const int = expression.slice(1).map(interpret);
      return (props) => int.reduce((s, t) => s || t(props), false);
    }
    if (expression[0] === AND) {
      const int = expression.slice(1).map(interpret);
      return (props) => int.reduce((s, t) => s && t(props), true);
    }
    const int = interpret(expression[1]);
    return (props) => !int(props);
}
  if (Array.isArray(expression)) {
    throw new Error(`Unknown operator: ${expression[0].toString()}`);
  }
  throw new Error(`Invalid expression: ${expression.toString()}`);
};