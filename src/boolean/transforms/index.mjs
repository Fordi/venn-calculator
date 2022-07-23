import unwrap from './unwrap.mjs';
import tautology from './tautology.mjs';
import identity from './identity.mjs';
import association from './association.mjs';
import complement from './complement.mjs';
import involution from './involution.mjs';
import deMorgan from './deMorgan.mjs';
import absorption from './absorption.mjs';
import consensus from './consensus.mjs';
import collect from './collect.mjs';
import distribute from './distribute.mjs';

// This is called a "Barrel file", it collects all the stuff in this directory
//  into a single object.

export default {
  unwrap,
  tautology,
  identity,
  association,
  complement,
  involution,
  deMorgan,
  absorption,
  distribute,
  collect,
  consensus,
};
