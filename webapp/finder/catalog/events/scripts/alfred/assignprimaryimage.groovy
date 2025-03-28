package librarycollection;

import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init(){
	
	MediaArchive archive = req.getPageValue("mediaarchive");
	Searcher publicationsearcher = archive.getSearcher("publication");
	Searcher pubpartsearcher = archive.getSearcher("publicationpart");
	Searcher pubscoresearcher = archive.getSearcher("publicationscore");
	Searcher relatedsearcher = archive.getSearcher("publicationrelated");
	

}

public void assignimage(MediaArchive archive, Searcher searcher) {
	
	HitTracker entities = searcher.query().and().missing("primaryimage").missing("primarymedia").search();
	
	if (entities != null) {
		entities.enableBulkOperations();
		List tosave = new ArrayList();
		entities.each{
			Data entity = it;
			//Find Product Image
			if (entity.get("primaryimage") == null) {  //Overwrite if exists?
				
				//Assets in category:   793939  -- Publication Files/Catpics/Large
				
				String thumbnailcat = "793939";
				 
				Data asset = archive.getAssetSearcher().query().match("category", thumbnailcat).startsWith("name", entity.get("Ref_SKU")).searchOne();
				if (asset != null)
				{
					entity.setValue("primaryimage", asset.getId());
					tosave.add(entity);
				}
			}
			if( tosave.size() == 1000)	{
				searcher.saveAllData(tosave, null);
				tosave.clear();
				log.info("Saved: 1000 images");
			}
		}
	}
}

init();

