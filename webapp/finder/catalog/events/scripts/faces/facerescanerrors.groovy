package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceProfileManager
import org.entermediadb.asset.facedetect.FaceScanInstructions
import org.openedit.MultiValued
import org.openedit.hittracker.HitTracker
import org.openedit.locks.Lock

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos
	
	String api = archive.getCatalogSettingValue("faceapikey");
	if(api==null)
	{
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
		//Searcher faceembeddingsearcher = getMediaArchive().getSearcher("faceembedding");
		
		
		HitTracker hits = archive.query("asset").not("editstatus","7").exact("facescanerror", true).sort("assetaddeddateDown").search();
		hits.enableBulkOperations();
		hits.setHitsPerPage(400);
		log.info("Checking: " + hits.size());
		
		List tosave = new ArrayList();
		
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		if (!hits.isEmpty()) 
		{
			HitTracker allfaces = archive.query("faceembedding").all().sort("assetid").search();
			allfaces.enableBulkOperations();
			FaceScanInstructions instructions = manager.createInstructions();
			for(int i=0;i < hits.getTotalPages();i++)
			{
				hits.setPage(i+1);
				long start = System.currentTimeMillis();
				Collection<MultiValued> onepage = hits.getPageOfHits();
				int saved = manager.extractFaces(instructions, onepage);
				count = count + saved;
				if( saved > 0 )
				{
					long end = System.currentTimeMillis();
					long change = end-start;
					double perasset = (double)onepage.size()/((double)change/onepage.size());
					
					log.info(" face scan processed page " + hits.getPage() + " assets in " + (change/1000) + " sec. " +  perasset + " asset/second");
					log.info(" face scan created: " + count + " total faces");
				}
			}
		}
		log.info(" face scan created: " + count + " total faces");
	}
	finally
	{
		archive.getLockManager().release(lock);
	}
}


init();
