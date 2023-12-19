package asset;

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.repository.*
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery

public void checkforTasks()
{
	mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");//Search for all files looking for videos
	
	AssetSearcher searcher = mediaarchive.getAssetSearcher();
	//recordmodificationdate
	//editstatus:7
	
	SearchQuery query = searcher.createSearchQuery();
	//query.addMatches("editstatus", "7");
	
	HitTracker newitems = searcher.search(query);
	newitems.enableBulkOperations();

	log.info("Searching for ${query.toString()} found ${newitems.size()}");
	
	Collection tosave = new ArrayList();
	
	for (Data hit in newitems)
	{	
		Asset realitem = searcher.searchById(hit.getId());
		
		
		if (realitem != null)
		{
			//mediaarchive.removeGeneratedImages(realitem, true);
			//mediaarchive.removeOriginals(realitem);
			//searcher.delete(realitem, context.getUser());
			
			
			ContentItem fullpath = 	mediaarchive.getOriginalContent(realitem);
			
			if(fullpath.getLength() == 138){
				log.info(realitem.getSourcePath());
				realitem.setValue("corruptedoriginal", true);
				tosave.add(realitem);	
			}
			else if (realitem.getBoolean("corruptedoriginal")) {
				log.info("Restored: " + realitem.getSourcePath());
				realitem.setValue("corruptedoriginal", false);
				tosave.add(realitem);
			}
			
			//log.info(realitem.getSourcePath() + " " +realitem.get("editstatus"));
		}
		else
		{
			log.info("Can't find task object with id '${hit.getId()}'. Index out of date?")
		}
	}
	
	mediaarchive.saveAssets(tosave);
	
}
