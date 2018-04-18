/* global constants */

function assert(condition, expected, actual) {
  if (!condition) {
    throw new Error("Expected " + expected + ", actual " + actual);
  }
}

// Dummy function.
function identity(obj) {
  return obj;
}

function sleep(miliseconds) {
  var endTime = performance.now() + miliseconds;
  while (performance.now() < endTime) {}
}

// Use a raw and secure GVP to wrap objects.
var rawGvp = $A.get("$Locker");
if (!rawGvp) {
  rawGvp = {};
  $A.addValueProvider("$Locker", rawGvp);
}
var secureGvp = $A.lockerService.runScript(
  "$A.get('$Locker')",
  constants.NAMESPACE
);
function wrap(obj) {
  rawGvp.export = obj;
  obj = secureGvp.export;
  delete secureGvp.export;
  return obj;
}
function unwrap(obj) {
  secureGvp.export = obj;
  obj = rawGvp.export;
  delete rawGvp.export;
  return obj;
}

function secureEval(src) {
  return $A.lockerService.runScript(src, constants.NAMESPACE);
}

function render(cmp) {
  var ret = $A.render(cmp);
  $A.afterRender(cmp);
  $A.unrender(cmp);
  return ret;
}
function create(config) {
  var cmp = $A.createComponentFromConfig(config);
  return cmp;
}

var api = {
  unsecure: {
    isLockerEnabled: false,
    assert: assert,
    render: render,
    create: create,
    sleep: sleep,

    wrap: identity,
    unwrap: identity,
    eval: (0, eval)
  },
  secure: {
    isLockerEnabled: true,
    assert: assert,
    render: render,
    create: create,
    sleep: sleep,

    wrap: wrap,
    unwrap: unwrap,
    eval: secureEval
  }
};
