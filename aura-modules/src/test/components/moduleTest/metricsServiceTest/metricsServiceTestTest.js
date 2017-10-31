({
    testMetricsServiceIsImportable: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var instrumentation = cmp.find('lib');
                $A.test.assertDefined(instrumentation);
            }
        ]
    },
    testTimeMethod: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var instrumentation = cmp.find('lib');
                $A.test.assertDefined(instrumentation.time());
            }
        ]
    },
    testMarks: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var instrumentation = cmp.find('lib');
                var mark = instrumentation.mark('ns', 'name', { foo: true });
                $A.test.assertDefined(mark);
                $A.test.assertEquals(mark.name, 'name');
                $A.test.assertEquals(mark.ns, 'ns');
                $A.test.assertEquals(mark.context.foo, true);
            }
        ]
    },
    testInteraction: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
            	var trxId;
            	$A.metricsService.registerBeacon({ sendData: function (t) { trxId = t; }});
                var instrumentation = cmp.find('lib');
                instrumentation.interaction('target', 'scope', { foo: true });
                $A.test.assertEquals(trxId, 'ltng:interaction');
            }
        ]
    },
    testPerf: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
            	var trxId;
            	var trx;
            	$A.metricsService.registerBeacon({ sendData: function (id, t) { trxId = id; trx = t; }});
                var instrumentation = cmp.find('lib');
                instrumentation.perfStart('name', { foo: true });
                instrumentation.perfEnd('name', { foo: true });
                $A.test.assertEquals(trxId, 'ltng:performance');
            }
        ]
    }
})