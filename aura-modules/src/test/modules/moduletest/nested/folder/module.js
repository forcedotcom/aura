import { bar } from "../other/sub.js";

export function foo (a) {
	return a.bind(bar);
}