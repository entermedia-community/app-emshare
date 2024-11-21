$(function () {
	lQuery("form#themeeditor").livequery("submit", function (e) {
		e.preventDefault();
		var form = $(this);
		[
			"th",
			"td",
			"nav-btn",
			"nav-btn-active",
			"tab-btn",
			"tab-btn-active",
			"btn",
			"btn-sec",
			"btn-acc",
			"btn-cta",
		].forEach(function (inp) {
			var bg = $("input.color-picker." + inp).val();
			if (bg && bg.length === 7) {
				$("input.color-picker." + inp + "-hover").val(lightenHex(bg, 10));
			}
		});

		var td = $("input.td").val();
		if (td && td.length === 7) {
			$("input.td-stripe").val(lightenHex(td, -5));
		}

		["sidebar", "navbar-primary", "navbar-secondary"].forEach(function (inp) {
			var bg = $("input." + inp).val();
			if (bg && bg.length === 7) {
				$("input." + inp + "-text").val(contrastColor(bg));
			}
		});

		form.get(0).submit();
	});
});
