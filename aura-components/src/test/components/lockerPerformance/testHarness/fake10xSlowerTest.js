/* exported fake10xSlowerTest */
function fake10xSlowerTest(count, validate) {
  var time = this.api.isLockerEnabled ? 1000 : 100;

  while (count--) {
    this.api.sleep(time);
  }
}
