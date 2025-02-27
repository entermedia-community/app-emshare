package asset

import org.entermediadb.asset.*
import org.openedit.Data
import org.openedit.hittracker.HitTracker
import org.openedit.util.PathUtilities

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	
	//remove all categories first

	HitTracker hits = archive.query("asset").all().sort("sourcepath").search();
	hits.enableBulkOperations();
		
	int saved = 0;
	List tosave = new ArrayList();
	Category root = archive.getCategorySearcher().getRootCategory();
	for(Data hit in hits)
	{
		Asset asset = archive.getAssetSearcher().loadData(hit);
		
		String path = asset.getPath();
		if (!asset.isFolder())
		{
			path = PathUtilities.extractDirectoryPath(path);
			if (path==null)
			{
				continue;
			}
		}
		Category cat = archive.getCategorySearcher().createCategoryPath(path);
		asset.removeCategory(root);
		asset.addCategory(cat);
		tosave.add(asset);
		if( tosave.size() == 1000 )
		{
			saved = saved +  tosave.size();
			log.info("saved " + saved);
			archive.saveAssets(tosave);
			tosave.clear();
		}
	}
	archive.saveAssets(tosave);
	saved = saved +  tosave.size();
	log.info("saved " + saved);
	
}


init();
