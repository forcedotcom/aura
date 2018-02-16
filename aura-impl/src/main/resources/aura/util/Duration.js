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

/**
 * Duration class for AuraLocalizationService.
 *
 * We used to expose moment Duration object to framework users by $A.localizationService.duration().
 * This class is responsible for deprecating moment Duration and for the implementation of Duration.
 * All APIs in this class are deprecated and will be removed. (Those APIs were exposed to framework users
 * due to moment Duration)
 * The object of this class can be only consumed by AuraLocalizationService APIs for framework users.
 *
 * @constructor
 * @export
 */
Aura.Utils.Duration = function Duration(momentDuration) {
    this.duration = momentDuration;
};

Aura.Utils.Duration.prototype.getMomentDuration = function() {
    return this.duration;
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.clone = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.clone");
    return this.duration["clone"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.humanize = function(withSuffix) {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.humanize");
    return this.duration["humanize"](withSuffix);
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.milliseconds = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.getMillisecondsInDuration()'", "Duration.milliseconds");
    return this.duration["milliseconds"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asMilliseconds = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInMilliseconds()'", "Duration.asMilliseconds");
    return this.duration["asMilliseconds"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.seconds = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationSerivce.displayDurationInSeconds()'", "Duration.seconds");
    return this.duration["seconds"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asSeconds = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInSeconds()'", "Duration.asSeconds");
    return this.duration["asSeconds"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.minutes = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.getMinutesInDuration()", "Duration.minutes");
    return this.duration["minutes"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asMinutes = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInMinutes()'", "Duration.asMinutes");
    return this.duration["asMinutes"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.hours = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.getHoursInDuration()'", "Duration.hours");
    return this.duration["hours"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asHours = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInHours()'", "Duration.asHours");
    return this.duration["asHours"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.days = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.getDaysInDuration()'", "Duration.days");
    return this.duration["days"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asDays = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInDays()'", "Duration.asDays");
    return this.duration["asDays"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.weeks = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.weeks");
    return this.duration["weeks"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asWeeks = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.asWeeks");
    return this.duration["asWeeks"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.months = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.getMonthsInDuration()'", "Duration.months");
    return this.duration["months"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asMonths = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInMonths()'", "Duration.asMonths");
    return this.duration["asMonths"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.years = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.getYearsInDuration()'", "Duration.years");
    return this.duration["years"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.asYears = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            "Use '$A.localizationService.displayDurationInYears()'", "Duration.asYears");
    return this.duration["asYears"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.add = function(number, unit) {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.add");
    return this.duration["add"](number, unit);
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.subtract = function(number, unit) {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.subtract");
    return this.duration["subtract"](number, unit);
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.as = function(unit) {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.as");
    return this.duration["as"](unit);
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.get = function(unit) {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.get");
    return this.duration["get"](unit);
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.toJSON = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.toJSON");
    return this.duration["toJSON"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.toISOString = function() {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.toISOString");
    return this.duration["toISOString"]();
};

/**
 * @deprecated
 * @export
 * @platform
 */
Aura.Utils.Duration.prototype.locale = function(locale) {
    $A.deprecated("This method is not officially supported by framework and will be removed in upcoming release.",
            null, "Duration.locale");
    return this.duration["locale"](locale);
};
