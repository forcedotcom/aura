export default function* () {
  yield window;
  yield document;
  yield document.createElement('DIV');
  return 'Default!';
}
