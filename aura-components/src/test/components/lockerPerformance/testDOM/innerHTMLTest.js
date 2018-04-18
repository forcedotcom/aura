// Measure the cost of
// parsing HTML using DOMPurify.
/* exported innerHTMLTest */

function innerHTMLTest(count, validate) {
  var html =
    "<section><h1>Lorem Ipsum</h1><p>Lorem ipsum <em>dolor sit amet</em>.</p></section>";

  var div = document.createElement("div");
  while (count--) {
    div.innerHTML = html;
  }

  if (validate) {
    var expected = "<div>" + html + "</div>";
    var actual = div.outerHTML;
    this.api.assert(actual === expected, expected, actual);
  }
}
