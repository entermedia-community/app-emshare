package asset

import org.entermediadb.asset.*
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


	int count = 0;



		//Searcher faceembeddingsearcher = getMediaArchive().getSearcher("faceembedding");
		
		HitTracker hits = archive.query("asset").not("editstatus","7").exact("facehasprofile", "false").sort("filesizeDown").search();
		hits.enableBulkOperations();
		List tosave = new ArrayList();
		
		log.info("Found " + hits.size() + " assets");
		for(Data hit in hits)
        {
			hit.setValue("facescanerror", "true");
			tosave.add(hit);
			count++;
			if (tosave.size() > 1000) 
            {
				log.info("Saving " + tosave.size() + " assets");
                archive.saveData("asset", tosave);
                tosave.clear();
            }
		}

		log.info("Saved " + count + " assets");
		archive.saveData("asset", tosave);
		tosave.clear();
			

}


init();
