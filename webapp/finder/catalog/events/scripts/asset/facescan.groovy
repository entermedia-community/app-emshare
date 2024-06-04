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
		log.info("Faceprofile scanning already in progress");
		return;
	}
	
	int count = 0;

	try
	{	
		HitTracker hits = archive.query("asset").exact("facescancomplete", "false").exact("importstatus","complete").sort("assetaddeddateDown").search();
		hits.enableBulkOperations();
		List tosave = new ArrayList();
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		if (hits.size() > 0) {
			for(Data hit in hits)
			{
				Asset asset = archive.getAssetSearcher().loadData(hit);
				if(manager.extractFaces(asset)) {
					count = count +1;
				}
				tosave.add(asset);
				if(tosave.size() == 100)
				{
						archive.saveAssets(tosave);
						tosave.clear();
						log.info("Faceprofile scanned:  " + tosave.size() + " records. Found " + count);
				}
			}
			archive.saveAssets(tosave);
			log.info("Faceprofile scanned:  " + tosave.size() + " records. Found " + count);
			
			//log.info("("+archive.getCatalogId()+") Facescan processed  " + hits.size() + " assets, " + count + " faces detected");
		}
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
