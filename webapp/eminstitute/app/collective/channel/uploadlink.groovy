import groovy.json.JsonSlurper

import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.ProjectManager
import org.openedit.page.*
import org.openedit.util.DateStorageUtil
import org.openedit.util.PathUtilities


MediaArchive mediaarchive = context.getPageValue("mediaarchive");

Asset asset = mediaarchive.getAssetSearcher().createNewData();
asset.setFolder(true);
asset.setProperty("owner", context.userName);
asset.setProperty("importstatus", "needsdownload")
asset.setProperty("datatype", "original");
asset.setProperty("assetaddeddate", DateStorageUtil.getStorageUtil().formatForStorage(new Date()));

String sourcepath = context.getRequestParameter("sourcepath");
asset.setSourcePath(sourcepath);

org.entermediadb.asset.Category cat = mediaarchive.createCategoryPath(asset.getSourcePath());
asset.addCategory(cat);

String[] fields = context.getRequestParameters("field");
if(fields != null) {
	mediaarchive.getAssetSearcher().updateData(context,fields,asset);
}

mediaarchive.saveAsset(asset, context.getUser());


mediaarchive.fireSharedMediaEvent("importing/fetchdownloads");

