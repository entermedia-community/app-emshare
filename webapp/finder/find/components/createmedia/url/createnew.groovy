import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.ProjectManager
import org.entermediadb.asset.fetch.YoutubeImporter
import org.entermediadb.asset.fetch.YoutubeMetadataSnippet
import org.openedit.util.DateStorageUtil
import org.openedit.util.PathUtilities
import org.openedit.util.URLUtilities

import groovy.json.JsonSlurper


public void init()
{
	MediaArchive mediaarchive = context.getPageValue("mediaarchive");
	
	Asset asset = mediaarchive.getAssetSearcher().createNewData();
	asset.setFolder(true);
	asset.setProperty("owner", context.userName);
	asset.setProperty("datatype", "original");
	asset.setProperty("assetaddeddate", DateStorageUtil.getStorageUtil().formatForStorage(new Date()));
	
	//String assettype = context.getRequestParameter("assettype");
	//asset.setProperty("assettype", assettype);
	//branch = mediaarchive.getCategoryArchive().createCategoryTree("/newassets/${context.getUserName()}");
	String categoryid = context.getRequestParameter("categoryid");
	Category cat = mediaarchive.getCategory(categoryid);
	asset.addCategory(cat);
	
	String assetname = '';
	
	String[] fields = context.getRequestParameters("field");
	if(fields != null) {
		mediaarchive.getAssetSearcher().updateData(context,fields,asset);
	}
	
	
	//n7GxnhQjBaw/hqdefault.jpg
	String externalmediainput = context.getRequestParameter("externalmediainput");
	log.info("Importing asset: "+externalmediainput);
	
	String fetchthumb = null;
	String fileformat = null;
	
	if( externalmediainput.contains("youtu.be/") || externalmediainput.contains("youtube.com/") )
	{
		YoutubeImporter importer = mediaarchive.getModuleManager().getBean(mediaarchive.getCatalogId(), "youtubeImporter");
		
		YoutubeMetadataSnippet ytmetadata = importer.importVideoMetadata(mediaarchive, externalmediainput);
		
		log.info("YouTube Metadata: " + ytmetadata);

		fetchthumb = ytmetadata.getThumbnail();
		assetname = ytmetadata.getTitle();
		asset.setValue("longcaption", ytmetadata.getDescription());
		asset.setValue("assettitle", ytmetadata.getTitle());
		asset.setKeywords(ytmetadata.getTags());
		asset.setValue("assetcreateddate", ytmetadata.getPublishedAt());
		asset.setValue("creator", ytmetadata.getChannelTitle());
		asset.setValue("embeddedid", ytmetadata.getId());
		asset.setValue("embeddedtype", "youtube");
		fileformat = "ytube";
		
		log.info("Create asset from YouTube: " + externalmediainput);
		
	}
	else if (externalmediainput.contains("vimeo") )
	{
		//https://vimeo.com/api/v2/video/145706460.json
	
		
		URL originalUrl = new URL(externalmediainput);
		
		String vimeoVideoID = originalUrl.getPath() ;
		vimeoVideoID = PathUtilities.extractPageName(vimeoVideoID);
		
		URL apiUrl = new URL('https://vimeo.com/api/v2/video/' +  vimeoVideoID + '.json');
	
		String text = apiUrl.text;
		def video = new JsonSlurper().parseText(text).get(0);
		
		//fetchthumb = "http://i.vimeocdn.com/video/" + link + ".webp?mw=960&mh=540";
		fetchthumb = video.thumbnail_large;
		assetname = video.title;
		String videodescription  = video.description;
		
		asset.setProperty("longcaption", videodescription);
		//asset.setProperty("assettitle", video.title);
		
		asset.setProperty("embeddedid",vimeoVideoID);
		asset.setProperty("embeddedtype", "vimeo");
		asset.addKeywords(video.tags);
		fileformat = "vimeo";
		
		log.info("Create asset from vimeo.com: " + externalmediainput);
	}
	else
	{
		String name = externalmediainput;
		int ques = name.indexOf("?");
		if( ques > -1)
		{
			name = name.substring(0,ques);
		}
		assetname = PathUtilities.extractFileName(name);		
		//TODO: Use some parser interface and grab more metadata from youtube or vimeo, flickr
		asset.setProperty("linkurl",externalmediainput);
		
		log.info("Create asset from external url: " + externalmediainput);
	}
	
	if( fetchthumb == null)
	{
		asset.setProperty("fetchurl", externalmediainput);
	}
	else
	{
		//this is still set because we dont currently have a way to make thumbnails for embdedded file formats
		asset.setProperty("fetchurl",fetchthumb);
		asset.setProperty("fetchthumbnailurl",fetchthumb);
		asset.setProperty("fileformat", fileformat);
	}
	
	
	asset.setProperty("importstatus","needsdownload");
	asset.setProperty("previewstatus", "0"); //unknown
	
	
	
	String sourcepath = mediaarchive.getAssetImporter().getAssetUtilities().createSourcePath(context, mediaarchive, assetname);
	asset.setSourcePath(sourcepath + "." + fileformat);

	asset.setName(assetname);
	
	//String embed =  context.getRequestParameter("embeddedurl.value") 
	//if( embed != null )
	//{
	//	asset.setProperty("fileformat","embedded");	
	//}
	//See if embed video is set? if not then fill it in?
	
	
	
	mediaarchive.saveAsset(asset, context.getUser());
	
	String currentcollection = context.getRequestParameter("currentcollection");
	if( currentcollection != null)
	{
		ProjectManager manager = (ProjectManager)moduleManager.getBean(mediaarchive.getCatalogId(),"projectManager");
		manager.addAssetToCollection(mediaarchive,currentcollection,asset.getId());
	}
	
	
	context.putPageValue("asset", asset);
	context.setRequestParameter("assetid", asset.id);
	context.setRequestParameter("sourcepath", asset.sourcePath);

	
	mediaarchive.fireSharedMediaEvent("importing/fetchdownloads");
}


init();


