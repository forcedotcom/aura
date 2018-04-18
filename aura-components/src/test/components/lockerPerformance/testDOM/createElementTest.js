// Measure the cost of
// creating DOM elements, and setting attributes.
/* exported createElementTest */

function createElementTest(count, validate) {
  var div;
  while (count--) {
    div = document.createElement("div");
  }

  if (validate) {
    var expected = "<div></div>";
    var actual = div.outerHTML;
    this.api.assert(actual === expected, expected, actual);
  }
}
