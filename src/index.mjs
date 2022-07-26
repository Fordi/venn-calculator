/* globals window, document, paper */
import getFormula, { REGIONS } from './getFormula.mjs';
import { findEls } from './dom.mjs';
import diagram from './diagram.mjs';
// This was a beast to implement.  If you're interested, check out
//  https://github.com/Fordi/bsimp
import { simplify, parse, toString, AND, FALSE } from '@fordi-org/bsimp';

// Calculate the Venn number for the selected checkboxes
// Incidentally, this is an arrow function
// They're similar to regular functions, except they don't populate
//   `this` or `arguments`, they're terser and marginally faster, and you
//   can have an inline return value, e.g., `const add5 = x => x + 5;`
// This means that in 99% of cases, you don't actually need to
//   write out `function (args) {...}`, since you can write `(args) => { ... }`
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
const getVennNumber = () => ( // < inline return parenthesis
  // `findEls` is basically a wrapper around `document.querySelectorAll`, which
  //    casts the result to an Array so you can use array comprehension stuff
  //    (like Array#reduce and Array#forEach) to operate on a bunch of elements
  //    at a time.
  findEls('.region_state input[type="checkbox"]')
    // Array#reduce basically steps through all the items in an array,
    //   runs the passed function on them, and returns the result.
    //   docs here:
    //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    .reduce((sum, { value, checked }) => {
      // Oh, that second argument?  That's destructuring.
      //    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
      //    Basically, we know the second argument here is an HTMLElement,
      //    and we know we're going to access its `value` and `checked` properties,
      //    so this extracts them to local variables.
      // If the value is clear, or the box is unchecked, ignore it.
      if (value === 'CLEAR' || !checked) return sum;
      // `<<` is the bitwise left shift operator.
      //   The expression `X << Y` is roughly equivalent to `X * Math.pow(2, Y)`.
      //   So 1 << 0 = 1, 1 << 1 = 2, 1 << 3 = 8, and so on.
      //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
      // `sum` is the running value (starting at 0, the second argument of `reduce`
      //   below).  So we're adding each checked bit to the running total,
      //   resulting in the Venn number we're after.
      return sum + (1 << Number.parseInt(value, 10));
    }, 0)
);


const getNotation = () => {
  const { value } = document.querySelector('.notation input[type="radio"][name="notation"]:checked');
  return toString[value];
};

const formatFormula = n => toString(simplify(getFormula(n)), getNotation());

// Set the region checkboxes to a venn number
const setCheckboxes = (vennNo) => {
  findEls('.region_state input[type="checkbox"]').forEach((box) => {
    box.checked = ((vennNo >> box.value) & 1) !== 0;
  });
};

// Update the value of the formula field
const updateFormula = (f) => {
  document.querySelector('#formula').value = f;
};

// Once the window is loaded, and we have access to the full DOM...
window.addEventListener('load', () => {
  // Get all the checkboxes
  const boxes = findEls('.region_state input[type="checkbox"]');
  const update = () => {
    // Get the current Venn number
    const vennNo = getVennNumber();
    // Redraw the diagram to reflect the new number
    updateDiagram(vennNo);
    // Get the Set formula for that number
    const result = formatFormula(vennNo);
    // populate the output with the new info.
    updateFormula(result);
  };

  // See: https://en.wikipedia.org/wiki/Gray_code
  // Convert a number to a Gray code
  const binToGray = (n) => n ^ (n >> 1);
  // Convert a Gray code to a number.
  const grayToBin = (n) => {
    let m = n;
    while (m) {
      m >>= 1;
      n ^= m;
    }
    return n;
  };


  // Go to the next Gray number once every quarter second
  // Stop if "Auto" is no longer checked.
  // Why Gray codes?  Because only one bit of a Gray code changes
  // from one to the next.
  const auto = () => {
    if (!document.querySelector('input#rAuto').checked) return;
    // Convert the current Venn number from a Gray code
    const index = grayToBin(getVennNumber());
    // Get the next one, looping so it fits in 7 bits.
    const nextIndex = (index + 1) & ((1 << 8) - 1);
    // Convert back into a Gray code.
    const next = binToGray(nextIndex);
    setCheckboxes(next);
    update();
    setTimeout(auto, 250);
  };

  // Start cycling on click.
  document.querySelector('input#rAuto').addEventListener('change', auto);
  
  // On each one...
  //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  boxes.forEach((el) => {
    // Listen for changes
    el.addEventListener('change', update);
  });

  // swap all the boxes
  document.querySelector('.invert').addEventListener('click', () => {
    boxes.forEach((box) => {
      box.checked = !box.checked;
    });
    update();
  });
  // Clear the checkboxes
  document.querySelector('.clear').addEventListener('click', () => {
    boxes.forEach((box) => {
      box.checked = false;
    });
    update();
  });

  // This allows us to manually enter a logical expression and 
  // present a Venn diagram for it.
  document.querySelector('#setVenn').addEventListener('click', () => {
    // Grab the value from the field
    const value = document.querySelector('#formula').value.trim();
    // Handle the special case of an empty set
    if (value === 'Empty Set' || value === '()' || value === 'undefined' || value === '∅') {
      setCheckboxes(0);
      updateDiagram(0);
      return;
    }
    // Parse the string
    const parsed = parse(value);
    // Calculate which regions are lit by this expression
    const num = REGIONS.reduce((sum, region, index) => (
      sum + ((simplify([AND, region, parsed]) !== FALSE) ? (1 << index) : 0)
    ), 0);
    // Set the checkboxes
    setCheckboxes(num);
    // Update the diagram
    updateDiagram(num);
  });
  // Reformat the current formula when changing formats
  findEls('.notation input[type="radio"]').forEach((rb) => {
    rb.addEventListener('change', () => {
      const vennNo = getVennNumber();
      const result = formatFormula(vennNo);
      updateFormula(result);
    });
  });

  // Initialize Paper.js
  paper.setup(document.querySelector('canvas'));

  // Initialize the diagram
  const updateDiagram = diagram();
});
// You can proceed to checking out `diagram.mjs`
