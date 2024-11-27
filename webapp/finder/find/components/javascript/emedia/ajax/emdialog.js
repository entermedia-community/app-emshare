(function ($) {
	$.fn.emDialog = function () {
		var initiator = $(this);

		var width = initiator.data("width");
		var maxwidth = initiator.data("maxwidth");
		var id = initiator.data("dialogid");
		if (!id) {
			id = "modals";
		}

		var modaldialog = $("#" + id);
		if (modaldialog.length == 0) {
			jQuery("#application").append(
				'<div class="modal" tabindex="-1" id="' +
					id +
					'" style="display:none" ></div>'
			);
			modaldialog = jQuery("#" + id);
		}
		var options = initiator.data();

		if (initiator.data("includeeditcontext") == true) {
			var editdiv = initiator.closest(".editdiv"); //This is used for lightbox tree opening
			if (editdiv.length > 0) {
				var otherdata = editdiv.cleandata();
				options = {
					...otherdata,
					...options,
				};
			} else {
				console.warn("No editdiv found for includeeditcontext");
			}
		}

		if (initiator.data("includesearchcontext") == true) {
			var editdiv = initiator.closest(".editdiv"); //This is used for lightbox tree opening
			var resultsdiv = editdiv.find(".resultsdiv");

			if (resultsdiv.length > 0) {
				var otherdata = resultsdiv.cleandata();
				options = {
					...otherdata,
					...options,
				};
			} else {
				console.warn("No resultsdiv found for includesearchcontext");
			}
		}

		var link = initiator.attr("href");
		if (!link) {
			link = initiator.data("targetlink");
		}
		if (!link) {
			link = initiator.data("url");
		}
		if (
			initiator.hasClass("entity-dialog") &&
			initiator.closest(".modal").length !== 0
		) {
			//link = link.replace("entity.html", "entitytab.html");
			options.oemaxlevel = 1;
		}

		//NOT USED. Delete
		var param = initiator.data("parameterdata");
		if (param) {
			var element = jQuery("#" + param);
			var name = element.prop("name");
			options[name] = element.val();
		}
		var openfrom = window.location.href;

		var searchpagetitle = "";

		$(window).trigger("showToast", [initiator]);
		var toastUid = initiator.data("uid");
		jQuery.ajax({
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
			url: link,
			data: options,
			success: function (data) {
				initiator.data("uiid", toastUid);
				$(window).trigger("successToast", [initiator]);
				//--Entities
				if (
					initiator.hasClass("entity-dialog") &&
					initiator.closest(".modal").length !== 0
				) {
					//find tab
					var tabid = initiator.data("tabid");
					if (!tabid) {
						tabid = "tab_metadata";
					}
					if (tabid) {
						var container = initiator.closest(".entity-body");
						var tabs = container.find(".entity-tab-content");
						if (tabs.length >= 10) {
							alert("Max Tabs Limit");
							return this;
						}

						//open new entity
						var parent = container.closest(".entitydialog");
						container = initiator.closest(".entity-wraper");
						container.replaceWith(data);
						tabbackbutton(parent);
					}
				} else if (initiator.data("targetrendertype") == "entity") {
					var container = initiator.closest(".entity-wraper");
					var parent = initiator.closest(".entitydialog");
					container.replaceWith(data);
					tabbackbutton(parent);
				} else {
					modaldialog.html(data);
					if (width !== undefined) {
						if (width > $(window).width()) {
							width = $(window).width();
						}

						$(".modal-dialog", modaldialog).css("min-width", width + "px");
					}
					if (maxwidth) {
						$(".modal-dialog", modaldialog).css("max-width", maxwidth + "px");
					}

					var modalkeyboard = false;
					var modalbackdrop = true;
					if ($(".modal-backdrop").length) {
						modalbackdrop = false;
					}

					var modalinstance;
					if (modalkeyboard) {
						modalinstance = modaldialog.modal({
							closeExisting: false,
							show: true,
							backdrop: modalbackdrop,
						});
					} else {
						modalinstance = modaldialog.modal({
							keyboard: false,
							closeExisting: false,
							show: true,
							backdrop: modalbackdrop,
						});
					}

					if (initiator.is(":visible")) {
						var firstform = modaldialog.find("form");
						firstform.data("openedfrom", openfrom);
					}
					var autosetformtargetdiv = initiator.data("autosetformtargetdiv");
					if (autosetformtargetdiv !== undefined) {
						var tdiv = initiator.closest("." + autosetformtargetdiv);
						if (tdiv.length == 1) {
							firstform.data("targetdiv", tdiv.attr("id"));
						}
					}

					// fix submit button
					var justok = initiator.data("cancelsubmit");
					if (justok != null) {
						$(".modal-footer #submitbutton", modaldialog).hide();
					} else {
						var id = $("form", modaldialog).attr("id");
						$("#submitbutton", modaldialog).attr("form", id);
					}
					var hidetitle = initiator.data("hideheader");
					if (hidetitle == null) {
						var title = initiator.attr("title");
						if (title == null) {
							title = initiator.text();
						}
						$(".modal-title", modaldialog).text(title);
					}
					var hidefooter = initiator.data("hidefooter");
					if (hidefooter != null) {
						$(".modal-footer", modaldialog).hide();
					}

					//backup url
					var currenturl = window.location.href;
					modalinstance.data("oldurlbar", currenturl);

					searchpagetitle = modaldialog.find("[data-setpagetitle]");

					modalinstance.on("hidden.bs.modal", function () {
						//on close execute extra JS -- Todo: Move it to closedialog()
						if (initiator.data("onclose")) {
							var onclose = initiator.data("onclose");
							var fnc = window[onclose];
							if (fnc && typeof fnc === "function") {
								//make sure it exists and it is a function
								fnc(initiator); //execute it
							}
						}

						closeemdialog($(this)); //Without this the asset Browse feature does not close all the way
						$(window).trigger("resize");
					});

					modalinstance.on("scroll", function () {
						//checkScroll();
					});

					adjustZIndex(modalinstance);
				}

				if (
					typeof global_updateurl !== "undefined" &&
					global_updateurl == false
				) {
					//globaly disabled updateurl
				} else {
					//Update Address Bar
					var updateurl = initiator.data("updateurl");
					if (updateurl) {
						var urlbar = initiator.data("urlbar");
						if (!urlbar) {
							urlbar = link;
						}

						history.pushState($("#application").html(), null, urlbar);
						window.scrollTo(0, 0);
					}
				}

				if (searchpagetitle) {
					$(window).trigger("setPageTitle", [searchpagetitle]);
				}

				//on success execute extra JS
				if (initiator.data("onsuccess")) {
					var onsuccess = initiator.data("onsuccess");
					var fnc = window[onsuccess];
					if (fnc && typeof fnc === "function") {
						//make sure it exists and it is a function
						fnc(initiator); //execute it
					}
				}

				$(window).trigger("resize");
			},
			error: function () {
				initiator.data("uiid", toastUid);
				$(window).trigger("errorToast", [initiator]);
			},
		});

		$(modaldialog).on("shown.bs.modal", function () {
			trackKeydown = true;
			var focuselement = modaldialog.data("focuson");
			if (focuselement) {
				//console.log(focuselement);
				var elmnt = document.getElementById(focuselement);
				elmnt.scrollIntoView();
			}
		});

		$(modaldialog).on("hide.bs.modal", function (e) {
			trackKeydown = false;
			if (!$(this).hasClass("onfront")) {
				e.stopPropagation();
				e.stopImmediatePropagation();
				return this;
			} else {
				if ($(".modal:visible").length > 0) {
					// restore the modal-open class to the body element, so that scrolling works
					// properly after de-stacking a modal.
					setTimeout(function () {
						$(document.body).removeClass("modal-open");
					}, 0);
				}
			}
		});

		//Close drodpown if exists
		if (initiator.closest(".dropdown-menu").length !== 0) {
			initiator.closest(".dropdown-menu").removeClass("show");
		}
		return this;
	};
})(jQuery);

closeemdialog = function (modaldialog) {
	var oldurlbar = modaldialog.data("oldurlbar");

	if (modaldialog.modal) {
		modaldialog.modal("hide");
		modaldialog.remove();
	}
	//other modals?
	var othermodal = $(".modal");
	if (othermodal.length && !othermodal.is(":hidden")) {
		adjustZIndex(othermodal);
	}

	$(window).trigger("setPageTitle", [othermodal]);

	if (oldurlbar !== undefined) {
		history.pushState($("#application").html(), null, oldurlbar);
	}
};

closeallemdialogs = function () {
	$(".modal").each(function () {
		var modaldialog = $(this);
		modaldialog.modal("hide");
		modaldialog.remove();
	});
	var overlay = $("#hiddenoverlay");
	if (overlay.length) {
		hideOverlayDiv(overlay);
	}
};
