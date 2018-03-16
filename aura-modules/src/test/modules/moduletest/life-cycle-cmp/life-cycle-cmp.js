import { Element, api } from "engine";

export default class LifeCycleCmp extends Element {
    @api lifeCycleLog = [];

    connectedCallback() {
        this.lifeCycleLog.push('module connected');
    }

    renderedCallback() {
        this.lifeCycleLog.push('module rendered');
    }
}

