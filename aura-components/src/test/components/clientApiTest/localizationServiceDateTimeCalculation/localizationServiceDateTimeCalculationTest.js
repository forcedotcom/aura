({
    /**
     * Most tests are covered by xUnit, AuraLocalizationServiceTest.
     * These tests are testing the cases with unit "week", because for now,
     * we still have dependency with moment for week to determine the first day
     * of week.
     */

    testEndOfWeek: {
        test: function() {
            var format =  "YYYY-MM-DD";
            var dateString = "2018-01-28";

            var date = $A.localizationService.endOf(dateString, "weeks");

            var actual = $A.localizationService.formatDateTime(date, format);
            // Saturday
            $A.test.assertEquals("2018-02-03", actual, "unexpected end date of the week");
        }
    },

    testStartOfWeek: {
        test: function() {
            var format =  "YYYY-MM-DD";
            var dateString = "2018-02-01";

            var date = $A.localizationService.startOf(dateString, "weeks");

            var actual = $A.localizationService.formatDateTime(date, format);
            // Sunday
            $A.test.assertEquals("2018-01-28", actual, "unexpected start date of the week");
        }
    }
})
