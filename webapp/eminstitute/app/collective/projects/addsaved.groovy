package importing;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.LibraryCollection
import org.openedit.Data
import org.openedit.data.Searcher


public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	String collectionid = context.getRequestParameter("parentcollectionid.value");
	LibraryCollection collection = archive.getData("librarycollection", collectionid);
	Category newcat = (Category)archive.getCategorySearcher().createNewData();
	Data project = (Data)context.getPageValue("data");
	newcat.setId(project.getId());
	newcat.setName(project.getName());
	collection.getCategory().addChild(newcat);
	archive.getCategorySearcher().saveCategory(newcat);
	context.setRequestParameter("nodeID",newcat.getId());
}

init();


