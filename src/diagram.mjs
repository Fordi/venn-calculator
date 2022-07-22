// More destructuring; this time, to keep things terse
const { sin, cos, PI } = Math;
const { assign } = Object;
const { Path: { Circle }, PointText } = paper;

const TAU = PI * 2; // a.k.a., 360 degrees, or one turn.
const theta0 = -TAU * 7 / 12;

// Simple bit of trig to make positioning our circles easier.
// cos is run, sin is rise; `-sin` and `theta0` are to flip and
//  rotate the canvas around such that where we want set A is
//  aligned at 0 turns
const polar = (turns, mag) => (
  paper.view.center.add([
    cos(theta0 + TAU * turns) * mag,
    -sin(theta0 + TAU * turns) * mag
  ])
);

const makeObjects = () => {
  // Our scaling parameter; basically, it's there to make sure that whatever
  //  size we choose for our canvas, the diagram will fit.
  const scale = Math.min(paper.view.bounds.width, paper.view.bounds.height) / 4;
  // How far we will move our circles from center to make them overlap
  const move = 0.75 * scale;
  // The style for the sets (the lines for each circle)
  const setStyle = {
    strokeColor: 'black',
    fillColor: 'transparent',
    radius: scale,
  };
  // The style for the regions (the fills within each circle)
  const regionStyle = {
    strokeColor: 'none',
    fillColor: 'transparent',
  };
  // The style for the labels
  const labelStyle = {
    fillColor: 'black',
    justification: 'center',
    fontSize: 0.2 * scale,
  };
  // Convenience functions for generating the objects.
  const set = (center) => new Circle({ center, ...setStyle });
  const label = (content, position) => new PointText({ ...labelStyle, position, content });

  const sets = [
    set(polar(0, move)),
    set(polar(-1/3, move)),
    set(polar(-2/3, move)),
  ];
  
  const regions = [
    sets[0].subtract(sets[1]).subtract(sets[2]),   // I   = A ∖ B ∖ C
    sets[0].intersect(sets[1]).subtract(sets[2]),  // II  = A ∩ B ∖ C
    sets[1].subtract(sets[0]).subtract(sets[2]),   // III = B ∖ A ∖ C
    sets[0].intersect(sets[2]).subtract(sets[1]),  // IV  = A ∩ C ∖ B
    sets[0].intersect(sets[1]).intersect(sets[2]), // V   = A ∩ B ∩ C
    sets[1].intersect(sets[2]).subtract(sets[0]),  // VI  = B ∩ C ∖ A
    sets[2].subtract(sets[0]).subtract(sets[1]),   // VII = C ∖ A ∖ B
  ];

  // Make sure the regions are all below the sets, so they don't cover
  //  up the lines.
  regions.forEach(region => region.insertBelow(sets[0]));

  // Draw in all the text labels.
  const labels = [
    label('A', polar(0, move).add([0, -1.25 * scale])),
    label('B', polar(-1/3, move).add([0, -1.25 * scale])),
    label('C', polar(-2/3, move).add([0, +1.25 * scale])),
    label('I', polar(0, move * 1.25)),
    label('II', polar(-1/6, move * 0.66)),
    label('III', polar(-1/3, move * 1.25)),
    label('IV', polar(1/6, move * 0.66)),
    label('V', paper.view.center.add([0, 0.125 * scale])),
    label('VI', polar(3/6, move * 0.66)),
    label('VII', polar(-2/3, move * 1.25)),
  ];

  return {
    sets,
    regions,
    labels,
  };
};

export default () => {
  // Generate the object set
  const objs = makeObjects();
  // We'll return an update function, to the consumer can
  //  tell the diagram to update its presentation.
  const update = (vennNo) => {
    for (let i = 0; i < objs.regions.length; i++) {
      // And the complement!  `>>` is the shift right operator
      //   where `X >> Y` effectively divides X by 2 Y times.
      //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift
      // `&` is the bitwise AND, and `X & 1` masks off only the lowest bit
      //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND
      // so `((X >> i) & 1) !== 0` means:
      //   "bit i is on in vennNo", letting us unpack the venn
      //   number one bit at a time.
      const on = ((vennNo >> i) & 1) !== 0;
      // The ternary operator `X ? Y : Z` means "Y if X, otherwise, Z"
      //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
      objs.regions[i].fillColor = on ? 'red' : 'transparent';
    }
    paper.view.draw();  
  };
  paper.view.draw();
  return update;
};

