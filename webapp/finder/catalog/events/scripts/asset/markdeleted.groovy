package asset;


import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.entermediadb.asset.sources.AssetSourceManager
import org.openedit.Data
import org.openedit.hittracker.HitTracker



public void init()
{

	MediaArchive archive = context.getPageValue("mediaarchive");
	
	AssetSourceManager manager = archive.getAssetManager();
	
	AssetSearcher searcher = archive.getAssetSearcher();
	
	HitTracker all = searcher.query().exact("importstatus", "error").not("editstatus", "7").search();
	all.enableBulkOperations();
	ArrayList tosave = new ArrayList();
	log.info("Checking assets for missing originals: " + all.size());
	Asset currentasset = null;
	for( Data found : all)
	{
		
		currentasset = searcher.loadData( found );
		
		if (!manager.existsOriginalContent(currentasset)) 
		{
			
			currentasset.setValue("editstatus", "7");
			tosave.add(currentasset);
		}
		if (tosave.size() > 500) 
        {
            searcher.saveAllData(tosave, null);
			log.info("Marked as Deleted: " + tosave.size());
            tosave.clear();
        }
		
	
	}
	
		log.info("Marked as Deleted: " + tosave.size());
        searcher.saveAllData(tosave, null);
    
		
}

init();
