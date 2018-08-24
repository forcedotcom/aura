import { LightningElement, api } from "lwc";

export default class Text extends LightningElement {
    static labels = ['task_mode_today.en', 'task_mode_today.de'];
    @api text;
}
