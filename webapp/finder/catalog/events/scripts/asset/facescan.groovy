package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceProfileManager
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
		HitTracker hits = archive.query("asset").exact("facescancomplete", "false").exact("importstatus","complete").search();
		hits.enableBulkOperations();
			
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		for(Data hit in hits)
		{
			Asset asset = archive.getAssetSearcher().loadData(hit);
			manager.extractFaces(asset);
		}
		log.info("processed  " + hits.size());
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
