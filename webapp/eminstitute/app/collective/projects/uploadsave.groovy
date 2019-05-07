package importing;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher


public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	String sourcepath = context.getRequestParameter("sourcepath");
			
	log.info("Script running" + sourcepath);
	Category defaultcat = archive.getCategorySearcher().createCategoryPath(sourcepath);
	
	Searcher searcher = archive.getSearcher("userupload");
	Data upload = searcher.createNewData();
	upload.setValue("uploaddate",new Date());
	upload.setValue("owner",context.getUserName());
	upload.setValue("librarycollection",context.getRequestParameter("collectionid"));
	upload.setValue("uploadcategory",defaultcat);
	upload.setValue("usertags",context.getRequestParameters("usertags.value"));
	//upload.setValue("longdescription",context.getRequestParameters("uploaddescription"));
	searcher.saveData(upload);
		
}

init();


