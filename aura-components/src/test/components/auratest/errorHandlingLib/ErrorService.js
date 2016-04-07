function() {
    return {
        throwAnError: function() {
            throw new Error("Error from library Code");
        },

        throwAnErrorFromCallback: function() {
            var callback = $A.getCallback(function() {
                        throw Error("Error from a callback function in component library");
                    });
            setTimeout(callback, 0);
        }
    }
}
