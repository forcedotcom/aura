/* exported wrapObjectTest */
function wrapObjectTest(count, validate) {
  var obj1 = {
    a: 123,
    b: "abc",
    c: [1, 3, 4],
    d: { a: true, b: true, c: true }
  };

  var obj2;
  while (count--) {
    obj2 = this.api.wrap(obj1);
  }

  if (validate) {
    var expected = JSON.stringify(obj1);
    var actual = JSON.stringify(obj2);
    this.api.assert(actual === expected, expected, actual);
  }
}
