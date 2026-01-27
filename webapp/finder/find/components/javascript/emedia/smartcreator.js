$(document).ready(function () {
	var applink =
		$("#application").data("siteroot") + $("#application").data("apphome");

	var mediadb = $("#application").data("mediadbappid");

	lQuery(".opensmartcreator").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		closeemdialog($("#entitydialog"));
		$(this).emDialog();
	});

	lQuery("#closecreator").livequery("click", function () {
		var activeEditor = $(".editable-content.ck");
		if (activeEditor.length > 0) {
			if (
				!confirm("You have unsaved changes. Are you sure you want to close?")
			) {
				return;
			}
		}
		closeemdialog($(this).closest(".modal"));
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
			var url = $(this).attr("href");
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

			var url = $(this).attr("href");

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
		var sectionEl = btn.closest(".creator-section-title");
		var newTitle = sectionEl.find("textarea").val();

		var data = btn.data();
		data.name = newTitle;

		var url = btn.attr("href");

		$.ajax({
			url: url,
			data: {
				...data,
			},
			method: "POST",
			success: function () {
				sectionEl.find("h3").text(newTitle);
			},
			complete: function () {
				btn.prop("disabled", false);
				sectionEl.removeClass("edit-mode");
			},
		});
	});

	lQuery(".creator-section-content").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		makeContentEditable($(this));
	});

	lQuery(".creator-section-content.new-content").livequery(function () {
		$(this).removeClass("new-content");
		makeContentEditable($(this));
	});

	function makeContentEditable(component) {
		var editorEl = component.find(".editable-content");
		if (component.hasClass("paragraph")) {
			if (!editorEl.hasClass("ck")) {
				editorEl.data("imagepickerhidden", true);
				$(window).trigger("inlinehtmlstart", [editorEl]);
			}
			return;
		}
		component.addClass("edit-mode");
		if (component.hasClass("heading")) {
			var heading = editorEl.find("h1").text().trim();
			editorEl.data("originalcontent", editorEl.text());
			editorEl.html(
				`<textarea class="form-control heading-editor" rows="2">${heading}</textarea><br><button class="btn btn-primary content-h1-edit">Save</button> <button class="btn btn-secondary content-h1-cancel">Cancel</button>`,
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
				editorEl.closest(".creator-section-content").removeClass("edit-mode");
			},
		});
	});

	lQuery(".content-h1-cancel").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var editorEl = $(this).closest(".editable-content");
		var originalContent = editorEl.data("originalcontent");
		editorEl.html(`<h1>${originalContent}</h1>`);
		editorEl.closest(".creator-section-content").removeClass("edit-mode");
	});

	lQuery(".content-img-save").livequery("click", function (e) {
		e.preventDefault();
		var form = $(this).closest("form");
		form.ajaxFormSubmit(function () {
			form.closest(".creator-section-content").removeClass("edit-mode");
		});
	});

	lQuery(".content-img-cancel").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		$(this).closest(".creator-section-content").removeClass("edit-mode");
	});

	lQuery(".content-mcq-save").livequery("click", function (e) {
		e.preventDefault();
		var form = $(this).closest("form");
		form.ajaxFormSubmit(function () {
			form.closest(".creator-section-content").removeClass("edit-mode");
		});
	});

	lQuery(".content-mcq-cancel").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		$(this).closest(".creator-section-content").removeClass("edit-mode");
		// $(this)
		// 	.closest("form")
		// 	.find("textarea,input,select")
		// 	.each(function () {
		// 		if ($(this).val().trim() === "") {
		// 			$(this).insertBefore(`<p class="text-muted">Not set</p>`);
		// 		}
		// 	});
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

	lQuery(".ai-action").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var contentEl = $(this).closest(".creator-section-content");
		var dataEl = contentEl.find(".editable-content");
		var componentId = dataEl.data("componentcontentid");
		var action = $(this).data("action");
		var aiprompt;
		if (action === "generate") {
			//TODO: modal to get prompt from user
			aiprompt = prompt("Enter a prompt for the AI to generate content:");
			if (!aiprompt) {
				return;
			}
		} else if (action === "image") {
			//TODO: modal to get prompt from user
			aiprompt = prompt("Enter a prompt for the AI to generate an image:");
			if (!aiprompt) {
				return;
			}
		} else if (action === "caption") {
			var assetInput = dataEl.find('input[name="assetid.value"]');
			var assetId = assetInput.val();
			if (!assetId) {
				customToast("Please select an image first.", { positive: false });
				return;
			}
		}
		runComponentAiAction(
			{
				aiaction: action,
				aiprompt: aiprompt,
				componentcontentid: componentId,
			},
			function (data) {
				if (data.paragraph) {
					dataEl.html(data.paragraph);
					makeContentEditable(contentEl);
				} else if (data.caption) {
					contentEl.find('textarea[name="caption.value"]').val(data.caption);
					makeContentEditable(contentEl);
				} else if (data.assetid) {
				}
			},
		);
	});
	function runComponentAiAction(data, callback) {
		$.ajax({
			url: `/${mediadb}/services/module/creatoraiaction/create.json`,
			method: "POST",
			data: data,
			success: function (res) {
				var data = res.data;
				if (!data || data.length === 0) {
					customToast("No response from AI service.", { positive: false });
					return;
				}
				callback(data);
			},
			error: function () {
				customToast("Error processing AI action.", { positive: false });
			},
		});
	}
});
