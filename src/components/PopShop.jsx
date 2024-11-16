import "./PopShop.scss";
export function popShop(id, innerData) {
  const show = () => {
    document.querySelector(`#${id}`).style.display = "flex";
    document.querySelector(`#${id} > .popup_window`).style.animation =
      "scaleUp 0.3s ease forwards";
  };
  const hide = () => {
    document.querySelector(`#${id} > .popup_window`).style.animation =
      "scaleDown 0.2s ease forwards";
    setTimeout(() => {
      document.querySelector(`#${id}`).style.display = "none";
    }, 200);
  };

  const Popup = () => {
    return (
      <div id={id} className="popup_wrapper">
        <div className="popup_window">
          <button className="popup_btn" onClick={hide}>
            <i className="bi bi-x-lg"></i>
          </button>
          {innerData}
        </div>
      </div>
    );
  };
  return [show, hide, Popup];
}
