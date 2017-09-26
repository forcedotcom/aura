({
    selectors: {
        input: 'input'
    },
    testChangeEventSource: {
        test: [
            function (component) {
                this.inputValue(component.find('input'), 1)
            },
            function (component) {
                var eventSource = component.get('v.eventSource');
                var eventValue = component.get('v.eventValue');
                $A.test.assertEquals('ui:inputPercent', eventSource, 'Event source should be ui:inputPercent.');
                $A.test.assertEquals(0.01, eventValue, 'Event value is not matching.');
            }
        ]
    },

    inputValue: function (component, value) {
        var elm = component.getElement();
        var input = elm.querySelector(this.selectors.input);
        input.value = value;
        $A.test.fireDomEvent(input, "input");
    }
})