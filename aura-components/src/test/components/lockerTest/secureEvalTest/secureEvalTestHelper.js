({
  /**
   * When provided an object (obj) and a string (path) this 
   * helper attempts to find the nested property (path) inside the object (obj).
   * If it exists, the object is returned. Else, undefined is returned.
   */
  getNestedObject: function(obj, path) {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined;
    }, obj || self);
  }
})