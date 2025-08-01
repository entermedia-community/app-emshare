$(document).ready(function () {
	$(window).on("resize", function () {
		var userAgent = navigator.userAgent;
		window.isNarrow =
			$(window).width() <= 768 || /Android|iPhone|iPad|iPod/.test(userAgent);
		if (!isNarrow) {
			if (confirm("Switch to desktop view?")) {
				window.location.reload();
			}
		}
	});
	lQuery(".entity-tab.current-entity").livequery(function (e) {
		$(this).scrollLeft(0);
	});
});
