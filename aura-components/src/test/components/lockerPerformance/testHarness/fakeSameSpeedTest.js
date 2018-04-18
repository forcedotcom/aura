/* exported fakeSameSpeedTest */
function fakeSameSpeedTest(count, validate) {
  while (count--) {
    this.api.sleep(100);
  }
}
