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
	
	String api = archive.getCatalogSettingValue("faceapikey");
	if(api==null) {
		//No Face API key defined
		log.info("No Face Detect API key defined (faceapikey)");
		return;
	}

	Lock lock = archive.getLockManager().lockIfPossible("facescanning", "admin");
	
	if( lock == null)
	{
		log.info("Face scanning already in progress");
		return;
	}
	
	int count = 0;

	try
	{	
		HitTracker hits = archive.query("asset").exact("facescancomplete", "false").exact("importstatus","complete").search();
		hits.enableBulkOperations();
			
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		if (hits.size() > 0) {
			for(Data hit in hits)
			{
				Asset asset = archive.getAssetSearcher().loadData(hit);
				if(manager.extractFaces(asset)) {
					count = count +1;
				}
			}
			
			log.info("("+archive.getCatalogId()+") Facescan processed  " + hits.size() + " assets, " + count + " faces detected");
		}
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
