/* globals expect */

import peg from 'pegjs';
import { readFile } from 'fs/promises';

const parser = peg.generate(
  await readFile(
    new URL('../src/boolGrammar.pegjs', import.meta.url).pathname,
    'utf-8'
  )
);

const region_0x03 = ['OR', ['AND', 'A', 'B', 'C'], ['AND', 'A', ['NOT', 'B'], ['NOT', 'C']]];

describe('parse', () => {
  it('parses terse logical grammar', () => {
    expect(parser.parse('ABC+A!B!C')).toEqual(region_0x03);
  });
  it('parses infix grammar with mixed programming symbols', () => {
    expect(parser.parse('A & B && C || A * !B * ~C')).toEqual(region_0x03);
  });
  it('parses polish grammar with set symbols', () => {
    expect(parser.parse('(u (∩ A B C) (∩ A !B !C))')).toEqual(region_0x03);
  });
  it('parses mixed polish, terse, and infix grammar, and mixed symbols', () => {
    expect(parser.parse('[u ABC (A AND !B && ¬C)]')).toEqual(region_0x03);
    expect(parser.parse('[u ABC (A \\ B && ¬C)]')).toEqual(region_0x03);
  });
});