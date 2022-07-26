import peg from 'pegjs';
import { readFile } from 'fs/promises';

const parser = peg.generate(
  await readFile(
    new URL('../src/boolGrammar.pegjs', import.meta.url).pathname,
    'utf-8'
  )
);

export default parser;