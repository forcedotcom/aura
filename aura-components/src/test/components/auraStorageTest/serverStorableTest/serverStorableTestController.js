({
    handleClick : function(cmp) {
        var a = cmp.get("c.setStorable");
        a.setParams({actionsToMark: ["java://org.auraframework.impl.java.controller.ServerStorableActionController/ACTION$storedAction"]});
        $A.enqueueAction(a);
    }
})
