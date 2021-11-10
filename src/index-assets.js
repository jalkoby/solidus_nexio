import { addNexioAPM, addNexioOwnForm, setupNexio } from './solidus-nexio'

window.addNexioOwnForm = addNexioOwnForm;
window.addNexioAPM = addNexioAPM;
window.setupNexio = setupNexio;

window.jQuery(function() { setupNexio(); });
