import { Element, track } from "engine";

export default class TestModuleTabl100 extends Element {
  @track headers;
  @track content;

  constructor() {
    super();

    const rows = 100;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const headers = [];
    for (let i = 0; i < months.length; i++) {
      const name = months[i];
      headers.push({ id: i, value: name });
    }

    const content = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < months.length; j++) {
        const col = 12 * i + j + 1;
        row.push({ id: j, value: col });
      }
      content.push({ id: i, value: row });
    }

    this.headers = headers;
    this.content = content;
  }
}
