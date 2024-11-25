(function ($) {
	$.fn.runAjax = function (successCallback = null) {
		var anchor = $(this);
		var confirmation = $(anchor).data("confirm");
		if (confirmation && !confirm(confirmation)) {
			return this;
		}

		anchor.attr("disabled", "disabled");

		if (anchor.hasClass("activelistener")) {
			$(".activelistener").removeClass("active");
			anchor.addClass("active");
			$(".activelistener").removeClass("selected");
			anchor.addClass("selected");
		}
		//for listeners in a container
		if (anchor.hasClass("activelistenerparent")) {
			var listenerParent = anchor.closest(".activelistcontainer");
			if (listenerParent.length > 0) {
				listenerParent.siblings().removeClass("active");
				listenerParent.addClass("active");
			}
		}

		var nextpage = anchor.attr("href");
		if (!nextpage) {
			nextpage = anchor.data("nextpage");
		}

		var options = anchor.cleandata();
		if (anchor.data("includesearchcontext") == true) {
			//Is this a good idea or a bad idea?
			var resultsdivS = "resultsdiv"; //anchor.data("resultsdiv");
			var resultsdiv = anchor.closest("." + resultsdivS);
			var otherdata = resultsdiv.cleandata();
			options = {
				//Merge em
				...options,
				...otherdata,
			};
		}

		var activemenu;
		if (anchor.hasClass("auto-active-link")) {
			activemenu = anchor;
		} else if (anchor.data("autoactivecontainer")) {
			activemenu = $("." + anchor.data("autoactivecontainer"));
		}
		if (activemenu !== undefined && activemenu.length > 0) {
			var container = activemenu.closest(".auto-active-container");
			if (container.length == 0) {
				container = activemenu.parent().parent();
			}

			jQuery(".auto-active-row", container).removeClass("current");
			var row = activemenu.closest(".auto-active-row");
			row.addClass("current");

			jQuery("li", container).removeClass("current");
			var row = activemenu.closest("li");
			row.addClass("current");
		}

		var anchorModal = anchor.closest(".modal");

		var _targetdiv = anchor.data("targetdiv");
		var replaceHtml = true;

		var targetDivInner = anchor.data("targetdivinner");
		if (targetDivInner) {
			_targetdiv = targetDivInner;
			replaceHtml = false;
		}
		var targetDiv = anchor.closest("." + $.escapeSelector(_targetdiv));
		if (!targetDiv.length) {
			targetDiv = $("." + $.escapeSelector(_targetdiv));
		}
		if (!targetDiv.length) {
			targetDiv = $("#" + $.escapeSelector(_targetdiv)); //legacy
		}

		if (targetDiv.length) {
			anchor.css("cursor", "wait");
			$("body").css("cursor", "wait");

			//before ajaxcall
			if (anchor.data("onbefore")) {
				var onbefore = anchor.data("onbefore");
				var fnc = window[onbefore];
				if (fnc && typeof fnc === "function") {
					//make sure it exists and it is a function
					fnc(anchor); //execute it
				}
			}

			$(window).trigger("showToast", [anchor]);
			var toastUid = $(anchor).data("uid");
			jQuery
				.ajax({
					url: nextpage,
					data: options,
					success: function (data) {
						anchor.data("uid", toastUid);
						$(window).trigger("successToast", [anchor]);
						/*
						var cell;
						if (useparent && useparent == "true") {
							cell = $("#" + targetDiv, window.parent.document);
						} else {
							cell = findClosest(anchor, targetDiv);
						}*/
						var onpage;
						var newcell;
						if (replaceHtml) {
							//Call replacer to pull $scope variables
							onpage = targetDiv.parent();
							targetDiv.replaceWith(data); //Cant get a valid dom element
							newcell = findClosest(onpage, targetDiv);
						} else {
							onpage = targetDiv;
							targetDiv.html(data);
							newcell = onpage.children(":first");
						}
						$(window).trigger("setPageTitle", [newcell]);

						//on success execute extra JS
						if (anchor.data("onsuccess")) {
							var onsuccess = anchor.data("onsuccess");
							var fnc = window[onsuccess];
							if (fnc && typeof fnc === "function") {
								//make sure it exists and it is a function
								fnc(anchor); //execute it
							}
						}

						$(window).trigger("checkautoreload", [anchor]);

						if (successCallback) {
							successCallback();
						}

						//actions after autoreload?
						var message = anchor.data("alertmessage");
						if (message) customToast(message);
					},
					error: function () {
						anchor.data("uid", toastUid);
						$(window).trigger("errorToast", [anchor]);
					},
					type: "POST",
					dataType: "text",
					xhrFields: {
						withCredentials: true,
					},
					crossDomain: true,
				})
				.always(function () {
					var scrolltotop = anchor.data("scrolltotop");
					if (scrolltotop) {
						window.scrollTo(0, 0);
					}
					//anchor.css("enabled",true);
					anchor.removeAttr("disabled");

					//Close All Dialogs
					var closealldialogs = anchor.data("closealldialogs");
					if (closealldialogs) {
						closeallemdialogs();
					} else {
						//Close Dialog
						var closedialog = anchor.data("closedialog");
						if (closedialog && anchorModal != null) {
							closeemdialog(anchorModal);
						}
						//Close MediaViewer
						var closemediaviewer = anchor.data("closemediaviewer");
						if (closemediaviewer) {
							var overlay = $("#hiddenoverlay");
							if (overlay.length) {
								hideOverlayDiv(overlay);
							}
						}
					}
					//Close Navbar if exists
					var navbar = anchor.closest(".navbar-collapse");
					if (navbar) {
						navbar.collapse("hide");
					}

					$(window).trigger("resize");

					anchor.css("cursor", "");
					$("body").css("cursor", "");

					if (
						typeof global_updateurl !== "undefined" &&
						global_updateurl == false
					) {
						//globaly disabled updateurl
					} else {
						var updateurl = anchor.data("updateurl");
						if (updateurl) {
							//console.log("Saving state ", updateurl);
							history.pushState($("#application").html(), null, nextpage);
						}
					}
				});
		} else {
			anchor.removeAttr("disabled");
		}
		return this;
	};
})(jQuery);

$(document).ajaxError(function (e, jqXhr, settings, exception) {
	console.log(e, jqXhr, exception);
	if (exception == "abort") {
		return;
	}
	var err = "Error processing the request!";
	if (jqXhr.readyState == 0) {
		err = "Network error!";
	} else if (exception == "timeout") {
		err = "Request timed out!";
	}

	customToast(err, {
		autohide: false,
		positive: false,
	});

	var errors =
		"Error: " +
		exception +
		"\n" +
		jqXhr.responseText +
		"\n URL: " +
		settings.url;
	console.error(errors);
	return;
});

var runAjaxOn = {};
var ajaxRunning = false;

runAjaxStatus = function () {
	//for each asset on the page reload it's status
	//console.log(uid);

	for (const [uid, enabled] of Object.entries(runAjaxOn)) {
		if (!enabled || enabled === undefined) {
			continue;
		}
		var cell = $("#" + uid);
		if (cell.length == 0) {
			continue;
		}

		if (!cell.hasClass("ajaxstatus")) {
			continue; //Must be done
		}

		if (!isInViewport(cell[0])) {
			continue;
		}

		var path = cell.attr("ajaxpath");
		if (!path || path == "") {
			path = cell.data("ajaxpath");
		}
		//console.log("Loading " + path );
		if (path && path.length > 1) {
			var entermediakey = "";
			if (app && app.data("entermediakey") != null) {
				entermediakey = app.data("entermediakey");
			}
			var data = cell.cleandata();
			jQuery.ajax({
				url: path,
				async: false,
				data: data,
				success: function (data) {
					cell.replaceWith(data);
					//$(window).trigger("checkautoreload", [cell]);
					$(window).trigger("resize");
				},
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
			});
		}
	}
	setTimeout("runAjaxStatus();", 1000); //Start checking any and all fields on the screeen that are saved in runAjaxOn
};

lQuery(".ajaxstatus").livequery(function () {
	var uid = $(this).attr("id");

	var iscomplete = $(this).data("ajaxstatuscomplete");

	if (iscomplete) {
		runAjaxOn[uid] = false;
	} else {
		var inqueue = runAjaxOn[uid];
		if (inqueue == undefined) {
			runAjaxOn[uid] = true; //Only load once per id
		}
	}
	if (!ajaxRunning) {
		setTimeout("runAjaxStatus();", 500); //Start checking then runs every second on all status
		ajaxRunning = true;
	}
});
