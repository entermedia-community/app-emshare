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
		
		
		HitTracker hits = archive.query("asset").not("editstatus","7").exact("facescanerror", "true").sort("assetaddeddateDown").search();
		hits.enableBulkOperations();
		hits.setHitsPerPage(500);
		log.info("Checking: " + hits.size());
		
		List tosave = new ArrayList();
		
		FaceProfileManager manager = archive.getBean("faceProfileManager");
		if (!hits.isEmpty()) 
		{
			
			HitTracker allfaces = archive.query("faceembedding").all().sort("locationhUp").search();
			allfaces.enableBulkOperations();
			Collection assetids = allfaces.collectValues("assetid");
			log.info("Loaded ${assetids.size{()} assetids");  
			FaceScanInstructions instructions = manager.createInstructions();
			
			instructions.setFindParents(false);
			instructions.setUpdateExistingFace(false); //There will be no new ones anyways
			
			for(int i=0;i < hits.getTotalPages();i++)
			{
				hits.setPage(i+1);
				long start = System.currentTimeMillis();
				Collection<MultiValued> onepage = hits.getPageOfHits();
				Collection<MultiValued> newpage = new ArrayList();
				
				for(MultiValued data in onepage)
				{
					if(!assetids.contains(data.getId()))
					{
						newpage.add(data);
					}
					else
                    {
					  data.setValue("facescanerror", false);
                      tosave.add(data);
                    }
				}
				log.info("Skiped " + tosave.size() + " assets");
				archive.saveData("asset", tosave);
				tosave.clear();
				
				
				int saved = manager.extractFaces(instructions, newpage);
				count = count + saved;
				if( saved > 0 )
				{
					long end = System.currentTimeMillis();
					long change = end-start;
					double perasset = (double)onepage.size()/((double)change/onepage.size());
					
					log.info(" face scan processed " + onepage.size() + " assets in " + (change/1000) + " sec. " +  perasset + " asset/second");
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
