$(document).ready(function () {
	function getCommaSeparatedList(value) {
		if (!value) return;
		var values = Array.isArray(value) ? value : value.split(",");
		if (values.length === 0) return;
		value = values.join(", ");
		if (values.length > 1) {
			var pos = value.lastIndexOf(", ");
			value =
				value.substring(0, pos) +
				(values.length > 2 ? "," : "") +
				" and " +
				value.substring(pos + 2);
		}
		return value;
	}
	lQuery("#aiInstruction").livequery(function () {
		var value = $(this).val();
		value = value.replace(/^\s+/gm, "");
		value = value.replace(/ +/gm, " ");
		$(this).val(value);
	});
	var promptBuilder = {
		aitarget: "",
		aicontentlist: "",
		aistyle: "",
		aiexamples: "",
	};
	lQuery(".updateaiimagetemplate").livequery(function () {
		if ($(this).hasClass("customized")) {
			return;
		}
		$(this).find("input[name='aitarget.value']").trigger("input");
		$(this).find("select[name='aicontentlist.value']").trigger("change");
		$(this).find("select[name='aistyle.values']").trigger("change");
		$(this).find("input[name='aiexamples.value']").trigger("input");
	});
	lQuery(".updateaiimagetemplate input[name='aitarget.value']").livequery(
		"input",
		function () {
			var value = $(this).val();
			if (!value) return;
			promptBuilder.aitarget = value;
			updatePrompt();
		}
	);
	lQuery(".updateaiimagetemplate select[name='aicontentlist.value']").livequery(
		"change",
		function () {
			var value = $(this).val();
			promptBuilder.aicontentlist = getCommaSeparatedList(value);
			updatePrompt();
		}
	);
	lQuery(".updateaiimagetemplate select[name='aistyle.values']").livequery(
		"change",
		function () {
			var value = $(this).val();
			var options = {};
			$(this)
				.find("option")
				.each(function () {
					options[$(this).attr("value")] = $(this).text();
				});
			var values = Array.isArray(value) ? value : value.split(",");
			values = values.map((val) => {
				return options[val];
			});
			promptBuilder.aistyle = getCommaSeparatedList(values);
			updatePrompt();
		}
	);
	lQuery(".updateaiimagetemplate input[name='aiexamples.value']").livequery(
		"input",
		function () {
			var value = $(this).val();
			if (!value) return;
			promptBuilder.aiexamples = value;
			updatePrompt();
		}
	);

	function updatePrompt() {
		//updateaiimagetemplate
		
		var prompt = `Create a picture of ${
			promptBuilder.aitarget || "[[TARGET]]"
		}.`;
		if (promptBuilder.aicontentlist) {
			prompt += ` It has ${promptBuilder.aicontentlist}.`;
		}
		if (promptBuilder.aistyle) {
			prompt += ` It is ${promptBuilder.aistyle}.`;
		}
		if (promptBuilder.aiexamples) {
			prompt += ` Similar to ${promptBuilder.aiexamples}.`;
		}
		$("#aiInstruction").val(prompt);
	}

	var mediadb = "/" + $("#application").data("mediadbappid");
	lQuery("form.contentpickerForm").livequery("submit", function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
		var form = $(this);

		if (!form.hasClass("novalidate")) {
			if (form.validate) {
				try {
					form.validate({
						ignore: ".ignore",
					});
					var isvalidate = form.valid();
					if (!isvalidate) {
						//e.preventDefault();
						return this;
					}
				} catch (_e) {
					console.log(_e);
				}
			}
		}

		var formData = new FormData(this);
		jQuery.ajax({
			type: "POST",
			url: `${mediadb}/services/module/contentcreator/createNewImageRequest`,
			data: formData,
			processData: false,
			contentType: false,
			success: function (res) {
				$(window).trigger("checkautoreload", [form]);
				var assetid = res.data.primarymedia?.id;
				if (!assetid) {
					alert("No asset created");
					return;
				}
				var pickertarget = form.data("pickertargetfield");
				if (pickertarget) {
					pickertarget = $("#" + pickertarget); //This is the field itself
					if (pickertarget.length > 0) {
						var detailid = pickertarget.data("detailid");
						$("#" + detailid + "-value").attr("value", assetid);
						$("#" + detailid + "-preview").load(
							apphome +
								"/components/xml/types/assetpicker/preview.html?oemaxlevel=1&assetid=" +
								assetid,
							function () {}
						);
					}
				}
				//reset variable:
				promptBuilder.aitarget = '';
				promptBuilder.aicontentlist = '';
				promptBuilder.aistyle = '';
				promptBuilder.aiexamples = '';
				
				closeemdialog(form.closest(".modal"));
			},
		});
	});
});
