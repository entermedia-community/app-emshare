package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.hittracker.HitTracker

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");
	AssetSearcher searcher = archive.getAssetSearcher();
	HitTracker hits = archive.query("asset").exact("isfolder", false).search();
	hits.enableBulkOperations();
	int saved = 0;
	List tosave = new ArrayList();
	for(Data hit in hits)
	{
		Asset asset = archive.getAssetSearcher().loadData(hit);
		//String path = asset.getPath();
		//Category cat = archive.getCategorySearcher().createCategoryPath(path);
		//asset.removeCategory(root);
		//asset.addCategory(cat);
		String primaryfile = asset.get("primaryfile");
		if (primaryfile == null)
		{
			continue;
		}
		String sourcepath = asset.get("sourcepath"); 
		String sp = sourcepath.toLowerCase();
		if (sp.contains("."))
		{
			continue;
		}
		//if(sp.endsWith(".jpg" || sp.endsWith(".jpeg") || sp.endsWith(".png") || sp.endsWith(".svg") || sp.endsWith(".gif")
		
		log.info("Found:  " + sourcepath);
		asset.setValue("isfolder", "true");
		tosave.add(asset);
		if( tosave.size() == 1000 )
		{
			saved = saved +  tosave.size();
			log.info("saved " + saved);
			searcher.saveAllData(tosave, null);
			tosave.clear();
		}
	
	}
	if (tosave.size() == 0)
    {
        return;
    }
	searcher.saveAllData(tosave, null);
	saved = saved +  tosave.size();
	log.info("saved " + saved);
	
}


init();
