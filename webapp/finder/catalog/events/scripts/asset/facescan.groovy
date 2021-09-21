package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceDetectManager
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

	int saved = 0;
	try
	{	
		HitTracker hits = archive.query("asset").exact("facescancomplete", "false").exact("importstatus","complete").search();
		hits.enableBulkOperations();
			
		List tosave = new ArrayList();
		FaceDetectManager manager = archive.getBean("faceDetectManager");
		int found = 0;
		for(Data hit in hits)
		{
			Asset asset = archive.getAssetSearcher().loadData(hit);
			if( manager.extractFaces(archive, asset) )
			{
				tosave.add(asset);
			}
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
		if( saved > 0)
		{
			log.info("saved " + saved);
		}
	}
	finally
	{
		archive.getLockManager().release(lock);
	}

	if( saved > 0)
	{
		archive.fireMediaEvent("facecompare", context.getUser());
	}
	
}


init();
