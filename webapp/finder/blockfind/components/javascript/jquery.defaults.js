
/** Default ajax CORS setup **/

$.ajaxSetup({
	xhrFields: {
        withCredentials: true
    },
	crossDomain: true
});


var global_updateurl = false;