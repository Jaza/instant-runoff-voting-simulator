// Thanks to: https://tobiasahlin.com/blog/move-from-jquery-to-vanilla-javascript/
const ready = (callback) => {
  if (document.readyState != "loading") callback();
  else document.addEventListener("DOMContentLoaded", callback);
}
