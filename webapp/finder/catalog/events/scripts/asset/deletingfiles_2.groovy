package asset;

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery
import org.openedit.repository.ContentItem

public void init() {
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	AssetSearcher searcher = mediaArchive.getAssetSearcher();
	
	SearchQuery query = searcher.createSearchQuery();
	query.addContains("name", "_2.mp3");
	HitTracker hits = searcher.search(query);
	hits.enableBulkOperations();
	
	Collection todelete = new ArrayList();
	log.info("Found: " + hits.size())
	hits.each{
		Data hit = it;
		Asset deleting = mediaArchive.getAsset(hit.getId());
		todelete.add(deleting);
		log.info("To delete: " + deleting)
	
		ContentItem item = mediaArchive.getOriginalContent(deleting);
		mediaArchive.getPageManager().getRepository().remove(item);
		log.info("Deduplication deleted " + item.getAbsolutePath());
		mediaArchive.removeGeneratedImages(deleting);

	
	}
	searcher.deleteAll(todelete, null)
}

init();






