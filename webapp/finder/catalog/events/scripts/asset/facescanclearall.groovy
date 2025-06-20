package asset

import org.entermediadb.asset.*
import org.json.simple.JSONArray
import org.openedit.Data
import org.openedit.hittracker.HitTracker
import org.openedit.locks.Lock

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	Lock lock = archive.getLockManager().lockIfPossible("facescanning", "admin");
	
	if( lock == null)
	{
		log.info("Face scanning already in progress");
		return;
	}

	try
	{	
		HitTracker hits = archive.query("asset").exact("facescancomplete", "true").exact("importstatus","complete").search();
		hits.enableBulkOperations();
			
		int saved = 0;
		List tosave = new ArrayList();
		int found = 0;
		for(Data hit in hits)
		{
			Asset asset = archive.getAssetSearcher().loadData(hit);
			asset.setValue("facescancomplete",false);
			asset.setValue("facescanerror",false);
			tosave.add(asset);
			if( tosave.size() == 1000 )
			{
				saved = saved +  tosave.size();
				log.info(" assets updated: " + saved);
				archive.saveAssets(tosave);
				tosave.clear();
			}
		}
		archive.saveAssets(tosave);
		saved = saved +  tosave.size();
		log.info(" assets updated: " + saved);
			
		archive.getSearcher("faceprofilegroup").deleteAll(user);
		
	}
	finally
	{
		archive.getLockManager().release(lock);
	}	
	
}


init();
