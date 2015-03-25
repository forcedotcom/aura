({
    "insertResponse": function (cmp, a) {
        $A.createComponent("actionsTest:transactionsEntry",
            {
                "transactionId":$A.getCurrentTransactionId(),
                "actionId":a.getId(),
                "state":a.getState()
            },
            function (newCmp) {
                if (cmp.isValid()) {
                    var holder = cmp.find("responses");
                    var body = holder.get("v.body");
                    body.push(newCmp);
                    holder.set("v.body", body);
                }
            })
    },

    "handleCb" : function(cmp, action, callback) {
        this.insertResponse(cmp, action);
        if (callback) {
            callback.call(this, action);
        }
    },

    "sendAction" : function(cmp, abortable, transactionId, callback) {
        var serverAction = cmp.get("c.executeInForeground");

        if (transactionId) {
            $A.setCurrentTransactionId(transactionId);
        }
        serverAction.setAbortable(abortable);
        serverAction.setCallback(this, function(action) { this.handleCb(cmp, action, callback); }, "SUCCESS");
        serverAction.setCallback(this, function(action) { this.handleCb(cmp, action, callback); }, "ERROR");
        serverAction.setCallback(this, function(action) { this.handleCb(cmp, action, callback); }, "INCOMPLETE");
        serverAction.setCallback(this, function(action) { this.handleCb(cmp, action, callback); }, "ABORTED");
        $A.enqueueAction(serverAction);
    }

})
