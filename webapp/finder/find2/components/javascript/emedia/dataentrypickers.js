lQuery(".emrowpicker table td").livequery("click", function (event) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			return true;
		}
		if ($(event.target).is("input") || $(event.target).is("a")) {
			return true;
		}

		event.preventDefault();
		var row = clicked.closest("tr");
		var table = clicked.closest("table");
		var form = clicked.closest(".pickedcategoryform");

		var existing = row.hasClass("emrowselected");
		if (!form.hasClass("emmultivalue")) {
			$("tr", table).removeClass("emrowselected");
		}
		row.toggleClass("emrowselected");
		var id = row.data("id");

		$(".emselectedrow", form).each(function () {
			if (form.hasClass("emmultivalue")) {
				var old = $(this).val();
				if (old) {
					if (existing) {
						// removing the value
						old = old.replace(id, "");
						old = old.replace("||", "|");
					} else {
						old = old + "|" + id;
					}
				} else {
					old = id;
				}
				$(this).val(old);
			} else {
				$(this).val(id);
			}
		});

		form.trigger("submit");

		if (form.hasClass("autoclose")) {
			closeemdialog(form.closest(".modal"));
		}
	});

	lQuery(".emselectable table td").livequery("click", function (event) {
		var clicked = $(this);
		if (clicked.attr("noclick") == "true") {
			return true;
		}
		if ($(event.target).is("input")) {
			return true;
		}
		if ($(event.target).is("a")) {
			return true;
		}
		if ($(event.target).hasClass("jp-audio")) {
			return true;
		}

		var emselectable = clicked.closest("#emselectable");
		if (emselectable.length < 1) {
			emselectable = clicked.closest(".emselectable");
		}
		var row = $(clicked.closest("tr"));
		var rowid = row.attr("rowid");

		if (row.hasClass("thickbox")) {
			var href = row.data("href");
			openFancybox(href);
		} else {
			emselectable.find("table tr").each(function (index) {
				clicked.removeClass("emhighlight");
			});
			row.addClass("emhighlight");
			row.removeClass("emborderhover");
			var table = row.closest("table");

			// var url = emselectable.data("clickpath");

			var url = table.data("clickpath");
			var form = emselectable.find("form");
			if (!form.length) {
				form = emselectable.data("emselectableform");
				if (form) {
					form = $("#" + form);
				}
			}
			var data = row.data();

			if (form && form.length > 0) {
				data.id = rowid;
				data.oemaxlevel = form.data("oemaxlevel");
				form.find("#emselectedrow").val(rowid);
				form.find(".emneedselection").each(function () {
					clicked.removeAttr("disabled");
				});
				//form.submit();
				var targetdiv = form.data("targetdiv");
				/*if ((typeof targetdiv) != "undefined") {
					$(form).ajaxSubmit({
						target : "#" + $.escapeSelector(targetdiv), 
						data:data
						
					});
				} else {
					*/
				$(form).trigger("submit");
				//}
				if (form.hasClass("autoclose")) {
					closeemdialog(form.closest(".modal"));
				}
			} else if (url != undefined) {
				//-- table clickpath
				if (url == "") {
					return true;
				}
				var link = url;
				var post = table.data("viewpostfix");
				if (post != undefined) {
					link = link + rowid + post;
				} else {
					link = link + rowid;
				}
				if (emselectable.hasClass("showmodal")) {
					showmodal(emselectable, link);
				} else {
					parent.document.location.href = link;
				}
			}
		}
	});

	lQuery(".assetpickerselectrow").livequery("click", function () {
		var assetid = $(this).data("assetid");
		jQuery("#" + targetdiv).attr("value", assetid);

		//Todo: Integrte with emselectable
		var emselectable = $(this).closest(".emselectable");

		var launcher = emselectable.data("launcher");
		launcher = $("#" + launcher);
		if (launcher.length) {
			var options = launcher.data();
			options.assetid = assetid;

			var clickurl = launcher.data("clickurl");
			if (clickurl && clickurl != "") {
				var targetdiv = launcher.data("targetdiv");
				if (targetdiv !== undefined) {
					jQuery.ajax({
						url: clickurl,
						data: options,
						success: function (data) {
							if (!targetdiv.jquery) {
								targetdiv = $("#" + targetdiv);
							}
							targetdiv.replaceWith(data);
							closeemdialog(emselectable.closest(".modal"));
						},
					});
				}
				return;
			}
		}
	});
	
	//CB This works. Opens entities
	lQuery(".topmodulecontainer .resultsdivdata").livequery(
		"click",
		function (event) {
			event.stopPropagation();
			var row = $(this);
			console.log(row);
			if (!handleclick(row)) {
				return true;
			}

			var emselectable = row.closest(".emselectablemodule");

			var rowid = row.data("dataid");

			var targetlink = emselectable.data("targetlink");

			if (emselectable.hasClass("emselectablemodule_order")) {
				//Order Module
				var targetdiv = emselectable.data("targetdiv");
				if (targetlink && targetlink != "") {
					targetlink +=
						(targetlink.indexOf("?") >= 0 ? "&" : "?") + "id=" + rowid;

					$.ajax({
						url: targetlink,
						data: { oemaxlevel: "2" },
						success: function (data) {
							$("#" + targetdiv).replaceWith(data);
							jQuery(window).trigger("resize");
						},
					});
				}
			} else {
				//All entities
				if (targetlink && targetlink != "") {
					targetlink +=
						(targetlink.indexOf("?") >= 0 ? "&" : "?") + "id=" + rowid;
					row.data("targetlink", targetlink);
					row.data("oemaxlevel", "2");
					if (emselectable.data("tabletype") == "subentity") {
						row.data("targetrendertype", "entity");
						row.data("oemaxlevel", "1");
					}
					row.data("id", rowid);
					row.data("hitssessionid", emselectable.data("hitssessionid"));
					row.data("updateurl", true);
					var urlbar =
						apphome +
						"/views/modules/" +
						emselectable.data("searchtype") +
						"/index.html?entityid=" +
						rowid;
					row.data("urlbar", urlbar);
					row.emDialog();
				}
			}
		}
	);

	//To open an entity in a submodule. CB Lose Back button
	lQuery(".submodulepicker .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}

			var emselectable = clicked.closest(".emselectablemodule");

			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");

			var targetlink = emselectable.data("targetlink");

			if (targetlink && targetlink != "") {
				targetlink +=
					(targetlink.indexOf("?") >= 0 ? "&" : "?") + "id=" + rowid;
				row.data("targetlink", targetlink);
				row.data("oemaxlevel", "2");
				if (emselectable.data("tabletype") == "subentity") {
					row.data("targetrendertype", "entity");
					row.data("oemaxlevel", "1");
				}
				row.data("id", rowid);
				row.data("hitssessionid", emselectable.data("hitssessionid"));
				row.data("updateurl", true);
				var urlbar =
					apphome +
					"/views/modules/" +
					emselectable.data("searchtype") +
					"/index.html?entityid=" +
					rowid;
				row.data("urlbar", urlbar);
				row.emDialog();
			}
		}
	);

	//CB working
	lQuery(".pickerresults.pickerforfield .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");
			var pickerresults = clicked.closest(".pickerresults");

			if (pickerresults.length) {
				//Entity Picker Field
				var pickertarget = pickerresults.data("pickertargetfield");
				pickertarget = $("#" + pickertarget);
				if (pickertarget.length > 0) {
					updateentityfield(pickertarget, rowid, row.data("rowname"));
				}
				closeemdialog(pickerresults.closest(".modal"));
			}
		}
	);

	//CB: Is good. for submodules
	lQuery(".pickerresults.entitypickersubmodule .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));  //?
			var rowid = row.data("dataid");
			var resultsdiv = clicked.closest(".resultsdiv");

			if (resultsdiv.length) {
				var pickerresults = clicked.closest(".pickerresults");
				var clickurl = pickerresults.data("clickurl");
				var options = resultsdiv.cleandata();
				options.oemaxlevel=1;
				options.id = rowid;
				var pickertarget = pickerresults.data("targetdiv");
				pickertarget = $("#" + pickertarget);
				if (clickurl !== undefined && clickurl != "") {
					jQuery.ajax({
						url: clickurl,
						data: options,
						success: function (data) {
							
							var entity = $(".entitydialog");
							autoreload(entity);
							//pickertarget.replaceWith(data);
						},
					});
				}
				closeemdialog(clicked.closest(".modal"));
			}
		}
	);

	//CB: assign a searchcategory to some selected entities 
	lQuery(".pickerresults.picktosearchcategory .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");
			var pickerresults = clicked.closest(".pickerresults");
			var clickurl = pickerresults.data("clickurl");
			var options = pickerresults.cleandata();
			options.oemaxlevel=1;
			options.id = rowid;
			$(window).trigger("showToast", [pickerresults]);
			var toastUid = pickerresults.data("uid");
			jQuery.ajax({
				url: clickurl,
				data: options,
				success: function (data) {
					//show toast or reload page or both	
					pickerresults.data("uid", toastUid);
					$(window).trigger("successToast", [pickerresults]);
			
				},
			});
			closeemdialog(clicked.closest(".modal"));
		}
	);


	//Upload to Entity
	lQuery(".pickerresults.pickandupload .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");
			var pickerresults = clicked.closest(".pickerresults");
			var options = pickerresults.data();
			options.id = rowid;
			if (pickerresults.length) {
				console.log(pickerresults);
				pickerresults.emDialog();
			}
		}
	);
	
	//Assets or Categories and you import into a entity
	lQuery(".pickerresultscopy .resultsdivdata").livequery(
		"click",
		function (event) {
			var clicked = $(this);
			if (!handleclick(clicked)) {
				return true;
			}
			var row = $(clicked.closest(".resultsdivdata"));
			var rowid = row.data("dataid");
			var pickerresults = clicked.closest(".pickerresults");

			var options = pickerresults.data();
			options.id = rowid;
			var clickurl = pickerresults.data("clickurl");
			var targetdiv = pickerresults.data("clicktargetdiv");
			var targettype = pickerresults.data("targettype");

			if (clickurl !== undefined && clickurl != "") {
				jQuery.ajax({
					url: clickurl,
					data: options,
					success: function (data) {
						if (!targetdiv.jquery) {
							targetdiv = $("#" + targetdiv);
						}
						if (targettype == "message") {
							if (targetdiv !== undefined) {
								targetdiv.prepend(data);
								targetdiv.find(".fader").fadeOut(3000, "linear");
							}
						} else {
							//regular targetdiv
							if (targetdiv !== undefined) {
								targetdiv.replaceWith(data);
							}
						}

						closeemdialog(pickerresults.closest(".modal"));
					},
				});
			}
		}
	);


								

	function handleclick(clicked) {
		if (clicked.attr("noclick") == "true") {
			return false;
		}
		if ($(event.target).is("input")) {
			return false;
		}
		if ($(event.target).is("a")) {
			return false;
		}
		if ($(event.target).closest(".jp-audio").length) {
			return false;
		}
		return true;
	}

	$(window).on(
		"updatepickertarget",
		function (event, pickertargetid, dataid, dataname) {
			var pickertarget = $("#" + pickertargetid);
			if (pickertarget.length > 0) {
				updateentityfield(pickertarget, dataid, dataname);
			}
		}
	);

	updateentityfield = function (pickertarget, id, name) {
		if (pickertarget.hasClass("assetpicker")) {
			//Asset  Picker
			var detailid = pickertarget.data("detailid");
			$("#" + detailid + "-value").attr("value", id);
			$("#" + detailid + "-preview").load(
				apphome +
					"/components/xml/types/assetpicker/preview.html?oemaxlevel=1&assetid=" +
					id,
				function () {}
			);
		} else {
			var template = $("#pickedtemplateREPLACEID", pickertarget).html(); //clone().appendTo(pickertarget);
			var newcode = template.replaceAll("REPLACEID", id);
			newcode = newcode.replaceAll("REPLACEFIELDNAME", "");
			var ismulti = pickertarget.data("ismulti");
			if (ismulti == undefined || !ismulti) {
				//clear others
				pickertarget.find("li:not(#pickedtemplateREPLACEID)").remove();
			}
			pickertarget.prepend("<li>" + newcode + "</li>");
			var newrow = pickertarget.find("li:first");
			newrow.attr("id", id);
			newrow.find("a:first").text(name);
			newrow.show();
		}
	};

	showmodal = function (emselecttable, url) {
		trackKeydown = true;
		var id = "modals";
		var modaldialog = $("#" + id);
		var width = emselecttable.data("dialogwidth");
		if (modaldialog.length == 0) {
			$("#emcontainer").append(
				'<div class="modal " tabindex="-1" id="' +
					id +
					'" style="display:none" ></div>'
			);
			modaldialog = $("#" + id);
		}

		var options = emselecttable.data();
		modaldialog.load(url, options, function () {
			$(".modal-lg").css("min-width", width + "px");
			modaldialog.modal({
				keyboard: true,
				backdrop: true,
				show: true,
			});

			var title = emselecttable.data("dialogtitle");
			if (title) {
				$(".modal-title", modaldialog).text(title);
			}

			$("form", modaldialog).find("*").filter(":input:visible:first").focus();
		});
	};
