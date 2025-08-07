package conversions;

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery

public void clearerrors()
{
	mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	Searcher tasksearcher = mediaarchive.getSearcherManager().getSearcher (mediaarchive.getCatalogId(), "conversiontask");
	SearchQuery query = tasksearcher.createSearchQuery();
	query.addExact("presetid", "webpmediumimage");
	
	HitTracker newtasks = tasksearcher.search(query);
	newtasks.enableBulkOperations();
	
	log.info("Found " + newtasks.size() + " conversion tasks to delete");
	
	for (Data hit in newtasks)
	{
		tasksearcher.delete(hit, user);
		Asset asset = mediaarchive.getAsset(hit.assetid);
		mediaarchive.removeGeneratedImage(asset, "image550x350");

	}
	
}


clearerrors();

