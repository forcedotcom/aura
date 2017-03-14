/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({

    /*
     * This test is excluded from ipad and iphone because safari on them treat daylight saving differently. as a result,
     * we get "invalid date time" error on autobuild safari-ios (W-2123968)
     *
     * TODO: this test is to verify ui:outputDateTime. Moving it to corresponding test file.
     */
    testDaylightSavingTime: {
        browsers: ["-IPAD","-IPHONE"],
        test:function(component){
            var expected1 = "Nov 3, 2013 12:01:00 AM";
            var expected2 = "Nov 3, 2013 1:01:00 AM";
            var expected3 = "Nov 3, 2013 2:01:00 AM";
            var helper = component.getDef().getHelper();
            helper.verifyDateAndTime(component,"myOutputDateTimeCompHongKong1",expected1);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompHongKong2",expected2);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompHongKong3",expected3);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompNewYork1",expected1);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompNewYork2",expected2);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompNewYork3",expected2);
        }
    }

})
