$(document).ready(function () {
	var applink =
		$("#application").data("siteroot") + $("#application").data("apphome");

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
						$(section).data("ordering", target_order);
						$(section).attr("data-ordering", target_order);
						$(target).data("ordering", source_order);
						$(target).attr("data-ordering", source_order);
					},
				});
			}
		}
	});

	lQuery(".creator-section-content").livequery("click", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		var editorEl = $(this).find(".editable-content");
		if (!editorEl.hasClass("ck")) {
			$(window).trigger("inlinehtmlstart", [editorEl]);
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
