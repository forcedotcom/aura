({
    render: function (cmp, helper) {
        var dom       = this.superRender(),
            container = dom[0],
            testArray = cmp.get('m.testsWithProps');
        //var listDOM   = helper.buildDOM(testArray);

        //container.appendChild(listDOM);
        helper.renderTests(testArray, container);
        helper.attachEvents(cmp, container);

        return dom;
    }
})