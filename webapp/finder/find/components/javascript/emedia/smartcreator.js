$(document).ready(function () {
	var applink =
		$("#application").data("siteroot") + $("#application").data("apphome");

	lQuery(".opensmartcreator").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		closeemdialog($("#entitydialog"));
		$(this).emDialog();
	});

	lQuery("#closecreator").livequery("click", function () {
		closeemdialog($(this).closest(".modal"));
	});

	lQuery(".creator-maker").livequery("click", function (e) {
		var editorEl = $(this).find(".editable-content.ck");
		if (editorEl.length > 0) {
			var clickedElement = $(e.target);
			if (
				!clickedElement.closest(".editable-content.ck").length &&
				!clickedElement.closest(".ck-toolbar").length
			) {
				e.preventDefault();
				e.stopImmediatePropagation();
				setTimeout(function () {
					if (editorEl.hasClass("ck-focused")) return;
					customToast(
						"You have unsaved changes. Please save or cancel your current edit.",
						{ id: "alert", positive: false },
					);
				}, 100);
				editorEl.focus();
				return false;
			}
		}
	});

	lQuery(".add-componentcontent").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var toBeUpdated = $(this)
			.closest(".creator-section-content")
			.nextAll(".creator-section-content");
		$(this).runAjax(function () {
			toBeUpdated.each(function () {
				var currentOrder = $(this).data("ordering");
				$(this).data("ordering", currentOrder + 1);
				$(this).attr("data-ordering", currentOrder + 1);
			});
		});
	});

	lQuery(".add-sectioncontent").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var toBeUpdated = $(this)
			.closest(".creator-section")
			.nextAll(".creator-section");
		$(this).runAjax(function () {
			toBeUpdated.each(function () {
				var currentOrder = $(this).data("ordering");
				$(this).data("ordering", currentOrder + 1);
				$(this).attr("data-ordering", currentOrder + 1);
			});
		});
	});

	lQuery(".action-btn").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();

		var section = $(this).closest(".creator-section-content");
		var dataType = "componentcontent";
		if (!section.length > 0) {
			section = $(this).closest(".creator-section");
			dataType = "componentsection";
		}

		var action = $(this).data("action");

		if (action === "delete") {
			var msg = $(this).data("confirm");
			if (msg) {
				if (!confirm(msg)) {
					return;
				}
			}
			var dataid = $(this).data("id");
			var url = applink + "/components/smartcreator/section/delete.html";
			$.ajax({
				url: url,
				data: {
					searchtype: dataType,
					id: dataid,
				},
				success: function () {
					section.remove();
				},
			});
		} else if (action === "move-up" || action === "move-down") {
			var source_id = section.data("dataid");
			var source_order = section.data("ordering");
			if (!source_id) return;

			var url = applink + "/components/smartcreator/section/order.html";

			if (action === "move-up") {
				var target = section.prev();
				if (!target.length) return;
				var target_id = target.data("dataid");
				var target_order = target.data("ordering");

				$.ajax({
					url: url,
					data: {
						searchtype: dataType,
						source: source_id,
						sourceorder: source_order,
						target: target_id,
						targetorder: target_order,
					},
					success: function () {
						target.before(section);
						$(section).data("ordering", target_order);
						$(section).attr("data-ordering", target_order);
						$(target).data("ordering", source_order);
						$(target).attr("data-ordering", source_order);
					},
				});
			} else {
				var target = section.next();
				if (!target.length) return;
				var target_id = target.data("dataid");
				var target_order = target.data("ordering");

				$.ajax({
					url: url,
					data: {
						searchtype: dataType,
						source: source_id,
						sourceorder: source_order,
						target: target_id,
						targetorder: target_order,
					},
					success: function () {
						target.after(section);
						$(section).data("ordering", target_order);
						$(section).attr("data-ordering", target_order);
						$(target).data("ordering", source_order);
						$(target).attr("data-ordering", source_order);
					},
				});
			}
		}
	});

	lQuery(".section-rename").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var btn = $(this);
		btn.prop("disabled", true);
		var tutorialId = btn.data("tutorialid");
		var sectionId = btn.data("sectionid");
		var sectionEl = btn.closest(".creator-section-title");
		var newTitle = sectionEl.find("textarea").val();
		var url = applink + "/components/smartcreator/section/create-section.html";
		$.ajax({
			url: url,
			data: {
				sectionid: sectionId,
				tutorialid: tutorialId,
				name: newTitle,
			},
			success: function () {
				sectionEl.find("h3").text(newTitle);
				sectionEl.removeClass("edit-mode");
			},
			complete: function () {
				btn.prop("disabled", false);
			},
		});
	});

	lQuery(".creator-section-content").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		toggleContentEditor($(this));
	});

	lQuery(".creator-section-content.new-content").livequery(function () {
		$(this).removeClass("new-content");
		toggleContentEditor($(this));
	});

	function toggleContentEditor(component) {
		var editorEl = component.find(".editable-content");
		if (component.hasClass("paragraph")) {
			if (!editorEl.hasClass("ck")) {
				$(window).trigger("inlinehtmlstart", [editorEl]);
			}
		}
		if (component.hasClass("heading")) {
			console.log(component);
			var heading = editorEl.find("h1").text().trim();
			editorEl.data("originalcontent", editorEl.text());
			editorEl.html(
				`<textarea class="form-control heading-editor" rows="2">${heading}</textarea><br><button class="btn btn-primary content-h1-edit" data-contentcomponentid="">Save</button> <button class="btn btn-secondary content-h1-cancel">Cancel</button>`,
			);
			editorEl.find("textarea").focus();
		}
	}

	lQuery(".content-h1-edit").livequery("click", function (e) {
		var btn = $(this);
		btn.prop("disabled", true);
		var editorEl = btn.closest(".editable-content");
		var content = editorEl.find("textarea").val().trim();
		var componenttype = "heading";
		var componentcontentid = editorEl.data("componentcontentid");
		var url = editorEl.data("savepath");
		$.ajax({
			url: url,
			data: {
				content: content,
				componenttype: componenttype,
				componentcontentid: componentcontentid,
			},
			success: function () {
				editorEl.html(`<h1>${content}</h1>`);
			},
			complete: function () {
				btn.prop("disabled", false);
			},
		});
	});

	lQuery(".content-h1-cancel").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var editorEl = $(this).closest(".editable-content");
		var originalContent = editorEl.data("originalcontent");
		editorEl.html(`<h1>${originalContent}</h1>`);
	});

	lQuery(".section-edit").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		$(this).closest(".creator-section-title").addClass("edit-mode");
	});

	lQuery(".section-cancel").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		$(this).closest(".creator-section-title").removeClass("edit-mode");
	});

	lQuery(".aitutorial").livequery("click", function () {
		var playbackentityid = $(this).data("playbackentityid");
		var playbackentitymoduleid = $(this).data("playbackentitymoduleid");

		var chatterbox = $(this).closest(".chatterbox");
		chatterbox.data("playbackentityid", playbackentityid);
		chatterbox.data("playbackentitymoduleid", playbackentitymoduleid);

		$("#chatter-msg").val("Start Tutorial: " + $(this).data("tutorialname"));
		setTimeout(function () {
			$(".chatter-send").trigger("click");
			$(".ai-functions").remove();
		});
	});

	lQuery(".creator-nav a").livequery("click", function () {
		var container = $(this).closest(".creator-preview");
		var playbackentityid = container.data("playbackentityid");
		var playbackentitymoduleid = container.data("playbackentitymoduleid");

		var chatterbox = $(this).closest(".chatterbox");
		chatterbox.data("playbackentityid", playbackentityid);
		chatterbox.data("playbackentitymoduleid", playbackentitymoduleid);
		var playbacksection = $(this).data("ordering");
		chatterbox.data("playbacksection", playbacksection);

		var label = "";
		if ($(this).hasClass("prev")) {
			label = "Prev:";
		} else if ($(this).hasClass("next")) {
			label = "Next:";
		}
		label += $(this).text().trim();

		$("#chatter-msg").val(label);

		setTimeout(function () {
			$(".chatter-send").trigger("click");
			$(".ai-functions").remove();
		});
	});
});
