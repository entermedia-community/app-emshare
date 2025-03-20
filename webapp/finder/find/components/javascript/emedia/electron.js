jQuery(document).ready(function () {
	var app = $("#application");
	var siteroot = app.data("siteroot");
	var mediadb = app.data("mediadbappid");
	var apphome = app.data("apphome");
	var downloadInProgress = {};
	const { ipcRenderer } = require("electron");

	var entermediakey = "";
	if (app && app.data("entermediakey") != null) {
		entermediakey = app.data("entermediakey");
	}

	var headers = { "X-tokentype": "entermedia", "X-token": entermediakey };

	ipcRenderer.send("setConnectionOptions", {
		headers: headers,
		key: entermediakey,
		mediadb:
			window.location.protocol + "//" + window.location.host + "/" + mediadb,
	});

	ipcRenderer.on("set-local-root", (_, localRoot) => {
		app.data("local-root", localRoot);
	});

	ipcRenderer.on("electron-log", (_, ...log) => {
		console.log("Desktop ▼");
		if (Array.isArray(log)) {
			log.forEach((l) => {
				console.log(l);
			});
		} else {
			console.log(log);
		}
	});

	ipcRenderer.on("electron-error", (_, ...error) => {
		console.log("Desktop ▼");
		if (Array.isArray(error)) {
			error.forEach((l) => {
				console.error(l);
			});
		} else {
			console.error(error);
		}
		customToast("Desktop Error: Check log for details.", {
			autohide: false,
			positive: false,
		});
	});

	function humanFileSize(bytes, htm = false) {
		var thresh = 1000;
		if (Math.abs(bytes) < thresh) {
			return bytes + " B";
		}
		var units = ["kB", "MB", "GB", "TB"];
		var u = -1;
		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * 10) / 10 >= thresh && u < units.length - 1);
		if (htm) return `<b>${bytes.toFixed(1)}</b> ${units[u]}`;
		return bytes.toFixed(1) + units[u];
	}

	function desktopImportStatusUpdater(formData, callback = null) {
		var moduleid = formData.get("moduleid");
		if (!moduleid) moduleid = "asset";
		jQuery.ajax({
			url:
				apphome +
				"/views/modules/" +
				moduleid +
				"/components/sidebars/localdrives/updatefolderstatus.html",
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			"Content-Type": "multipart/form-data",
			success: function (res) {
				$("#syncFolderList").html(res);
				if (callback) callback();
			},
			error: function (xhr, status, error) {
				console.log("desktopImportStatusUpdater", error);
			},
		});
	}

	lQuery("#localRootPathInput").livequery(function () {
		$(this).val(app.data("local-root"));
	});

	lQuery(".open-file-default").livequery("click", function () {
		var categorypath = $(this).data("categorypath");
		var filename = $(this).data("filename");
		var dlink = $(this).data("dlink");
		var lightbox = $(".upload-lightbox").data("lightbox");
		ipcRenderer.send("openFileWithDefault", {
			categorypath,
			filename,
			dlink,
			lightbox,
		});
	});

	lQuery(".open-folder").livequery("click", function () {
		var path = $(this).data("path") || $(this).data("localpath");
		if (!path) {
			path =
				$(this).parent().data("path") || $(this).parent().data("localpath");
		}
		if (path) {
			ipcRenderer.send("openFolder", { path });
		}
	});

	lQuery(".dir-picker").livequery("click", function (e) {
		e.preventDefault();
		window.postMessage({
			type: "dir-picker",
			targetDiv: $(this).data("target"),
			currentPath: $(this).prev().val(),
		});
	});

	ipcRenderer.on("dir-picked", (_, { targetDiv, path }) => {
		$("#" + targetDiv).val(path);
	});

	lQuery("#changeLocalDirve").livequery("click", function (e) {
		e.preventDefault();
		var selectedPath = $("#localRootPathInput").val();
		ipcRenderer.send("changeLocalDrive", {
			selectedPath,
		});
		closeemdialog($(this).closest(".modal"));
	});

	lQuery(".deleteSyncFolder").livequery("click", function () {
		if (confirm("Are you sure you want to remove this folder from importer?")) {
			var delId = $(this).data("id");
			jQuery
				.ajax({
					type: "DELETE",
					url:
						getMediadb() + "/services/module/desktopsyncfolder/data/" + delId,
				})
				.done(function () {
					$("#wf-" + delId).remove();
				});
		}
	});

	lQuery(".lightbox-header-btns").livequery(function () {
		ipcRenderer.send("check-uploads");

		var uploadsourcepath = $(this).data("path");
		var lightbox = $(this).data("lightbox");
		var entityId = $(this).data("entityid");
		var moduleid = $(this).data("moduleid");
		var desktop = $(this).data("desktop");

		var categorypath = uploadsourcepath;
		if (lightbox) {
			categorypath += "/" + lightbox;
		}

		$(this)
			.find(".download-lightbox")
			.click(function () {
				customToast(
					"Download in progress, check Active Cloud Sync panel for status"
				);
				$(this).prop("disabled", true);
				$(this).find("span").text("Downloading...");
				ipcRenderer.send("lightboxDownload", {
					uploadsourcepath,
					lightbox,
					entityId,
					name,
					desktop,
					moduleid,
				});
			});

		$(this)
			.find(".upload-lightbox")
			.click(function () {
				customToast("Upload task added to Active Cloud Sync");

				$(this).prop("disabled", true);
				$(this).find("span").text("Uploading...");

				var formData = new FormData();
				formData.append("moduleid", moduleid);
				formData.append("entityid", entityId);
				formData.append("desktop", desktop);
				formData.append("categorypath", categorypath);
				formData.append("desktopimportstatus", "scan-started");

				desktopImportStatusUpdater(formData, () => {
					ipcRenderer.send("lightboxUpload", {
						uploadsourcepath,
						lightbox,
						entityId,
					});
				});
			});
	});

	function validateDupes(identifier, identifiers) {
		for (let i = 0; i < identifiers.length; i++) {
			const identifier2 = identifiers[i];
			if (identifier === identifier2) return true;
			else if (identifier.startsWith(identifier2)) return true;
			else if (identifier2.startsWith(identifier)) return true;
		}
		return false;
	}

	function shouldDisableSyncBtns(data) {
		var identifier = $(".lightbox-header-btns").data("path");
		var btn;
		if (!identifier) {
			identifier = $(".watch-entity").data("toplevelcategorypath");
			btn = $(".upload-lightbox-all");
		} else {
			btn = $(".upload-lightbox");
		}
		if (!identifier) {
			return;
		}
		if (validateDupes(identifier, data)) {
			btn.prop("disabled", true);
			btn.find("span").text("Uploading...");
		} else {
			btn.prop("disabled", false);
			btn.find("span").text("Upload");
		}
	}
	ipcRenderer.on("check-uploads", (_, data) => {
		shouldDisableSyncBtns(data);
	});

	lQuery(".cancelUpload").livequery("click", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var btn = $(this);
		var identifier = btn.closest(".work-folder").data("categorypath");
		ipcRenderer.send("cancel-upload", {
			identifier,
		});
	});

	var progItem = (identifier) => {
		console.log(
			"progItem",
			identifier,
			".work-folder[data-categorypath='" + identifier + "']"
		);
		var el = $(".work-folder[data-categorypath='" + identifier + "']");
		if (el.length > 0) {
			return el;
		}
		return null;
	};

	// <all upload events>
	ipcRenderer.on("upload-started", (_, data) => {
		console.log("upload-started", data);
		var idEl = progItem(data.identifier);
		if (idEl) {
			idEl.addClass("processing");
			idEl.find(".filesCompleted").text(0);
			idEl.find(".filesTotal").text(data.total);
			idEl.find(".filesFailed").text(0);
			idEl.find(".fileProgress").css("width", "0%");
			idEl.find(".fileProgressLoaded").text(0);
			idEl.find(".fileProgressTotal").text(0);
		}
	});

	ipcRenderer.on("upload-progress-update", (_, data) => {
		console.log("upload-progress-update", data);
		var idEl = progItem(data.identifier);
		if (idEl) {
			idEl.removeClass("processing");
			idEl.find(".filesCompleted").text(data.completed);
			idEl.find(".filesFailed").text(data.failed);
			idEl.find(".filesTotal").text(data.total);
		}
	});

	ipcRenderer.on("upload-completed", (_, data) => {
		console.log("upload-completed", data);
		var idEl = progItem(data.identifier);
		if (idEl) {
			idEl.removeClass("processing");
			idEl.data("index", undefined);
		}

		var formData = new FormData();
		formData.append("completedfiles", data.completed || 0);
		formData.append("failedfiles", data.failed || 0);
		formData.append("categorypath", data.identifier);
		formData.append("desktopimportstatus", "upload-completed");
		desktopImportStatusUpdater(formData, () => {
			shouldDisableSyncBtns(data.remainingUploads);
			customToast("An upload task has completed");
		});
	});

	ipcRenderer.on("upload-cancelled", (_, identifier) => {
		console.log("upload-cancelled", identifier);
		var idEl = progItem(identifier);
		if (idEl) {
			idEl.removeClass("processing");
			idEl.data("index", undefined);
		}

		var formData = new FormData();
		formData.append("categorypath", identifier);
		formData.append("desktopimportstatus", "upload-cancelled");
		desktopImportStatusUpdater(formData);
	});

	ipcRenderer.on("file-status-update", (_, data) => {
		console.log("file-status-update", data);
		var idEl = progItem(data.identifier);
		if (!idEl) return;
		idEl.data("index", data.index);
		if (data.status === "uploading") {
			idEl.addClass("processing");
			idEl.find(".fileName").text(data.name);
			idEl.find(".fileProgress").css("width", "0%");
			idEl.find(".fileProgressLoaded").text(0);
			idEl.find(".fileProgressTotal").text(0);
		}
	});

	ipcRenderer.on("file-progress-update", (_, data) => {
		console.log("file-progress-update", data);
		var idEl = progItem(data.identifier);
		if (!idEl) return;
		var index = idEl.data("index");
		if (index === undefined) return;

		var progressEl = idEl.find(".fileProgress");
		progressEl.css("width", data.percent + "%");

		var loadedEl = idEl.find(".fileProgressLoaded");
		loadedEl.text(data.loaded);

		var totalEl = idEl.find(".fileProgressTotal");
		totalEl.text(data.total);
	});

	ipcRenderer.on("duplicate-upload", (_, data) => {
		console.log("duplicate-upload", data);
		customToast("Already uploading in this entity, wait until it finishes", {
			positive: false,
			autohideDelay: 5000,
		});
	});

	ipcRenderer.on("too-many-uploads", (_, data) => {
		console.log("too-many-uploads", data);
		customToast("Wait for other uploads to finish", {
			positive: false,
			autohideDelay: 5000,
		});
	});
	// </all upload events>

	function getMediadb() {
		var elem = app;
		return elem.data("siteroot") + "/" + elem.data("mediadbappid");
	}

	lQuery(".desktopdirectdownload").livequery("click", function (e) {
		e.preventDefault();
		ipcRenderer.send("directDownload", $(this).attr("href"));
	});

	var hostUrl = location.protocol + "//" + location.host;
	var hoverATO;
	var anchorHovering = false;
	lQuery("a").livequery("mouseover", function () {
		if (hoverATO) clearTimeout(hoverATO);
		anchorHovering = true;
		var hoverpreview = $(".hoverpreview");
		if (!hoverpreview.length) {
			$("body").append('<div class="hoverpreview"></div>');
			hoverpreview = $(".hoverpreview");
		}
		var href = $(this).attr("href");
		if (!href || href === "#") {
			hoverpreview.hide();
			return;
		}
		if (href.startsWith("/")) {
			href = hostUrl + href;
		}
		hoverATO = setTimeout(function () {
			if (!anchorHovering) return;
			hoverpreview.text(href).fadeIn(200);
		}, 1500);
	});
	lQuery("a").livequery("mouseout", function () {
		anchorHovering = false;
		$(".hoverpreview").fadeOut(200);
	});
});
