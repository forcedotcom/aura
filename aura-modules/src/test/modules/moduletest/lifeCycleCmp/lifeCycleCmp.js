import { LightningElement, api, unwrap } from "lwc";

export default class LifeCycleCmp extends LightningElement {
    @api lifeCycleLog = [];

    connectedCallback() {
        unwrap(this.lifeCycleLog).push('module connected');
    }

    renderedCallback() {
        unwrap(this.lifeCycleLog).push('module rendered');
    }
}

