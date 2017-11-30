({
    // Portion of React's trackValueOnNode.
    // See inputValueTracking.js
    // https://github.com/facebook/react/blob/master/packages/react-dom/src/client/inputValueTracking.js
    trackValueOnNode: function (node, valueField) {

        var descriptor = Object.getOwnPropertyDescriptor(
            node.constructor.prototype,
            valueField
        );

        var currentValue = '' + node[valueField];
        Object.defineProperty(node, valueField, {
            enumerable: descriptor.enumerable,
            configurable: true,
            get: function() {
                return descriptor.get.call(this);
            },
            set: function(value) {
                currentValue = '' + value;
                descriptor.set.call(this, value);
            },
        });

        function getValue() {
          return currentValue;
        };

        return getValue;
    }
})