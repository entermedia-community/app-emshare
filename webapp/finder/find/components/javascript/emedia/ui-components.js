var trackKeydown = false;
var exitWarning = false;

function isInViewport(cell) {
	const rect = cell.getBoundingClientRect();
	var isin =
		rect.top >= 0 &&
		rect.top <= (window.innerHeight || document.documentElement.clientHeight);
	return isin;
}

jQuery(document).ready(function () {
	$(window).on("keydown", function (e) {
		if (trackKeydown) {
			exitWarning = true;
		} else {
			exitWarning = false;
		}
	});

	lQuery(".uipanel").livequery(function () {
		$(this).addClass("ui-widget");
		var header = $(this).attr("header");
		if (header != undefined) {
			// http://dev.$.it/ticket/9134
			$(this).wrapInner('<div class="ui-widget-content"/>');
			$(this).prepend('<div class="ui-widget-header">' + header + "</div>");
		}
	});

	function confirmModalClose(modal) {
		var checkForm = modal.find("form.checkCloseDialog");

		if (!checkForm) {
			closeemdialog(modal);
			trackKeydown = false;
		} else {
			var prevent = false;
			$(checkForm)
				.find("input, textarea, select")
				.each(function () {
					if ($(this).attr("type") == "hidden") {
						return true;
					}
					var value = $(this).val();
					if (value) {
						prevent = value.length > 0;
						return false;
					}
				});

			if (prevent && exitWarning) {
				$("#exitConfirmationModal").css("display", "flex");
				return false;
			} else {
				closeemdialog(modal);
				trackKeydown = false;
			}
			return false;
		}
	}

	lQuery("form.checkCloseDialog").livequery(function () {
		trackKeydown = true;
		var modal = $(this).closest(".modal");
		if (modal.length) {
			if (typeof modal.modal == "function") {
				modal.modal({
					backdrop: "static",
					keyboard: false,
				});
			}
			modal.on("click", function (e) {
				e.stopPropagation();
				e.stopImmediatePropagation();
				if (e.currentTarget === e.target) {
					confirmModalClose(modal);
				}
			});
		}
	});

	lQuery("#closeExit").livequery("click", function () {
		$("#exitConfirmationModal").hide();
	});
	lQuery("#confirmExit").livequery("click", function () {
		$("#exitConfirmationModal").hide();
		closeallemdialogs();
		trackKeydown = false;
	});

	//Remove this? Not useing ajax
	$(document).on("click", ".modal", function (e) {
		if (e.target.classList.contains("modal")) {
			e.stopPropagation();
			e.stopImmediatePropagation();
			confirmModalClose($(this));
		}
	});

	lQuery(".entityclose").livequery("click", function (event) {
		event.preventDefault();
		var targetModal = $(this).closest(".modal");
		confirmModalClose(targetModal);
	});

	lQuery("#checkallcustomizations").livequery("change", function (event) {
		event.preventDefault();
		var checked = $(this).is(":checked");
		if (checked) {
			$(".customizationcheckbox").prop("checked", true);
		} else {
			$(".customizationcheckbox").prop("checked", false);
		}
	});

	$(document).keydown(function (e) {
		switch (e.which) {
			case 27: //esckey
				var modal = $(".modal.onfront");
				if (modal.length) {
					e.stopPropagation();
					e.preventDefault();
					var backBtn = modal.find(".entityNavBack");
					var checkForm = modal.find("form.checkCloseDialog");
					if (backBtn.length && backBtn.is(":visible")) {
						backBtn.trigger("click");
					} else if (checkForm.length) {
						confirmModalClose(modal);
					} else {
						closeemdialog(modal);
						trackKeydown = false;
					}
				}
				return;
			default:
				return; // exit this handler for other keys
		}
	});

	lQuery(".entityNavHistory").livequery(function () {
		var history = [];
		$(".entityNavHistory").each(function () {
			history.push($(this).data());
		});
		var link = $(".entityNavBack");
		var currentLinkIdx = history.findIndex(function (d) {
			return d.entityid == link.data("entityid");
		});
		if (currentLinkIdx > 0) {
			var backLink = history[currentLinkIdx - 1];
			link.data("entityid", backLink.entityid);
			link.data("entitymoduleid", backLink.entitymoduleid);
			link.data("entitymoduleviewid", backLink.entitymoduleviewid);
			link.data("url", backLink.url);
			link.attr("href", backLink.url);
			link.find("#showname").prepend(backLink.parententiylabel);
			link.show();
		}
	});

	lQuery(".entity-tab-content.overflow-x").livequery(
		"scroll",
		function (event) {
			if (event.shiftKey) {
				if (event.originalEvent.deltaY > 0) {
					event.preventDefault();
					$(this).scrollLeft($(this).scrollLeft() - 100);
				} else {
					event.preventDefault();
					$(this).scrollLeft($(this).scrollLeft() + 100);
				}
			}
		}
	);

	function formsavebackbutton(form) {
		var savedcontainer = $(".enablebackbtn");
		if (savedcontainer.length) {
			var parent = savedcontainer.parent().closest(".entitydialog");
			tabbackbutton(parent);
		}
	}

	function tabbackbutton(parent) {
		var parentid = "";
		if (parent.length) {
			parentid = parent.data("entityid");
		}

		if (parentid != "") {
			//var container = parent.find('.entitydialog');
			var backbtn = $(".entitydialogback");
			$(backbtn).show();
			$(backbtn).data("parentid", parentid);
			$(backbtn).data("parentcontainerid", parent.attr("id"));
			$(backbtn).data("urlbar", parent.data("urlbar"));
		}
	}

	lQuery(".autoopen").livequery(function () {
		var link = $(this);
		link.emDialog();
	});

	window.onhashchange = function () {
		$("body").css({ overflow: "visible" }); //Enable scroll
		$(window).trigger("resize");
	};

	function copyTextToClipboard(text, cb) {
		try {
			if ("clipboard" in navigator) {
				navigator.clipboard.writeText(text);
			} else {
				var textArea = document.createElement("textarea");
				textArea.value = text;
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand("copy");
				document.body.removeChild(textArea);
			}
			if (cb) {
				cb();
			}
		} catch (err) {
			console.log(err);
		}
	}

	lQuery(".copytoclipboard").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var btn = $(this);
		var textToCopy = btn.data("text");
		if (!textToCopy) {
			var copyTextTarget = btn.data("copytarget");
			if (copyTextTarget) {
				textToCopy = $("#" + copyTextTarget).val();
				if (!textToCopy) {
					textToCopy = $("#" + copyTextTarget).text();
				} else {
					$("#" + copyTextTarget).select();
				}
			}
		}

		if (!textToCopy) {
			return;
		}

		if (textToCopy.startsWith("http://") || textToCopy.startsWith("https://")) {
			textToCopy = encodeURI(textToCopy);
		}
		copyTextToClipboard(textToCopy, function () {
			customToast("Copied to clipboard!");
			var btnHtm = btn.html();
			var _btnHtm = btnHtm;
			btnHtm = btnHtm.replace("bi-copy", "bi-check-lg");
			btnHtm = btnHtm.replace("fa-copy", "fas fa-check");
			btnHtm = btnHtm.replace("Copy", "Copied");
			btn.html(btnHtm);
			setTimeout(() => {
				btn.html(_btnHtm);
			}, 2500);
		});
	});

	lQuery(".copyFromTarget").livequery("click", function (e) {
		e.preventDefault();
		if ("clipboard" in navigator) {
			var $this = $(this);
			var type = $this.data("type") || "text";
			var btnText = $this.text();
			var target = $this.data("target");
			if (!target) return;
			var targetEl = $("#" + target);
			if (type == "text") {
				var data = targetEl.text();
				if (targetEl.is("input") || targetEl.is("textarea")) {
					data = targetEl.val();
				}
				navigator.clipboard.writeText(data);
				$this.html('<i class="bi bi-check-lg mr-1"></i> Copied!');
				setTimeout(() => {
					$this.html('<i class="bi bi-clipboard mr-1"></i> ' + btnText);
				}, 2000);
			} else {
				if (!targetEl.is("img")) {
					targetEl = targetEl.find("img");
				}
				var dataURL = targetEl.attr("src");
				if (!dataURL) {
					return;
				}
				$this.html('<i class="fas fa-spinner fa-spin"></i>');
				fetch(dataURL)
					.then((res) => res.blob())
					.then((blob) => {
						navigator.clipboard.write([
							new ClipboardItem({
								"image/png": blob,
							}),
						]);
					})
					.then(() => {
						$this.html('<i class="bi bi-check-lg"></i> Copied!');
						setTimeout(() => {
							$this.html('<i class="bi bi-clipboard"></i> ' + btnText);
						}, 2000);
					})
					.catch(() => {
						$this.html('<i class="bi bi-clipboard"></i> ' + btnText);
					});
			}
		} else {
			alert("Clipboard API not supported, please use a modern browser.");
			return;
		}
	});

	lQuery(".addnewwithai").livequery("click", function (e) {
		e.preventDefault();
		$(".createnewtoggle").toggle();
		//$(this).hide(); //One time only?
	});

	lQuery(".facepf").livequery(function (e) {
		var location = $(this).data("location");
		var width = $(this).data("width");
		var height = $(this).data("height");
		var x = location[0];
		var y = location[1];
		var fw = 80 / location[2];
		var fh = 80 / location[3];
		var imageUrl = $(this).data("img");
		var box = $(this);
		box.css({
			backgroundImage: `url(${imageUrl})`,
			backgroundSize: `${Math.ceil(width * fw)}px ${Math.ceil(height * fh)}px`,
			backgroundPosition: `-${x * fw}px -${y * fh}px`,
		});
	});

	lQuery(".trim-text").livequery(function (e) {
		var text = $(this).text();
		var check = $(this).closest(".entitymetadatamodal");
		if (check.length > 0) {
			text = text.replace(/</g, "&lt;");
			text = text.replace(/>/g, "&gt;");
			text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
			$(this).html(text);
			return;
		}
		$(this).click(function (e) {
			if (
				e.target.classList.contains("see-more") ||
				e.target.classList.contains("see-less")
			) {
				e.stopPropagation();
			}
		});
		var maxLength = $(this).data("max");
		if (text.length <= maxLength) return;
		var minimizedText = text.substring(0, maxLength).trim();
		minimizedText = minimizedText.replace(/</gm, "&lt;");
		minimizedText = minimizedText.replace(/>/gm, "&gt;");
		minimizedText = minimizedText.replace(/(\r\n|\n|\r)/gm, "<br>");
		$(this).html(minimizedText);
		$(this).data("text", text);
		var btn = $(this).parent().find(".see-more");
		btn.html(btn.data("seemore"));
	});

	lQuery(".see-more-btn").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var textParent = $(this).prev(".trim-text");
		var text = textParent.data("text");
		if (!text) {
			$(this).remove();
			return;
		}
		if ($(this).hasClass("see-more")) {
			text = text.replace(/</gm, "&lt;");
			text = text.replace(/>/gm, "&gt;");
			textParent.html(text.replace(/(\r\n|\n|\r)/gm, "<br>"));
			//textParent.append('<button class="see-less">(...see less)</button>');
			$(this).removeClass("see-more").addClass("see-less");
			$(this).html($(this).data("seeless"));
		} else {
			var maxLength = textParent.data("max");
			if (!maxLength || !text) {
				$(this).remove();
				return;
			}
			var minimizedText = text.substring(0, maxLength).trim();
			minimizedText = minimizedText.replace(/<br>/gm, "\n");
			minimizedText = minimizedText.replace(/</gm, "&lt;");
			minimizedText = minimizedText.replace(/>/gm, "&gt;");
			minimizedText = minimizedText.replace(/(\r\n|\n|\r)/gm, "<br>");
			textParent.html(minimizedText);
			$(this).removeClass("see-less").addClass("see-more");
			$(this).html($(this).data("seemore"));
		}
	});

	lQuery(".see-more-tags-btn").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var tagsParent = $(this).prev(".tageditor-viewer");
		if ($(this).hasClass("see-more")) {
			$(".seelesstags", tagsParent).css("display", "inline-block");
			$(this).removeClass("see-more").addClass("see-less");
			$(this).html($(this).data("seeless"));
		} else {
			$(".seelesstags", tagsParent).hide();
			$(this).removeClass("see-less").addClass("see-more");
			$(this).html($(this).data("seemore"));
		}
	});

	lQuery(".filtersshowmoretags").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var moretags = $(this).next(".moreoptions");
		moretags.show();
		$(this).hide();
	});

	lQuery("#filterautorefresh").livequery("change", function () {
		toggleUserProperty("filtershowall");
	});

	lQuery(".sidetoggle").livequery("click", function () {
		var div = $(this);
		var target = $(this).data("target");
		var toggle = $(this).data("toggle");
		if (!toggle) {
			toggle = target;
		}
		$("#" + target).slideToggle("fast", function () {
			div.find(".caret").toggleClass("exp");
			div.toggleClass("expanded");
			div.toggleClass("minimized");
			div.find(".component-actions").toggle();
			$(window).trigger("resize");
		});
		toggleUserProperty("minimize" + toggle, null, function () {
			// revert if failed
			$("#" + target).slideToggle("fast", function () {
				div.find(".caret").addClass("exp");
				div.removeClass("expanded");
				div.addClass("minimized");
				div.find(".component-actions").toggle();
				$(window).trigger("resize");
			});
		});
	});

	lQuery(".summary-toggler").livequery("click", function (e) {
		var toggler = $(this);

		var resultsdiv = toggler.closest(".resultsdiv");

		var container = $(".summary-container", resultsdiv);
		var isminimized = true;

		//Refresh the UI quickly
		if (container.length == 0 || container.hasClass("closed")) {
			isminimized = true;
			container.removeClass("closed");
			$(".summary-opener", resultsdiv).addClass("closed"); //hide the button
			container.removeClass("closed");
		} else {
			isminimized = false;
			container.addClass("closed");
			$(".summary-opener", resultsdiv).removeClass("closed");
		}
		setTimeout(() => {
			$(window).trigger("resize");
		}, 210); //match the transition speed of summary sidebar 200ms

		var preferencename = toggler.data("preferencename");
		var url = resultsdiv.data("searchhome");
		resultsdiv.data("url", url + "/changeminimizefilter.html");

		var toggle = !isminimized;
		resultsdiv.data("profilepreference.value", toggle);
		resultsdiv.data("profilepreference", preferencename);
		if (isminimized) {
			resultsdiv.data("targetdiv", resultsdiv.attr("id"));
			resultsdiv.data("oemaxlevel", 1);
		} else {
			resultsdiv.data("targetdiv", "null");
			resultsdiv.data("oemaxlevel", 0);
		}
		resultsdiv.runAjax();
	});

	lQuery(".sidebar-toggler").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var toggler = $(this);
		var options = toggler.data();
		var targetdiv = toggler.data("targetdiv");
		var sidebar = toggler.data("sidebar");
		options["propertyfield"] = "sidebarcomponent";
		var url = toggler.attr("href");

		if (toggler.data("action") == "home") {
			options["sidebarcomponent.value"] = "";
			options["sidebarcomponent"] = "home";

			jQuery.ajax({
				url: url,
				async: false,
				data: options,
				success: function (data) {
					//data = $(data);
					var cell = findClosest(toggler, "#" + targetdiv);
					cell.replaceWith(data); //Cant get a valid dom element
					$(".pushcontent").removeClass("pushcontent-" + sidebar);
					$(".pushcontent").removeClass("pushcontent-open");
					$(".pushcontent").addClass("pushcontent-fullwidth");

					$(window).trigger("setPageTitle", [cell]);

					$(window).trigger("resize");

					history.pushState($("#application").html(), null, url);
				},
				xhrFields: {
					withCredentials: true,
				},
				crossDomain: true,
			});
		} else if (toggler.data("action") == "hide") {
			//hide sidebar
			options["module"] = $("#applicationcontent").data("moduleid");
			options["sidebarcomponent.value"] = "";
			var url = apphome + "/components/sidebars/index.html";
			jQuery.ajax({
				url: url,
				async: false,
				data: options,
				success: function (data) {
					var cell = findClosest(toggler, "#" + targetdiv);
					cell.replaceWith(data); //Cant get a valid dom element
					$(".pushcontent").removeClass("pushcontent-" + sidebar);
					$(".pushcontent").removeClass("pushcontent-open");
					$(".pushcontent").addClass("pushcontent-fullwidth");

					$(window).trigger("resize");
				},
			});
		} else {
			//showsidebar
			showsidebar(toggler);
		}
	});

	showsidebar = function (toggler) {
		var options = toggler.data();
		var targetdiv = toggler.data("targetdiv");
		var sidebar = toggler.data("sidebar");
		options["propertyfield"] = "sidebarcomponent";
		var moduleid = $("#applicationcontent").data("moduleid");
		options["module"] = moduleid;
		options["sidebarcomponent.value"] = sidebar;
		var url;
		if (options["contenturl"] != undefined) {
			url = options["contenturl"];
			targetdiv = $("#" + targetdiv);
		} else {
			if (moduleid !== undefined) {
				url = `${apphome}/views/modules/${moduleid}/components/sidebars/index.html`;
			} else {
				url = apphome + "/components/sidebars/index.html";
			}
			targetdiv = findClosest(toggler, "#" + targetdiv);
		}

		jQuery.ajax({
			url: url,
			async: false,
			data: options,
			success: function (data) {
				targetdiv.replaceWith(data); //Cant get a valid dom element
				$(".pushcontent").removeClass("pushcontent-fullwidth");
				$(".pushcontent").addClass("pushcontent-open");
				$(".pushcontent").addClass("pushcontent-" + sidebar);
				var mainsidebar = $(".col-mainsidebar");
				if (mainsidebar.data("sidebarwidth")) {
					var width = mainsidebar.data("sidebarwidth");
					if (typeof width == "number") {
						$(".pushcontent").css("margin-left", width + "px");
					}
				}
				$(window).trigger("setPageTitle", [targetdiv]);
				$(window).trigger("resize");
			},
		});
	};

	showsidebaruploads = function () {
		$("#sidebarUserUploads").trigger("click");
	};
}); //on ready
