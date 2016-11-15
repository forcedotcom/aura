({
    getSimplePromise : function(shouldSucceed) {
        return new Promise(function(resolve, reject){
            if(shouldSucceed){
                setTimeout(resolve, 5);
            } else {
                setTimeout(reject, 5);
            }
        });
    }
})