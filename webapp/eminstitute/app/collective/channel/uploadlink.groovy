import groovy.json.JsonSlurper

import org.entermediadb.asset.Asset
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

//branch = mediaarchive.getCategoryArchive().createCategoryTree("/newassets/${context.getUserName()}");
//asset.addCategory(branch);

String[] fields = context.getRequestParameters("field");
if(fields != null) {
	mediaarchive.getAssetSearcher().updateData(context,fields,asset);
}



//Saving only id, youtube embed url changed.
String externalmediaid = context.getRequestParameter("externalmediaid");
String externalmediaservice = context.getRequestParameter("externalmediaservice");
String fetchthumb = null;
String linkurl = null;

if (externalmediaid != null) {
	log.info("Remote Link from " + externalmediaservice);
	if(externalmediaservice == 'youtube') {
		fetchthumb = "http://img.youtube.com/vi/" + externalmediaid + "/hqdefault.jpg";
		linkurl = "https://www.youtube.com/embed/"+externalmediaid;
	}
	else if(externalmediaservice == 'vimeo') {
		//https://vimeo.com/api/v2/video/145706460.json
		//--String vimeoVideoID = externalmediainput.substring(externalmediainput.lastIndexOf("/") + 1);
		
		linkurl = 'https://player.vimeo.com/video/' +  externalmediaid;
		URL apiUrl = new URL('https://vimeo.com/api/v2/video/' + externalmediaid + '.json');
	
		String text = apiUrl.text;
		def video = new JsonSlurper().parseText(text).get(0);
		
		//fetchthumb = "http://i.vimeocdn.com/video/" + link + ".webp?mw=960&mh=540";
		fetchthumb = video.thumbnail_large;
		asset.setName(video.title);
		asset.setProperty("longcaption", video.description);
		//asset.setProperty("assettitle", video.title);
		
		asset.addKeywords(video.tags);
	}

}


/*
String externalmediainput = context.getRequestParameter("externalmediainput");
if( externalmediainput.startsWith("https://www.youtube.com/embed/") )
{
	//set the thumbnail
	//https://youtu.be/n7GxnhQjBaw
	String link = externalmediainput.substring(31);
	fetchthumb = "http://img.youtube.com/vi/" + link + "/hqdefault.jpg";
}
else if (externalmediainput.contains("youtube.com/") )
{
	//https://www.youtube.com/watch?v=n7GxnhQjBaw
	String link = externalmediainput.substring(externalmediainput.indexOf("watch?v=") + 8);
	fetchthumb = "http://img.youtube.com/vi/" + link + "/hqdefault.jpg";
}
else if (externalmediainput.contains("vimeo") )
{
	//https://vimeo.com/api/v2/video/145706460.json
	String vimeoVideoID = externalmediainput.substring(externalmediainput.lastIndexOf("/") + 1);
	
	URL apiUrl = new URL('https://vimeo.com/api/v2/video/' + vimeoVideoID + '.json');

	String text = apiUrl.text;
	def video = new JsonSlurper().parseText(text).get(0);
	
	//fetchthumb = "http://i.vimeocdn.com/video/" + link + ".webp?mw=960&mh=540";
	fetchthumb = video.thumbnail_large;
	asset.setName(video.title);
	asset.setProperty("longcaption", video.description);
	//asset.setProperty("assettitle", video.title);
	
	asset.addKeywords(video.tags);
}
else
{
	String name = externalmediainput;
	int ques = name.indexOf("?");
	if( ques > -1)
	{
		name = name.substring(0,ques);
	}
	asset.setName( PathUtilities.extractFileName(name));		
}
*/


//TODO: Use some parser interface and grab more metadata from youtube or vimeo, flickr
asset.setProperty("linkurl", linkurl);

if( fetchthumb == null)
{
	asset.setProperty("fetchurl", externalmediainput);
}
else
{	
	//this is still set because we dont currently have a way to make thumbnails for embdedded file formats
	asset.setProperty("fetchurl",fetchthumb);
	asset.setProperty("fetchthumbnailurl",fetchthumb);
	asset.setProperty("assettype","embedded");
}

asset.setProperty("importstatus", "needsdownload");

String sourcepath = context.getRequestParameter("sourcepath");
if ( sourcepath == null ) {
	sourcepath = mediaarchive.getAssetImporter().getAssetUtilities().createSourcePath(context, mediaarchive, asset.getName());
}

asset.setSourcePath(sourcepath);
mediaarchive.saveAsset(asset, context.getUser());

//Todo: Not adding the asset to the collection
String currentcollection = context.getRequestParameter("collectionid");
if( currentcollection != null)
{
	ProjectManager manager = (ProjectManager)moduleManager.getBean(mediaarchive.getCatalogId(),"projectManager");
	manager.addAssetToCollection(mediaarchive,currentcollection,asset.getId());
}


context.putPageValue("asset", asset);
context.setRequestParameter("assetid", asset.id);
context.setRequestParameter("sourcepath", asset.sourcePath);


//category = product.defaultCategory;
//webTree = context.getPageValue("catalogTree");
//webTree.treeRenderer.setSelectedNode(category);
//webTree.treeRenderer.expandNode(category);
//
//context.putPageValue("category", category);
//moduleManager.execute("CatalogModule.loadCrumbs", context );

//String sendto = context.findValue("sendtoeditor");
//
//if (Boolean.parseBoolean(sendto))
//{
//	context.redirect("/" + editor.store.catalogId + "/admin/products/editor/" + product.id + ".html");
//}

mediaarchive.fireSharedMediaEvent("importing/fetchdownloads");

