function errService() {
    return {
        throwAnError: function() {
            throw new Error("Error from library Code");
        },

        throwAnErrorFromCallback: function() {
            var callback = $A.getCallback(function() {
                        throw Error("Error from a callback function in component library");
                    });
            setTimeout(callback, 0);
        },

        throwAnErrorInPromise: function() {
            var promise = new Promise(function(resolve, reject) {
                reject(new Error("Error from promise in component library"));
            });
        }
    }
}
