// IE11 implementation is broken for primitives
(function() {
    var freeze = Object.freeze;
    Object.freeze = function(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        return freeze(obj);
    };
})();