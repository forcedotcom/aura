({
    provide: function(component, event, controller) {
        var data;

        $A.log("provide");
        if (component.get("v.dataType") == "largeList") {
            $A.log("listOf500Items");
            data = component.get("m.listOf500Items");
        } else if (component.get("v.dataType") == "emptyList") {
            $A.log("emptyList");
            data = component.get("m.emptyList");
        } else {
            $A.log("listOfData");
            data = component.get("m.listOfData");
        }
        $A.log(data);

        var dataProvider = component.getConcreteComponent();
        this.fireDataChangeEvent(dataProvider, data);
    }
})
