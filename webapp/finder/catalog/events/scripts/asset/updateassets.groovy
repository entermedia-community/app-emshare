package asset

import org.entermediadb.asset.*
import org.openedit.Data
import org.openedit.hittracker.HitTracker
import org.openedit.util.PathUtilities

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	

	HitTracker hits = archive.query("junk").all().search();
	hits.enableBulkOperations();
		
	int saved = 0;
	List tosave = new ArrayList();
	String categoryid = "library-production";
	Category category = archive.getCategory(categoryid);
	
	
	Category categoryem = archive.getCategory("AWFsGd95n72YQoiXNnmn");
	for(Data hit in hits)
	{
		Asset asset = archive.getAssetSearcher().loadData(hit.getId());
		if (asset == null)
		{
			log.info("Asset not found: " + hit.getId());
			continue;
		}
		if (asset.isInCategory(category) || asset.isInCategory(categoryem)) {
			continue;
		}
		
		asset.addCategory(category);
		tosave.add(asset);
		if( tosave.size() == 1000 )
		{
			saved = saved +  tosave.size();
			log.info("saved " + saved);
			//archive.saveAssets(tosave);
			tosave.clear();
		}
	}
	//archive.saveAssets(tosave);
	saved = saved +  tosave.size();
	log.info("saved " + saved);
	
}
init();
