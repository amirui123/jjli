/**
 * BezierEasing - use bezier curve for transition easing function
 * Inspired from Firefox's nsSMILKeySpline.cpp
 * Usage:
 *   const spline = BezierEasing(0.25, 0.1, 0.25, 1.0);
 *   spline(x) => returns the easing value | x must be in [0, 1] range
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BezierEasing = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  function BezierEasing(mX1, mY1, mX2, mY2) {
    if (!(this instanceof BezierEasing)) return new BezierEasing(mX1, mY1, mX2, mY2);

    const A = (a1, a2) => 1.0 - 3.0 * a2 + 3.0 * a1;
    const B = (a1, a2) => 3.0 * a2 - 6.0 * a1;
    const C = (a1) => 3.0 * a1;

    const calcBezier = (t, a1, a2) =>
      ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;

    const getSlope = (t, a1, a2) =>
      3.0 * A(a1, a2) * t * t + 2.0 * B(a1, a2) * t + C(a1);

    function getTForX(x) {
      let guessT = x;
      for (let i = 0; i < 4; ++i) {
        const slope = getSlope(guessT, mX1, mX2);
        if (slope === 0.0) return guessT;
        guessT -= (calcBezier(guessT, mX1, mX2) - x) / slope;
      }
      return guessT;
    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) return x;
      return calcBezier(getTForX(x), mY1, mY2);
    };
  }

  BezierEasing.css = {
    'ease':        BezierEasing(0.25, 0.1, 0.25, 1.0),
    'linear':      BezierEasing(0.00, 0.0, 1.00, 1.0),
    'ease-in':     BezierEasing(0.42, 0.0, 1.00, 1.0),
    'ease-out':    BezierEasing(0.00, 0.0, 0.58, 1.0),
    'ease-in-out': BezierEasing(0.42, 0.0, 0.58, 1.0),
  };

  return BezierEasing;
}));
