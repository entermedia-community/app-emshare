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
	
	HitTracker modulehits = modulesearcher.query().exact('isentity', true).search();
	modulehits.each{
		Data module = it;
		if(!module.getId().equals("asset")) {
			String searchtype = module.getId();
			Searcher searcher = archive.getSearcher(searchtype);
			if(searcher != null) {
				//HitTracker hits = archive.getAssetSearcher().query().all().search();
		
				HitTracker entities = searcher.query().missing('primaryimage').search();
				
				entities.enableBulkOperations();
				List tosave = new ArrayList();
				entities.each{
					Data entity = it;		
						
						Category entitycategory = archive.getEntityManager().loadDefaultFolder(module, entity, null, false);
						if(entitycategory != null) {
							Data asset = (Data)archive.getAssetSearcher().query().match("category", entitycategory.getId()).sort("uploadeddate").searchOne(context);
							if (asset) {
								entity.setValue("primaryimage", asset.getId());
								tosave.add(entity);
								log.info("Saving: "+ entity + " asset: " + asset.getName());
							}
								
							if( tosave.size() == 1000)	{
								searcher.saveAllData(tosave, null);
								tosave.clear();
								log.info("Saved: 1000");
							}
						}
					
				}
				if (tosave.size() > 0) {
					searcher.saveAllData(tosave, null);
					log.info("Saved: "+ tosave.size() + " " + searchtype);
				}
			}
		}
	}
}

init();



