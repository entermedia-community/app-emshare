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
		var action = $(this).data("action");
		console.log(action);
		if (action === "edit") {
			var editor = $(this)
				.closest(".creator-section-content")
				.find(".editable-content");
			editor.data("imagepickerhidden", "true");
			$(window).trigger("inlinehtmlstart", [editor]);
		} else if (action === "move-up" || action === "move-down") {
			var section = $(this).closest(".creator-section-content");
			if (!section.length > 0) {
				section = $(this).closest(".creator-section");
			}
			if (action === "move-up") {
				section.prev().before(section);
			} else {
				section.next().after(section);
			}

			// TODO: Update the section order in the backend
		}
	});
	// var $a = $(
	// 	'<a href="/site/find/components/smartcreator/index.html" class="emdialog" data-oemaxlevel="1" data-tutorialid="AZu-haHOtKTCl_ZN-pzS"></a>'
	// );
	// $(document.body).append($a);
	// $a.trigger("click");

	$("#closecreator").on("click", function () {
		console.log("object");
		closeemdialog($(this).closest(".modal"));
	});
});
