import { addNexioOwnForm, setupNexioOwnForms } from './solidus_nexio'

window.addNexioOwnForm = addNexioOwnForm;

window.jQuery(function() { setupNexioOwnForms(); });
