import { addNexioOwnForm, setupNexioOwnForms } from './solidus-nexio'

window.addNexioOwnForm = addNexioOwnForm;
window.setupNexioOwnForms = setupNexioOwnForms;

window.jQuery(function() { setupNexioOwnForms(); });
