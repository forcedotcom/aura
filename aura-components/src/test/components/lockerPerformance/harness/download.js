/* exported download */

function download(mime, content, filename, extension) {
  if (navigator.msSaveBlob) {
    // IE 10+
    var blob = new Blob([content], { type: mime });
    navigator.msSaveBlob(blob, filename + extension);
  } else {
    var url = mime + encodeURI(content);
    var event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true
    });
    var a = document.createElement("a");
    a.setAttribute("download", filename + extension);
    a.setAttribute("href", url);
    a.dispatchEvent(event);
  }
}
