({
	handleClick : function(cmp) {
        var a = cmp.get("c.setStorable");
        a.setParams({actionsToMark: ["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$storedAction"]});
        a.runAfter(a);
	}
})