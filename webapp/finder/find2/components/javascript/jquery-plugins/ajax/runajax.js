$.ajaxSetup({
	xhrFields: {
		withCredentials: true,
	},
	crossDomain: true,
});

(function ($) {
	$.fn.runAjax = function (successCallback = null) {
		var inlink = $(this);
		$(".ajaxprogress").show();
		var confirmation = $(inlink).data("confirm");
		if (confirmation && !confirm(confirmation)) {
			return this;
		}
		inlink.attr("disabled", "disabled");

		if (inlink.hasClass("activelistener")) {
			$(".activelistener").removeClass("active");
			inlink.addClass("active");
			$(".activelistener").removeClass("selected");
			inlink.addClass("selected");
		}
		//for listeners in a container
		if (inlink.hasClass("activelistenerparent")) {
			var listenerparent = inlink.closest(".activelistcontainer");
			if (listenerparent.length > 0) {
				listenerparent.siblings().removeClass("active");
				listenerparent.addClass("active");
			}
		}

		var nextpage = inlink.attr("href");
		if (!nextpage) {
			nextpage = inlink.data("nextpage");
		}

		var options = $(inlink).data();
		if (options.isEmptyObject || $(inlink).data("findalldata")) {
			options = findalldata(inlink);
		}

		var targetDiv = inlink.data("targetdiv");
		var replaceHtml = true;

		var targetDivInner = inlink.data("targetdivinner");
		if (targetDivInner) {
			targetDiv = targetDivInner;
			replaceHtml = false;
		}

		var useparent = inlink.data("useparent");
		var activemenu;
		if (inlink.hasClass("auto-active-link")) {
			activemenu = inlink;
		} else if (inlink.data("autoactivecontainer")) {
			activemenu = $("." + inlink.data("autoactivecontainer"));
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

		var inlinkmodal = inlink.closest(".modal");

		if (targetDiv) {
			inlink.css("cursor", "wait");
			$("body").css("cursor", "wait");

			targetDiv = targetDiv.replace(/\//g, "\\/");

			//before ajaxcall
			if (inlink.data("onbefore")) {
				var onbefore = inlink.data("onbefore");
				var fnc = window[onbefore];
				if (fnc && typeof fnc === "function") {
					//make sure it exists and it is a function
					fnc(inlink); //execute it
				}
			}

			if (!targetDiv.startsWith("#") && !targetDiv.startsWith(".")) {
				targetDiv = "#" + targetDiv;
			}

			$(window).trigger("showToast", [inlink]);
			var toastUid = $(inlink).data("uid");
			jQuery
				.ajax({
					url: nextpage,
					data: options,
					success: function (data) {
						inlink.data("uid", toastUid);
						$(window).trigger("successToast", [inlink]);
						var cell;
						if (useparent && useparent == "true") {
							cell = $("#" + targetDiv, window.parent.document);
						} else {
							cell = findclosest(inlink, targetDiv);
						}
						var onpage;
						var newcell;
						if (replaceHtml) {
							//Call replacer to pull $scope variables
							onpage = cell.parent();
							cell.replaceWith(data); //Cant get a valid dom element
							newcell = findclosest(onpage, targetDiv);
						} else {
							onpage = cell;
							cell.html(data);
							newcell = onpage.children(":first");
						}
						$(window).trigger("setPageTitle", [newcell]);

						//on success execute extra JS
						if (inlink.data("onsuccess")) {
							var onsuccess = inlink.data("onsuccess");
							var fnc = window[onsuccess];
							if (fnc && typeof fnc === "function") {
								//make sure it exists and it is a function
								fnc(inlink); //execute it
							}
						}

						$(window).trigger("checkautoreload", [inlink]);

						if (successCallback) {
							successCallback();
						}

						//actions after autoreload?
						var message = inlink.data("alertmessage");
						if (message) {
							$("body").append(
								'<div class="alert alert-success fader alert-save">' +
									message +
									"</div>"
							);
						}
					},
					error: function () {
						inlink.data("uid", toastUid);
						$(window).trigger("errorToast", [inlink]);
					},
					type: "POST",
					dataType: "text",
					xhrFields: {
						withCredentials: true,
					},
					crossDomain: true,
				})
				.always(function () {
					var scrolltotop = inlink.data("scrolltotop");
					if (scrolltotop) {
						window.scrollTo(0, 0);
					}

					$(".ajaxprogress").hide();
					//inlink.css("enabled",true);
					inlink.removeAttr("disabled");

					//Close All Dialogs
					var closealldialogs = inlink.data("closealldialogs");
					if (closealldialogs) {
						closeallemdialogs();
					} else {
						//Close Dialog
						var closedialog = inlink.data("closedialog");
						if (closedialog && inlinkmodal != null) {
							closeemdialog(inlinkmodal);
						}
						//Close MediaViewer
						var closemediaviewer = inlink.data("closemediaviewer");
						if (closemediaviewer) {
							var overlay = $("#hiddenoverlay");
							if (overlay.length) {
								hideOverlayDiv(overlay);
							}
						}
					}
					//Close Navbar if exists
					var navbar = inlink.closest(".navbar-collapse");
					if (navbar) {
						navbar.collapse("hide");
					}

					$(window).trigger("resize");

					inlink.css("cursor", "");
					$("body").css("cursor", "");

					if (
						typeof global_updateurl !== "undefined" &&
						global_updateurl == false
					) {
						//globaly disabled updateurl
					} else {
						var updateurl = inlink.data("updateurl");
						if (updateurl) {
							//console.log("Saving state ", updateurl);
							history.pushState($("#application").html(), null, nextpage);
						}
					}
				});
		}
		return this;
	};
})(jQuery);
