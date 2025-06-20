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
		HitTracker hits = archive.query("asset").not("editstatus","7").exact("facescancomplete", "false").exact("importstatus","complete").sort("assetaddeddateDown").search();
		hits.enableBulkOperations();
		
		List tosave = new ArrayList();
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		if (!hits.isEmpty()) 
		{
			log.info("Checking :" + hits);
			for(Data hit in hits)
			{
				Asset asset = archive.getAssetSearcher().loadData(hit);
				long start = System.currentTimeMillis();
				int more = manager.extractFaces(asset);
				if( more > 0 )
				{
					long end = System.currentTimeMillis();
					long change = end-start;
					log.info(more + " face found in " + hit.getName() + " in " + change + "milliseconds #id=" + hit.getId() );
				}
				count = count + more;
				tosave.add(asset);
				if(tosave.size() == 100)
				{
						archive.saveAssets(tosave);
						log.info("Faceprofile scanned:  " + tosave.size() + " assets. Found " + count + " faces ");
						tosave.clear();
						count = 0;
				}
			}
			if(tosave.size() > 0)
			{
				archive.saveAssets(tosave);
				log.info("Faceprofile scanned:  " + tosave.size() + " assets. Found " + count + " faces ");
			}
			//log.info("("+archive.getCatalogId()+") Facescan processed  " + hits.size() + " assets, " + count + " faces detected");
		}
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
