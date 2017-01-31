({
    findSecureObject: function(list) {
        if(!list || !list.length) {
            return null;
        }

        for(var i = 0, len = list.length; i < len; i++) {
            if(list[i].toString().indexOf('SecureObject') === 0) {
                return list[i];
            }
        }

        return null;
    },

    // Verify that container contains the element provided
    contains: function(container, element) {
        if ( element ) {
            while ( (element = element.parentNode) ) {
                if (element === container) {
                    return true;
                }
            }
        }
        return false;
    }
})
