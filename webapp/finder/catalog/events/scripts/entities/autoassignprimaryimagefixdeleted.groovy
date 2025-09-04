package asset;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker


//assign primaryimage from recent image

public void init()
{
	WebPageRequest req = context;
	MediaArchive archive = req.getPageValue("mediaarchive");
	
	Searcher modulesearcher = archive.getSearcher("module");
	AssetSearcher assetsearcher = (AssetSearcher)archive.getAssetSearcher();
	
	HitTracker modulehits = modulesearcher.query().exact("enableuploading", true).search();
	
	Boolean changed = false;
	
	modulehits.each{
		Data module = it;
		if(!module.getId().equals("asset")) {
			String searchtype = module.getId();
			Searcher searcher = archive.getSearcher(searchtype);
			if(searcher != null) {
		
				HitTracker entities = searcher.query().all().search();
				entities.enableBulkOperations();
				List tosave = new ArrayList();
				entities.each{
					Data entity = it;		
					
						String assetid  = entity.get("primaryimage");
						if (assetid == null)
						{
							assetid = entity.get("primarymedia");
						}
						if (assetid != null)
                        {
                            Data asset = archive.getAsset(assetid);
						
                            if (asset == null)
                            {
                                log.info("Removed primary image from Entity: " + entity + ", asset may deleted: " + assetid);
								entity.setValue("primaryimage", "");
								entity.setValue("primarymedia", "");
								tosave.add(entity);
                            }
                            
                        }
					
							
						if( tosave.size() == 1000)	{
							searcher.saveAllData(tosave, null);
							tosave.clear();
							log.info("Saved: 1000");
						}
					
				}
				if (tosave.size() > 0) {
					searcher.saveAllData(tosave, null);
					log.info("Saved: "+ tosave.size() + " " + searchtype);
				}
			}
			
		}
	}
	//Clear Cache if something changed
	if (changed) {
		archive.clearCaches();
	}
	
	
}

init();



