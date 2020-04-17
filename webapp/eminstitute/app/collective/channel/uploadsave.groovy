package importing;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import java.util.regex.Matcher
import java.util.regex.Pattern

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	String sourcepath = context.getRequestParameter("sourcepath");
			
	log.info("Uploading Post Content: " + sourcepath);
	Category defaultcat = archive.getCategorySearcher().createCategoryPath(sourcepath);
	
	Searcher searcher = archive.getSearcher("userupload");
	Data upload = searcher.createNewData();
	upload.setValue("uploaddate",new Date());
	upload.setValue("owner",context.getUserName());
	upload.setValue("librarycollection",context.getRequestParameter("collectionid"));
	String exclusivecontent = context.getRequestParameter("exclusivecontent");
	if(exclusivecontent != null)
	{
		upload.setValue("exclusivecontent",exclusivecontent);
	}	
	
	upload.setValue("uploadcategory",defaultcat);
	String[] topics = context.getRequestParameters("collectiveproject.value");
	if( topics != null && topics.length > 0)
	{
		upload.setValues("collectiveproject",Arrays.asList(topics) );
	}
	upload.setValue("usertags",context.getRequestParameters("keywords.value"));
	upload.setValue("title",context.getRequestParameters("uploadtitle"));
	String desc = context.getRequestParameter("uploaddescription");
	
	//log.info("--Matched: "+desc.matches("(https?://)?(www\\.)?(yotu\\.be/|youtube\\.com/)?((.+/)?(watch(\\?v=|.+&v=))?(v=)?)([\\w_-]{11})(&.+)?"));
		
	upload.setValue("longdescription",desc);
	searcher.saveData(upload);
	
	//context.redirect("/"+$applicationid+"/collective/channel/");
		
}

init();


