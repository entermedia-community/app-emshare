$(document).ready(function () {
	lQuery("#aiInstruction").livequery(function () {
		var value = $(this).val();
		value = value.replace(/^\s+/gm, "");
		value = value.replace(/ +/gm, " ");
		$(this).val(value);
	});
});
