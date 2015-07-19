({
    setup: function (cmp) {
        cmp.set('v.initialState', {
            initialCmpCount : $A.componentService.countComponents(),
            dataSetSize     : cmp.get('m.tenValues').length
        });
    },
    run: function (cmp, event) {
        var testData      = cmp.get('m.tenValues').slice(0);
        var testDataBatch = $A.util.map(testData, function (i) {
            return $A.util.copy(i);
        });

        cmp.set('v.iterationItems', testData);
        cmp.set('v.iterationItems', testDataBatch);
    },
    postProcessing: function (cmp, event) {
        var dataSetSize = cmp.get('v.initialState.dataSetSize');
        var results     = event.getParam('arguments').results;
        var common      = results.commonMetrics;
        var deltaCmps   = common.finalComponentCount - common.initialComponentCount;

        results.customMetrics.leakedComponents = deltaCmps - dataSetSize;
        console.log('Leaked cmps: ', results.customMetrics.leakedComponents);
    }
})