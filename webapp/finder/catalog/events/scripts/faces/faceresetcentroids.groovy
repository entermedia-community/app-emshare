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
		HitTracker hits = archive.query("faceembedding").exists("nearbycentroidids").hitsPerPage(500).search(); //More random
		hits.enableBulkOperations();
			
		int saved = 0;
		List tosave = new ArrayList();
		int found = 0;
		for(Data hit in hits)
		{
			hit.setValue("nearbycentroidids",null);
			hit.setValue("iscentroid",false);
			tosave.add(hit);
			if( tosave.size() == 1000 )
			{
				saved = saved +  tosave.size();
				log.info(" updated: " + saved);
				archive.saveData("faceembedding",tosave);
				tosave.clear();
			}
		}
		archive.saveData("faceembedding",tosave);
		saved = saved +  tosave.size();
		log.info("updated: " + saved);

		hits = archive.query("faceembedding").exact("iscentroid",true).hitsPerPage(500).search();
		for(Data hit in hits)
		{
			hit.setValue("iscentroid",false);
			tosave.add(hit);
		}
		archive.saveData("faceembedding",tosave);
		log.info("cleared: " + tosave.size() );
		
	}
	finally
	{
		archive.getLockManager().release(lock);
	}	
	archive.getCacheManager().clear("face");
	archive.getCacheManager().clear("faceboxes");
	archive.getCacheManager().clear("facepersonlookuprecord");

}


init();
