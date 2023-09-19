package asset;

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker


//(Generic) Update field in a table

public void init()
{
	WebPageRequest req = context;
	MediaArchive archive = req.getPageValue("mediaarchive");
	Searcher modulesearcher = archive.getSearcher("module");
	
	HitTracker modulehits = modulesearcher.query().exact('isentity', true).search();
	modulehits.each{
		Data module = it;
		if(!module.getId().equals("asset") && !module.getId().equals("faceprofilegroup")) {
			String searchtype = module.getId();
			Searcher searcher = archive.getSearcher(searchtype);
			if(searcher != null) {
			
				//HitTracker hits = archive.getAssetSearcher().query().all().search();
				
				HitTracker hits = searcher.query().exists('primaryimage').search();
				
				hits.enableBulkOperations();
				List tosave = new ArrayList();
				hits.each{
					Data hit = it;		
					
						
						hit.setValue("primarymedia", hit.getValue("primaryimage") );
						hit.setValue("primaryimage", "");
						
						tosave.add(hit);			
						if( tosave.size() == 1000)
						{
							searcher.saveAllData(tosave, null);
							tosave.clear();
							log.info("Saved: 1000");
						}
					
				}
				if (tosave.size() > 0) {
					searcher.saveAllData(tosave, null);
					log.info("Saved: "+ tosave.size());
				}
				log.info("Done updating: " +searchtype);
			}
		}
	}
}


init();



