$(document).ready(function () {
	var applink =
		$("#application").data("siteroot") + $("#application").data("apphome");

	lQuery(".creator-maker").livequery("click", function (e) {
		var editor = $(this).find(".editable-content.ck");
		if (editor.length > 0) {
			var clickedElement = $(e.target);
			if (
				!clickedElement.closest(".editable-content.ck").length &&
				!clickedElement.closest(".ck-toolbar").length
			) {
				e.preventDefault();
				e.stopImmediatePropagation();
				customToast(
					"You have unsaved changes. Please save or cancel your current edit.",
					{ id: "alert", positive: false }
				);
				editor.focus();
				return false;
			}
		}
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

		if (action === "edit") {
			var editor = $(this)
				.closest(".creator-section-content")
				.find(".editable-content");
			$(window).trigger("inlinehtmlstart", [editor]);
		} else if (action === "delete") {
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
				if (!target) return;
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
					},
				});
			} else {
				var target = section.next();
				if (!target) return;
				var source_id = target.data("dataid");
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
					},
				});
			}

			// TODO: Update the section order in the backend
		}
	});

	lQuery(".creator-section-content").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var editor = $(this).find(".editable-content");
		if (!editor.hasClass("ck")) {
			$(window).trigger("inlinehtmlstart", [editor]);
		}
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

	// var $a = $(
	// 	'<a href="/site/find/components/smartcreator/index.html" class="emdialog" data-oemaxlevel="1" data-tutorialid="AZvHpBlhg8ry2CWCtU8N"></a>'
	// );
	// $(document.body).append($a);
	// $a.trigger("click");

	lQuery("#closecreator").livequery("click", function () {
		closeemdialog($(this).closest(".modal"));
	});
});
