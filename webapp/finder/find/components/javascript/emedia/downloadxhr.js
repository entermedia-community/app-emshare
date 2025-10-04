jQuery(document).ready(function () {
	var siteroot = $("#application").data("siteroot");
	var mediadb = $("#application").data("mediadbappid");
	var isDesktop = $("#application").data("desktop");
	var downloaded = {};

	function checkForPendingDownloads() {
		$("#triggerpendingdownloads").remove();
		var url = siteroot + "/" + mediadb + "/services/module/order/downloadqueue";
		jQuery.ajax({
			dataType: "json",
			url: url,
			success: function (json) {
				var queue = json.downloadqueue;
				if (!queue || queue.length == 0) {
					return;
				}
				for (var i = 0; i < queue.length; i++) {
					var item = queue[i];
					if (item.orderid) {
						var filename =
							new Date().toString().substring(0, 24).replace(/:/g, "-") +
							".zip";
						var url =
							siteroot +
							"/" +
							mediadb +
							"/services/module/order/zip/" +
							filename +
							"?orderid=" +
							item.orderid;
						downloadDirectly(item.orderid, url, filename, true);
					} else if (item.url) {
						downloadDirectly(item.id, item.url, item.filename);
					}
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(
					"Error loading queue make sure mediadb points to finder",
					errorThrown
				);
				return false;
			},
		});
	}

	lQuery("#triggerpendingdownloads").livequery(function () {
		setTimeout(checkForPendingDownloads, 1000);
	});

	function downloadDirectly(id, url, filename, isZip = false) {
		//console.log({ id, url, filename, isZip });
		if (downloaded[id]) return;
		downloaded[id] = true;

		if (isZip) {
			triggerDownload(id, url, filename);
		} else {
			var completeUrl =
				siteroot +
				"/" +
				mediadb +
				"/services/module/order/updateorderitemstatus?orderitemid=" +
				id +
				"&publishstatus=complete&publisheddate=" +
				new Date().toISOString();

			$.ajax({
				url: encodeURI(completeUrl),
				success: function () {
					console.log(id, url, filename);
					triggerDownload(id, url, filename);
				},
				error: function () {
					downloaded[id] = false;
				},
			});
		}
	}

	function triggerDownload(id, url, filename) {
		var a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		var toastId = filename.replace(/[^a-zA-Z0-9]/g, "_");
		customToast(`Download${isDesktop ? "ing" : "ed"} ${filename}!`, {
			id: toastId,
			loading: isDesktop,
		});

		setTimeout(function () {
			$(window).trigger("autoreload", [$("#userdownloadlist")]);
		}, 1000);
	}

	lQuery(".abortdownloadorder").livequery("click", function (e) {
		var orderid = $(this).data("orderid");
		downloaded[orderid] = true;

		$.ajax({
			url:
				siteroot +
				"/" +
				mediadb +
				"/services/module/order/orderchangestatus?orderstatus=canceled&downloadstatus=canceled&orderid=" +
				orderid,
			success: function () {
				$(window).trigger("autoreload", [$("#userdownloadlist")]);
			},
		});
	});
});
