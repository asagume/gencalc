import * as master from './master.js'

let mainEl = document.getElementById('main');
if (mainEl) {
    mainEl.innerText = JSON.stringify(master.CHARACTER_MASTER_LIST);
}
