import "./ErrorMessage.scss";

/* ERROR WAIT TIME IN SECONDS */
const ERROR_WAIT_TIME = 3;

export function showError(message) {
  document.querySelector(
    "._error_icon"
  ).innerHTML = `<i class="bi bi-exclamation-octagon"></i>`;
  document.querySelector("._error_message").innerHTML = message;
  document.querySelector("._error_body").style.backgroundColor = "#f45050";
  document.querySelector("._error_body").style.display = "flex";
  setTimeout(() => {
    document.querySelector("._error_body").style.display = "none";
  }, ERROR_WAIT_TIME * 1000);
}

export function showSuccess(message) {
  document.querySelector("._error_message").innerHTML = message;
  document.querySelector("._error_body").style.backgroundColor = "#47A992";
  document.querySelector(
    "._error_icon"
  ).innerHTML = `<i class="bi bi-check2-circle"></i>`;
  document.querySelector("._error_body").style.display = "flex";
  setTimeout(() => {
    document.querySelector("._error_body").style.display = "none";
  }, ERROR_WAIT_TIME * 1000);
}

export function ErrorMessage() {
  return (
    <div className="_error_body">
      <span className="_error_icon">
        <i className="bi bi-exclamation-triangle"></i>
      </span>
      <span className="_error_message">Error Message</span>
    </div>
  );
}
