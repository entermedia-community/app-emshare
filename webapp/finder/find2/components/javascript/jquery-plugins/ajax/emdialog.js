(function ($) {
	$.fn.emDialog = function () {
		var dialog = $(this);

		var width = dialog.data("width");
		var maxwidth = dialog.data("maxwidth");
		var id = dialog.data("dialogid");
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
		var options = dialog.data();
		var link = dialog.attr("href");
		if (!link) {
			link = dialog.data("targetlink");
		}
		if (
			dialog.hasClass("entity-dialog") &&
			dialog.closest(".modal").length !== 0
		) {
			//link = link.replace("entity.html", "entitytab.html");
			options.oemaxlevel = 1;
		}
		var param = dialog.data("parameterdata");
		if (param) {
			var element = jQuery("#" + param);
			var name = element.prop("name");
			options[name] = element.val();
		}
		var openfrom = window.location.href;

		var searchpagetitle = "";

		$(window).trigger("showToast", [dialog]);
		var toastUid = dialog.data("uid");
		jQuery.ajax({
			xhrFields: {
				withCredentials: true,
			},
			crossDomain: true,
			url: link,
			data: options,
			success: function (data) {
				dialog.data("uiid", toastUid);
				$(window).trigger("successToast", [dialog]);
				//--Entities
				if (
					dialog.hasClass("entity-dialog") &&
					dialog.closest(".modal").length !== 0
				) {
					//find tab
					var tabid = dialog.data("tabid");
					if (!tabid) {
						tabid = "tab_metadata";
					}
					if (tabid) {
						var container = dialog.closest(".entity-body");
						var tabs = container.find(".entity-tab-content");
						if (tabs.length >= 10) {
							alert("Max Tabs Limit");
							return this;
						}

						//open new entity
						var parent = container.closest(".entitydialog");
						container = dialog.closest(".entity-wraper");
						container.replaceWith(data);
						tabbackbutton(parent);
					}
				} else if (dialog.data("targetrendertype") == "entity") {
					var container = dialog.closest(".entity-wraper");
					var parent = dialog.closest(".entitydialog");
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

					var firstform = $("form", modaldialog);
					firstform.data("openedfrom", openfrom);
					// fix submit button
					var justok = dialog.data("cancelsubmit");
					if (justok != null) {
						$(".modal-footer #submitbutton", modaldialog).hide();
					} else {
						var id = $("form", modaldialog).attr("id");
						$("#submitbutton", modaldialog).attr("form", id);
					}
					var hidetitle = dialog.data("hideheader");
					if (hidetitle == null) {
						var title = dialog.attr("title");
						if (title == null) {
							title = dialog.text();
						}
						$(".modal-title", modaldialog).text(title);
					}
					var hidefooter = dialog.data("hidefooter");
					if (hidefooter != null) {
						$(".modal-footer", modaldialog).hide();
					}

					//backup url
					var currenturl = window.location.href;
					modalinstance.data("oldurlbar", currenturl);

					searchpagetitle = modaldialog.find("[data-setpagetitle]");

					modalinstance.on("hidden.bs.modal", function () {
						//on close execute extra JS -- Todo: Move it to closedialog()
						if (dialog.data("onclose")) {
							var onclose = dialog.data("onclose");
							var fnc = window[onclose];
							if (fnc && typeof fnc === "function") {
								//make sure it exists and it is a function
								fnc(dialog); //execute it
							}
						}

						closeemdialog($(this)); //Without this the asset Browse feature does not close all the way
						$(window).trigger("resize");
					});

					modalinstance.on("scroll", function () {
						//checkScroll();
					});

					adjustzindex(modalinstance);
				}

				if (
					typeof global_updateurl !== "undefined" &&
					global_updateurl == false
				) {
					//globaly disabled updateurl
				} else {
					//Update Address Bar
					var updateurl = dialog.data("updateurl");
					if (updateurl) {
						var urlbar = dialog.data("urlbar");
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
				if (dialog.data("onsuccess")) {
					var onsuccess = dialog.data("onsuccess");
					var fnc = window[onsuccess];
					if (fnc && typeof fnc === "function") {
						//make sure it exists and it is a function
						fnc(dialog); //execute it
					}
				}

				$(window).trigger("resize");
			},
			error: function () {
				dialog.data("uiid", toastUid);
				$(window).trigger("errorToast", [dialog]);
			},
		});

		$(modaldialog).on("shown.bs.modal", function () {
			trackKeydown = true;
			//adjustzindex($(this));
			var focuselement = modaldialog.data("focuson");
			if (focuselement) {
				//console.log(focuselement);
				var elmnt = document.getElementById(focuselement);
				elmnt.scrollIntoView();
			} else {
				var focusme = modaldialog.find(".focusme");
				if (focusme.length) {
					setTimeout(function () {
						focusme.focus();
					}, 1000);
				} else {
					$("form", modaldialog)
						.find("*")
						.filter(":input:visible:first")
						.focus();
				}
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
		if (dialog.closest(".dropdown-menu").length !== 0) {
			dialog.closest(".dropdown-menu").removeClass("show");
		}
		return this;
	};
})(jQuery);
