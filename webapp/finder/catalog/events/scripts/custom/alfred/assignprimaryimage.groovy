package librarycollection;

import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init(){
	
	WebPageRequest req = context;

	MediaArchive archive = req.getPageValue("mediaarchive");
	Searcher publicationsearcher = archive.getSearcher("publication");
	Searcher pubpartsearcher = archive.getSearcher("publicationpart");
	Searcher pubscoresearcher = archive.getSearcher("publicationscore");
	Searcher relatedsearcher = archive.getSearcher("publicationrelated");
	
	assignimage(archive, publicationsearcher);
	assignimage(archive, pubpartsearcher);
	assignimage(archive, pubpartsearcher);
}

public void assignimage(MediaArchive archive, Searcher searcher) {
	
	HitTracker entities = searcher.query().and().missing("primaryimage").missing("primarymedia").search();
	
	if (entities != null) {
		log.info("Missing " + entities.size() + " images - " + searcher.getSearchType());
		entities.enableBulkOperations();
		List tosave = new ArrayList();
		entities.each{
			Data entity = it;
			String refSku = entity.get("ref_sku");
			if ( refSku != null)
			{
				//Assets in category:   793939  -- Publication Files/Catpics/Large
				
				String thumbnailcat = "793939";
				 
				Data asset = archive.getAssetSearcher().query().match("category", thumbnailcat).startsWith("name", refSku).searchOne();
				if (asset != null)
				{
					entity.setValue("primaryimage", asset.getId());
					log.info("Image found: " + asset + " - for:  sku: " + refSku);
					tosave.add(entity);
				}
				if( tosave.size() == 1000)	{
					searcher.saveAllData(tosave, null);
					tosave.clear();
					log.info("Saved: " + tosave.size() + " images - " + searcher.getSearchType());
				}
			}
		}
		if( tosave.size() > 0 )	{
			searcher.saveAllData(tosave, null);
			tosave.clear();
			log.info("Saved: " + tosave.size() + " images - " + searcher.getSearchType());
		}
	}
}

init();

