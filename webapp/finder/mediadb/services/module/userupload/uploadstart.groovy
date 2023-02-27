
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.graalvm.compiler.debug.PathUtilities
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.util.PathUtilities

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	String sourcepath = context.getRequestParameter("sourcepath");
			
	
	Searcher searcher = archive.getSearcher("userupload");
	Data upload = searcher.createNewData();
	upload.setValue("uploaddate",new Date());
	upload.setValue("owner",context.getUserName());
	upload.setValue("librarycollection",context.getRequestParameter("librarycollection"));
	upload.setValue("usertags",context.getRequestParameters("usertags"));
	upload.setValue("title",context.getRequestParameter("title"));
	upload.setValue("longdescription",context.getRequestParameter("longdescription"));
	upload.setValue("collectiveproject",context.getRequestParameter("collectiveproject"));
	upload.setValue("totalfilesize",context.getRequestParameter("totalfilesize"));
	
	log.info("Upload to Category: " + sourcepath);
	//String path = PathUtilities.extractDirectoryPath(sourcepath);
	Category defaultcat = archive.getCategorySearcher().createCategoryPath(sourcepath);
	String moduleid = context.getRequestParameter("moduleid");
	String entityid = context.getRequestParameter("entityid");
	
	if (moduleid != null && entityid != null)
	{
		defaultcat.setValue(moduleid, entityid);
		archive.saveData("category", defaultcat);
	}
	upload.setValue("uploadcategory",defaultcat);
	searcher.saveData(upload);
	
	
		
	context.putPageValue("data",upload);
	context.putPageValue("searcher",searcher);
	
}

init();


