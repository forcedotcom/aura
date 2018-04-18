/* exported unwrapObjectTest */
function unwrapObjectTest(count, validate) {
  var obj1 = {
    a: 123,
    b: "abc",
    c: [1, 3, 4],
    d: { a: true, b: true, c: true }
  };
  var obj2 = this.api.wrap(obj1);

  var obj3;
  while (count--) {
    obj3 = this.api.unwrap(obj2);
  }

  if (validate) {
    var expected = JSON.stringify(obj2);
    var actual = JSON.stringify(obj3);
    this.api.assert(actual === expected, expected, actual);
  }
}
