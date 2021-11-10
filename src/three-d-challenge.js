import { getPaymentState } from './api'
import tingle from 'tingle.js'
import tingleCss from 'raw-loader!./tingle.css'

let style= document.createElement('style');
style.setAttribute('type', 'text/css');
style.innerHTML = tingleCss;
document.head.appendChild(style);

const checkPaymentState = (path, modal, cb) => {
  getPaymentState(path).then(state => {
    if (state) {
      if (modal.isOpen()) {
        modal.close();
      }
      cb(state);
    } else if (!modal.isOpen()) {
      // check the most recent state
      getPaymentState(path).then(state => cb(state || 'invalid'));
    } else {
      setTimeout(checkPaymentState.bind(null, path, modal, cb), 2000);
    }
  });
}

export default (urls, cb) => {
  let modal = new tingle.modal({
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: 'Close',
    onOpen() {
      setTimeout(() => checkPaymentState(urls.check_path, modal, cb), 3000);
    },
    onClose() {
      modal.$closed = true;
    }
  });
  modal.setContent(`<iframe src="${urls.redirect_url}" class="tingle-modal-box__iframe" />`);
  modal.open();
}
