function humanFileSize(bytes, htm = false) {
	if (typeof bytes === "string") bytes = parseInt(bytes);
	if (isNaN(bytes)) return "";
	var thresh = 1000;
	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}
	var units = ["kB", "MB", "GB", "TB"];
	var u = -1;
	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * 10) / 10 >= thresh &&
		u < units.length - 1
	);
	if (htm) return `<b>${bytes.toFixed(1)}</b> ${units[u]}`;
	return bytes.toFixed(1) + units[u];
}

function elideCat(text, maxLength = 80) {
	text = text.replace(/\//g, " › ");
	if (text.length <= maxLength) {
		return text;
	}
	const charsPerSide = Math.floor((maxLength - 3) / 2);
	const leftSide = text.substring(0, charsPerSide);
	const rightSide = text.substring(text.length - charsPerSide);
	return leftSide + "..." + rightSide;
}

function isDuplicateIdentifier(identifier, identifiers) {
	for (let i = 0; i < identifiers.length; i++) {
		const identifier2 = identifiers[i];
		if (identifier === identifier2) return true;
		else if (identifier.startsWith(identifier2)) return true;
		else if (identifier2.startsWith(identifier)) return true;
	}
	return false;
}

jQuery(document).ready(function () {
	var app = $("#application");
	var siteroot = app.data("siteroot");
	var mediadb = app.data("mediadbappid");
	var apphome = app.data("apphome");
	const { ipcRenderer } = require("electron");

	var entermediakey = app.data("entermediakey");
	if (app && app.data("entermediakey") != null) {
		entermediakey = app.data("entermediakey");
	}

	var headers = { "X-tokentype": "entermedia", "X-token": entermediakey };

	function getMediadb() {
		return siteroot + "/" + mediadb;
	}

	ipcRenderer
		.invoke("connection-established", {
			headers: headers,
			key: entermediakey,
			mediadb:
				window.location.protocol + "//" + window.location.host + "/" + mediadb,
		})
		.then(({ computerName, rootPath, downloadPath }) => {
			$("#desktopLoading").remove();
			app.data("local-root", rootPath);
			app.data("local-download", downloadPath);
			app.data("computer-name", computerName);

			ipcRenderer.on(
				"set-local-root",
				(_, { rootPath: rP, downloadPath: dP }) => {
					app.data("local-root", rP);
					app.data("local-download", dP);
				}
			);

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
					autohideDelay: 5000,
					positive: false,
				});
			});

			function desktopImportStatusUpdater(formData, callback = null) {
				var moduleid = formData.get("moduleid");
				if (!moduleid) moduleid = "asset";
				formData.set("desktop", computerName);
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
				var lightbox = $(this).data("lightbox");
				if (!path) {
					path =
						$(this).parent().data("path") || $(this).parent().data("localpath");
					lightbox = $(this).parent().data("lightbox");
				}
				if (path) {
					ipcRenderer.send("openFolder", { path, lightbox });
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

			lQuery("#localRootPathInput").livequery(function () {
				$(this).val(app.data("local-root"));
			});

			lQuery("#localDownloadPathInput").livequery(function () {
				$(this).val(app.data("local-download"));
			});

			lQuery("#changeDesktopSettings").livequery("click", function (e) {
				e.preventDefault();
				var rootPath = $("#localRootPathInput").val();
				var downloadPath = $("#localDownloadPathInput").val();
				ipcRenderer.send("changeDesktopSettings", {
					rootPath,
					downloadPath,
				});
				closeemdialog($(this).closest(".modal"));
			});

			lQuery(".deleteSyncFolder").livequery("click", function () {
				if (confirm("Are you sure you want to remove this sync task?")) {
					var delId = $(this).data("id");
					var identifier = $(this).data("categorypath");
					var isDownload = $(this).hasClass("download");
					ipcRenderer.send("cancelSync", { identifier, isDownload });
					jQuery.ajax({
						type: "DELETE",
						url:
							getMediadb() + "/services/module/desktopsyncfolder/data/" + delId,
						success: function () {
							$("#wf-" + delId).remove();
							customToast("Sync task deleted successfully!");
						},
						error: function (xhr, status, error) {
							console.log("deleteSyncFolder", error);
							customToast("Error deleting sync task!", {
								positive: false,
							});
						},
					});
				}
			});

			lQuery(".quick-download").livequery("click", function () {
				$(this).prop("disabled", true);
				$("#col-sidebars").load(apphome + "/components/sidebars/index.html", {
					propertyfield: "sidebarcomponent",
					sidebarcomponent: "localdrives",
					"sidebarcomponent.value": "localdrives",
				});
				$(window).trigger("resize");

				var entityid = $(this).data("entityid");
				var moduleid = $(this).data("moduleid");
				var uploadsourcepath = $(this).data("path");
				var categorypath = uploadsourcepath;
				categorypath = categorypath.replace(/\\/g, "/");
				categorypath = categorypath.replace(/\/+/g, "/");

				var formData = new FormData();
				formData.set("categorypath", categorypath);
				formData.set("entityid", entityid);
				formData.set("moduleid", moduleid);
				formData.set("desktopimportstatus", "scan-started");
				formData.set("isdownload", "true");

				ipcRenderer
					.invoke("lightboxDownload", {
						toplevelcategorypath: uploadsourcepath,
						lightbox: "",
					})
					.then((scanStarted) => {
						if (scanStarted) desktopImportStatusUpdater(formData);
					})
					.catch((error) => {
						console.log("quick-download", error);
					})
					.finally(() => {
						$(this).prop("disabled", false);
					});
			});

			lQuery(".lightbox-header-btns").livequery(function () {
				ipcRenderer.send("check-sync");

				var headerBtns = $(this);

				var uploadsourcepath = headerBtns.data("path");
				var lightbox = headerBtns.data("lightbox") || "";
				var entityId = headerBtns.data("entityid");
				var moduleid = headerBtns.data("moduleid");

				var categorypath = uploadsourcepath;
				if (lightbox) {
					categorypath += "/" + lightbox;
				}
				categorypath = categorypath.replace(/\\/g, "/");
				categorypath = categorypath.replace(/\/+/g, "/");

				var formData = new FormData();
				formData.set("moduleid", moduleid);
				formData.set("entityid", entityId);
				formData.set("categorypath", categorypath);

				headerBtns.on("click", ".download-lightbox", function () {
					customToast(
						elideCat(categorypath) + " download task added to Cloud Sync"
					);

					$(this).prop("disabled", true);
					$(this).find("span").text("Downloading...");

					$(this).removeClass("has-changes");

					formData.set("desktopimportstatus", "scan-started");
					formData.set("isdownload", "true");

					ipcRenderer
						.invoke("lightboxDownload", {
							toplevelcategorypath: uploadsourcepath,
							lightbox,
						})
						.then((scanStarted) => {
							if (scanStarted) desktopImportStatusUpdater(formData);
						})
						.catch((error) => {
							console.log("lightboxDownload", error);
						});
				});

				headerBtns.on("click", ".upload-lightbox", function () {
					customToast(
						elideCat(categorypath) + " upload task added to Cloud Sync"
					);

					$(this).prop("disabled", true);
					$(this).find("span").text("Uploading...");

					$(this).removeClass("has-changes");

					formData.set("desktopimportstatus", "scan-started");

					ipcRenderer
						.invoke("lightboxUpload", {
							toplevelcategorypath: uploadsourcepath,
							lightbox,
						})
						.then((scanStarted) => {
							if (scanStarted) desktopImportStatusUpdater(formData);
						})
						.catch((error) => {
							console.log("lightboxUpload", error);
						});
				});

				headerBtns.on("click", ".scan-changes", function () {
					customToast(
						"Scanning for unsynced files in " + elideCat(categorypath),
						{ id: categorypath }
					);

					$(this).prop("disabled", true);
					$(this).addClass("scanning");

					var idEl = headerBtns;
					ipcRenderer
						.invoke("scanChanges", {
							toplevelcategorypath: uploadsourcepath,
							lightbox,
						})
						.then(({ hasUploads, hasDownloads }) => {
							var ch = [];

							if (hasUploads) {
								ch.push("upload");
								idEl.find(".upload-lightbox").addClass("has-changes");
							} else {
								idEl.find(".upload-lightbox").removeClass("has-changes");
							}
							if (hasDownloads) {
								ch.push("download");
								idEl.find(".download-lightbox").addClass("has-changes");
							} else {
								idEl.find(".download-lightbox").removeClass("has-changes");
							}
							if (ch.length > 0) {
								customToast(
									"Found new files to " +
										ch.join(" & ") +
										"in " +
										elideCat(categorypath),
									{
										id: categorypath,
									}
								);
							} else {
								customToast(
									"No unsynced files found in " + elideCat(categorypath),
									{ id: categorypath }
								);
							}
						})
						.catch((error) => {
							console.log("scanChanges", error);
						})
						.finally(() => {
							$(this).prop("disabled", false);
							$(this).removeClass("scanning");
						});
				});
			});

			function shouldDisableUploadSyncBtn(data) {
				var identifier = $(".lightbox-header-btns").data("path");
				var btn = $(".upload-lightbox");
				if (!identifier) {
					identifier = $(".watch-entity").data("toplevelcategorypath");
				}
				if (!identifier) {
					return;
				}
				if (isDuplicateIdentifier(identifier, data)) {
					btn.prop("disabled", true);
					btn.find("span").text("Uploading...");
				} else {
					btn.prop("disabled", false);
					btn.find("span").text("Upload");
				}
			}

			ipcRenderer.on("check-sync", (_, { up_identifiers, dn_identifiers }) => {
				if (up_identifiers?.length > 0) {
					shouldDisableUploadSyncBtn(up_identifiers);
				}
				if (dn_identifiers?.length > 0) {
					shouldDisableDownloadSyncBtn(dn_identifiers);
				}
			});

			function shouldDisableDownloadSyncBtn(data) {
				var identifier = $(".lightbox-header-btns").data("path");
				var btn = $(".download-lightbox");
				if (!identifier) {
					identifier = $(".watch-entity").data("toplevelcategorypath");
				}
				if (!identifier) {
					return;
				}
				if (isDuplicateIdentifier(identifier, data)) {
					btn.prop("disabled", true);
					btn.find("span").text("Downloading...");
				} else {
					btn.prop("disabled", false);
					btn.find("span").text("Download");
				}
			}

			lQuery(".cancelSync").livequery("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				var btn = $(this);
				var identifier = btn.data("categorypath");
				var isDownload = btn.hasClass("download");
				ipcRenderer.send("cancelSync", { identifier, isDownload });
			});

			var progItem = (identifier, dl = false) => {
				var el = $(
					`.work-folder${
						dl ? ".download" : ".upload"
					}[data-categorypath="${identifier}"]`
				);
				if (el.length > 0) {
					return el;
				}
				return null;
			};

			// <all sync events>
			ipcRenderer.on("sync-started", (_, data) => {
				console.log("sync-started", data);
				var idEl = progItem(data.identifier, data.isDownload);
				if (idEl) {
					idEl.addClass("processing");
					if (data.isDownload) {
						idEl.addClass("download");
					} else {
						idEl.addClass("upload");
					}
					idEl.find(".filesCompleted").text(0);
					idEl.find(".filesTotal").text(data.total);
					idEl.find(".filesFailed").text(0);
					idEl.find(".fileProgress").css("width", "0%");
					idEl.find(".fileProgressLoaded").text(0);
					idEl.find(".fileProgressTotal").text(0);
				}
			});

			ipcRenderer.on("sync-progress-update", (_, data) => {
				console.log("sync-progress-update", data);
				var idEl = progItem(data.identifier, data.isDownload);
				if (idEl) {
					idEl.find(".filesCompleted").text(data.completed);
					idEl.find(".filesFailed").text(data.failed);
					idEl.find(".filesTotal").text(data.total);
				}
			});

			ipcRenderer.on("sync-completed", (_, data) => {
				console.log("sync-completed", data);
				var idEl = progItem(data.identifier, data.isDownload);
				if (idEl) {
					idEl.removeClass("processing");
					idEl.data("index", undefined);
				}

				var formData = new FormData();
				formData.append("completedfiles", data.completed || 0);
				formData.append("failedfiles", data.failed || 0);
				formData.append("categorypath", data.identifier);
				formData.append("desktopimportstatus", "sync-completed");
				if (data.isDownload) formData.append("isdownload", "true");
				desktopImportStatusUpdater(formData, () => {
					if (data.isDownload) {
						shouldDisableDownloadSyncBtn(data.remaining);
					} else {
						shouldDisableUploadSyncBtn(data.remaining);
					}
					customToast(
						`${
							data.isDownload ? "Downloaded" : "Uploaded"
						} all files from ${elideCat(data.identifier)}!`,
						{ id: data.identifier }
					);
				});
				var dataeditedreload = $(".dataeditedreload");
				dataeditedreload.each(function () {
					$(window).trigger("autoreload", [$(this), null, "dataeditedreload"]);
				});
			});

			ipcRenderer.on("sync-cancelled", (_, { identifier, isDownload }) => {
				console.log("sync-cancelled", identifier);
				var idEl = progItem(identifier, isDownload);
				var filesCompleted = 0;
				if (idEl) {
					idEl.removeClass("processing");
					idEl.data("index", undefined);
					filesCompleted = idEl.find(".filesCompleted").text();
				}

				var formData = new FormData();
				formData.append("categorypath", identifier);
				formData.append("desktopimportstatus", "sync-cancelled");
				if (isDownload) formData.append("isdownload", "true");
				if (filesCompleted >= 0)
					formData.append("completedfiles", filesCompleted);
				desktopImportStatusUpdater(formData);
			});

			ipcRenderer.on("file-status-update", (_, data) => {
				console.log("file-status-update", data);
				var idEl = progItem(data.identifier, data.isDownload);
				if (!idEl) return;
				idEl.data("index", data.index);
				if (data.status === "uploading" || data.status === "downloading") {
					idEl.addClass("processing");
					idEl.find(".fileName").text(data.name);
					idEl.find(".fileProgress").css("width", "0%");
					idEl.find(".fileProgressLoaded").text(0);
					idEl.find(".fileProgressTotal").text(humanFileSize(data.size));
				} else if (data.status === "completed") {
					idEl.find(".fileProgress").css("width", "100%");
					idEl.find(".fileProgressLoaded").text(humanFileSize(data.size));
					idEl.find(".fileProgressTotal").text(humanFileSize(data.size));
				}
			});

			ipcRenderer.on("file-progress-update", (_, data) => {
				console.log("file-progress-update", data);
				var idEl = progItem(data.identifier, data.isDownload);
				if (!idEl) return;
				// var index = idEl.data("index");
				// if (index === undefined) return;

				var progressEl = idEl.find(".fileProgress");
				progressEl.css("width", Math.min(data.percent * 100, 100) + "%");

				var loadedEl = idEl.find(".fileProgressLoaded");
				loadedEl.text(humanFileSize(data.loaded));

				var totalEl = idEl.find(".fileProgressTotal");
				totalEl.text(humanFileSize(data.total));
			});

			ipcRenderer.on("duplicate-upload", () => {
				customToast(
					"Already uploading in this entity, wait until it finishes",
					{
						positive: false,
						autohideDelay: 5000,
					}
				);
			});
			ipcRenderer.on("too-many-uploads", () => {
				customToast("Wait for other uploads to finish", {
					positive: false,
					autohideDelay: 5000,
				});
			});

			ipcRenderer.on("duplicate-download", () => {
				customToast(
					"Already downloading in this entity, wait until it finishes",
					{
						positive: false,
						autohideDelay: 5000,
					}
				);
			});
			ipcRenderer.on("too-many-downloads", () => {
				customToast("Wait for other downloads to finish", {
					positive: false,
					autohideDelay: 5000,
				});
			});
			// </all sync events>

			// <single file download events>
			ipcRenderer.on("download-update", (_, data) => {
				const toastId = data.filename.replace(/[^a-zA-Z0-9]/g, "_");
				customToast(data.message, {
					id: toastId,
					positive: !data.error,
				});
			});
			// </single file download events>

			lQuery("#col-localdrives").livequery(function () {
				$(this)
					.find(".work-folder.processing")
					.each(function () {
						if ($(this).hasClass("upload-started")) return;
						if ($(this).hasClass("download-started")) return;
						var categorypath = $(this).data("categorypath");
						var isDownload = $(this).hasClass("download");
						ipcRenderer.send("continueSync", {
							categorypath,
							isDownload,
						});
					});
			});

			lQuery(".desktopdirectdownload").livequery("click", function (e) {
				e.preventDefault();
				ipcRenderer.send("directDownload", $(this).attr("href"));
			});
		})
		.catch((err) => {
			console.error(err);
			customToast("Error establishing connection with Electron!", {
				positive: false,
			});
		});
});
