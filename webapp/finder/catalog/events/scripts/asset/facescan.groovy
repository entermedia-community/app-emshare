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
		HitTracker hits = archive.query("asset").not("editstatus","7").exact("facescancomplete", "false").exact("importstatus","complete").sort("filesizeDown").search();
		hits.enableBulkOperations();
		hits.setHitsPerPage(50);
		List tosave = new ArrayList();
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		if (!hits.isEmpty()) 
		{
			log.info("Checking :" + hits.size());
			for(int i=0;i < hits.getTotalPages();i++)
			{
				hits.setPage(i+1);
				long start = System.currentTimeMillis();
				int saved = manager.extractFaces(hits.getPageOfHits());
				count = count + saved;
				if( saved > 0 )
				{
					long end = System.currentTimeMillis();
					long change = end-start;
					log.info(" face scan created " + saved + " faces in " + change + " milliseconds: Total: " + count );
				}
			}
			//log.info("("+archive.getCatalogId()+") Facescan processed  " + hits.size() + " assets, " + count + " faces detected");
		}
		log.info(" face scan total: " + count );
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
