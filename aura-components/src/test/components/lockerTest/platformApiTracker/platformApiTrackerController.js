({
    generateLockerApiMap: function(cmp, event, helper) {
        var apiMap = {};
        helper.collectExposedApis(apiMap, "$A", $A);
        helper.collectExposedApis(apiMap, "Util", $A.util);
        helper.collectExposedApis(apiMap, "AuraLocalizationService", $A.localizationService);
        helper.collectExposedApis(apiMap, "Component", cmp);
        helper.collectExposedApis(apiMap, "Action", cmp.get("c.getPlatformApis"));
        helper.collectExposedApis(apiMap, "Event", event);
        cmp.set("v.apiMap", apiMap);
	}
})
