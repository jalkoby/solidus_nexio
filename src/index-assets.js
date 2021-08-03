import { addNexioOwnForm, setupNexioOwnForms } from './solidus-nexio'

window.addNexioOwnForm = addNexioOwnForm;

window.jQuery(function() { setupNexioOwnForms(); });
