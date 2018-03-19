import { Element, api, dangerousObjectMutation } from "engine";

export default class LifeCycleCmp extends Element {
    @api lifeCycleLog = [];

    connectedCallback() {
        dangerousObjectMutation(this.lifeCycleLog).push('module connected');
    }

    renderedCallback() {
        dangerousObjectMutation(this.lifeCycleLog).push('module rendered');
    }
}

