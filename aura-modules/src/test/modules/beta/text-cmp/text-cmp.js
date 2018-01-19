import { Element, api } from 'engine';

export default class Text extends Element {
    static labels = ['task_mode_today.en', 'task_mode_today.de'];
    @api text;
}
