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

	lQuery(".copytoclipboard").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var btn = $(this);
		var copytextcontainer = btn.data("copytext");
		var copyText = $("#" + copytextcontainer);
		copyText.select();
		document.execCommand("copy");
		var alertdiv = btn.data("targetdiv");
		if (alertdiv) {
			console.log(copyText);
			$("#" + alertdiv)
				.show()
				.fadeOut(2000);
		}
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
}); //on ready
