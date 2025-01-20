function isValidTarget(clickEvent) {
	var target = $(clickEvent.target);
	if (
		target.attr("noclick") == "true" ||
		target.is("input") ||
		target.is("a") ||
		target.closest(".jp-audio").length
	) {
		return false;
	}

	clickEvent.preventDefault();
	clickEvent.stopImmediatePropagation();

	return true;
}

//Not used? Or used in admin area?
lQuery(".emrowpicker table td").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}

	var clicked = $(this);

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

//OLD select table. Not used
lQuery(".emselectable table td").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}

	var clicked = $(this);

	var emselectable = clicked.closest("#emselectable");
	if (emselectable.length < 1) {
		emselectable = clicked.closest(".emselectable");
	}
	var row = clicked.closest("tr");
	var rowid = row.attr("rowid");

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
});

//CB This works. Opens entities
lQuery(".topmodules .resultsdivdata").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}
	var row = $(this);

	var clickableresultlist = row.closest(".clickableresultlist");

	var rowid = row.data("dataid");
	clickableresultlist.data("id", rowid);
	clickableresultlist.data("entityid", rowid);
	clickableresultlist.emDialog();
});

lQuery(".listofentities .resultsdivdata").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}

	var row = $(this);
	var clickableresultlist = row.closest(".clickopenentity");

	var rowid = row.data("dataid");
	var entitymoduleid = row.data("entitymoduleid");
	clickableresultlist.data(
		"url",
		`${apphome}/views/modules/${entitymoduleid}/editors/default/tabs/index.html`
	);
	clickableresultlist.data("id", rowid);
	clickableresultlist.data("entityid", rowid);
	clickableresultlist.emDialog();
});

//To open an entity in a submodule.
lQuery(".editdiv.pickersubmodules .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var row = $(this);

		var clickableresultlist = row.closest(".clickableresultlist");
		clickableresultlist.data("id", row.data("dataid")); //They picked an entity

		clickableresultlist.runAjax();
	}
);
//To open an entity in a submodule. CB Lose Back button
lQuery(".entitysubmodules .resultsdivdata").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}

	var row = $(this);

	var submoduleOpener = row.closest(".clickableresultlist");
	submoduleOpener.data("entityid", row.data("dataid"));
	submoduleOpener.runAjax();
});

//CB working. Uses edithome for searchcategory clicking
lQuery(".listsearchcategories .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var row = $(this);

		var searchId = row.data("dataid");
		var submoduleOpener = row.closest(".clickableresultlist");
		submoduleOpener.data("updateurl", true);
		submoduleOpener.data(
			"urlbar",
			`${submoduleOpener.data("url")}?searchcategoryid=${searchId}`
		);
		submoduleOpener.data("searchcategoryid", searchId);
		submoduleOpener.runAjax();
	}
);

//CB working for entity fieldpicking
lQuery(".pickerresults.pickerforfield .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var clickableresultlist = clicked.closest(".clickableresultlist");

		if (clickableresultlist.length) {
			clickableresultlist.data("dataid", rowid);
			clickableresultlist.runAjax();
			closeemdialog(clickableresultlist.closest(".modal"));
		}
	}
);

// CM-CB
// 2024-12-03
// working for asset pick an entity (Media Viewer)
lQuery(".pickerresults.assetpickentity .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var clickableresultlist = clicked.closest(".clickableresultlist");

		if (clickableresultlist.length) {
			clickableresultlist.data("dataid", rowid);
			clickableresultlist.runAjax(function () {
				closeemdialog(clicked.closest(".modal"));
			});
		}
	}
);

// CB
// 2024-12-04
// Upload To dialog
lQuery(".editdiv.pickerforuploading .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var clickableresultlist = clicked.closest(".clickableresultlist");

		if (clickableresultlist.length) {
			clickableresultlist.data("entityid", rowid);
			clickableresultlist.emDialog(function () {
				closeemdialog(clicked.closest(".modal"));
			});
		}
	}
);

// CM: 2024-12-17
// Picker Folder (Category Tree) for Asset (Media Viewer)
lQuery(".pickerresults.pickercategorytree .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);
		var rowid = clicked.data("dataid");
		var clickableresultlist = clicked.closest(".clickableresultlist");

		if (clickableresultlist.length) {
			clickableresultlist.data("categoryid", rowid);
			clickableresultlist.runAjax();
			closeemdialog(clickableresultlist.closest(".modal"));
		}
	}
);

//CB: assign a asset to a field
lQuery(".pickerresults.pickerpickasset .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var editdiv = clicked.closest(".editdiv");

		if (editdiv.length) {
			var pickertarget = editdiv.data("pickertargetfield");
			pickertarget = $("#" + pickertarget); //This is the field itself
			if (pickertarget.length > 0) {
				var detailid = pickertarget.data("detailid");
				$("#" + detailid + "-value").attr("value", rowid);
				$("#" + detailid + "-preview").load(
					apphome +
						"/components/xml/types/assetpicker/preview.html?oemaxlevel=1&assetid=" +
						rowid,
					function () {}
				);
			}
			closeemdialog(clicked.closest(".modal"));
		}
	}
);

//http://einnovation.local.org:8080/site/blockfind/views/modules/asset/editors/oipickasset/index.html
lQuery(".pickerresults.oipickasset .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var assetid = row.data("dataid");
		var sourcepath = row.data("sourcepath");

		var mediadb = $("#application").data("mediadbappid");

		var url =
			"/" +
			mediadb +
			"/services/module/asset/downloads/vieworiginal/" +
			sourcepath;

		$(window).trigger("assetpicked", [url]);
	}
);

//CB: Is good. for submodules
lQuery(".pickerresults.entitypickersubmodule .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = clicked.closest(".resultsdivdata");
		var rowid = row.data("dataid");
		var editdiv = clicked.closest(".editdiv");

		if (editdiv.length) {
			var options = editdiv.cleandata();
			var clickurl = editdiv.data("clickurl");
			options.oemaxlevel = 1;
			options.id = rowid;
			var pickertarget = editdiv.data("targetdiv");
			pickertarget = $("#" + pickertarget);
			if (clickurl !== undefined && clickurl != "") {
				jQuery.ajax({
					url: clickurl,
					data: options,
					success: function (data) {
						var entity = $(".entitydialog");
						//autoreload(entity);
						$(window).trigger("autoreload", [entity]);
						//pickertarget.replaceWith(data);
					},
				});
			}
			closeemdialog(clicked.closest(".modal"));
		}
	}
);

//CB: Good assign a searchcategory to some selected entities
lQuery(".pickerresults.picksearchcategory .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".clickableresultlist");
		pickerresults.data("id", rowid);

		pickerresults.runAjax(function () {
			//Chain
			closeemdialog(clicked.closest(".modal"));
			//Reload parent
		});
	}
);

lQuery(".editdiv.pickercopycategoryto .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");
		var clickurl = pickerresults.data("clickurl");
		var options = pickerresults.cleandata();
		options.oemaxlevel = 1;
		options.id = rowid;
		$(window).trigger("showToast", [pickerresults]);
		var toastUid = pickerresults.data("uid");
		jQuery.ajax({
			url: clickurl,
			data: options,
			success: function (data) {
				//show toast or reload page or both
				$(window).trigger("successToast", toastUid);
				closeemdialog(clicked.closest(".modal"));
			},
		});
	}
);

//CB: Good assign assets to a selected entity
lQuery(".editdiv.entitypickerassets .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");
		var clickurl = pickerresults.data("clickurl");
		var options = pickerresults.cleandata();
		options.oemaxlevel = 1;
		options.id = rowid;
		$(window).trigger("showToast", [pickerresults]);
		var toastUid = pickerresults.data("uid");
		jQuery.ajax({
			url: clickurl,
			data: options,
			success: function () {
				$(window).trigger("successToast", toastUid);
				closeemdialog(clicked.closest(".modal"));
			},
		});
	}
);

//Upload to Entity. Still needed?
/*
lQuery(".pickerresults.pickandupload .resultsdivdata").livequery(
	"click",
	function (e) {
		if (!isValidTarget(e)) {
			return true;
		}

		var clicked = $(this);

		var row = $(clicked.closest(".resultsdivdata"));
		var rowid = row.data("dataid");
		var pickerresults = clicked.closest(".pickerresults");
		var options = pickerresults.data();
		options.id = rowid;
		if (pickerresults.length) {
			//console.log(pickerresults);
			pickerresults.emDialog();
		}
	}
);
*/


lQuery(".orderpending .resultsdivdata").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}
	var row = $(this);

	var clickableresultlist = row.closest(".clickableresultlist");

	var rowid = row.data("dataid");
	clickableresultlist.data("id", rowid);
	clickableresultlist.data("entityid", rowid);
	clickableresultlist.emDialog();
});

lQuery(".orderuserlist .resultsdivdata").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}
	var row = $(this);

	var clickableresultlist = row.closest(".clickableresultlist");

	var rowid = row.data("dataid");
	clickableresultlist.data("id", rowid);
	clickableresultlist.data("entityid", rowid);
	clickableresultlist.emDialog();
});




//Assets or Categories and you import into a entity
lQuery(".pickerresultscopy .resultsdivdata").livequery("click", function (e) {
	if (!isValidTarget(e)) {
		return true;
	}

	var clicked = $(this);

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
				closeemdialog(clicked.closest(".modal"));
			},
		});
	}
});

//Not used?
$(window).on(
	"updatepickertarget",
	function (e, pickertargetid, dataid, dataname) {
		var pickertarget = $("#" + pickertargetid);
		if (pickertarget.length > 0) {
			updateentityfield(pickertarget, dataid, dataname);
		}
	}
);

//not used?
updateentityfield = function (pickertarget, id, name) {
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
