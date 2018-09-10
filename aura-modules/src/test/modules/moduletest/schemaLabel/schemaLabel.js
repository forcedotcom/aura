import { LightningElement, api } from "lwc";
import today from "@salesforce/label/Related_Lists.task_mode_today";
import tomorrow from "@salesforce/label/Related_Lists.task_mode_tomorrow";

export default class Marker extends LightningElement {
    get todayLabel() {
        return today;
    }

    get tomorrowLabel() {
        return tomorrow;
    }

    @api
    getTodayLabel() {
        return today;
    }

    @api
    getTomorrowLabel() {
        return tomorrow;
    }
}
