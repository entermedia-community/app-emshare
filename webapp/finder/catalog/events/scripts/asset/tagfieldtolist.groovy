package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.hittracker.HitTracker
import org.openedit.util.PathUtilities


public void init()
{
	
	String field1 = "videographer";  //tag field
	String field2 = "entityvideographer"; //entity field
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	AssetSearcher searcher = archive.getAssetSearcher();
	HitTracker hits = archive.query("asset").search();
	hits.enableBulkOperations();
		
	int saved = 0;
	List tosave = new ArrayList();
	
	for(Data hit in hits) {
		Asset asset = searcher.loadData(hit);
		if (tagtoentity(asset, field1, field2)) {
			log.info("Found asset " + asset.getId() + " : " + asset.getValues(field1) + " - " + asset.getValues(field2));
			tosave.add(asset); 
		}
		
		if( tosave.size() == 100 )	{
				saved = saved +  tosave.size();
				log.info("Saved " + saved);
				searcher.saveAllData(tosave, user);
				tosave.clear();
			}

	}
	//searcher.delete(tosave);
	searcher.saveAllData(tosave, user);
	log.info("Saved Final: " + tosave);
	
}

public Boolean tagtoentity(Asset asset, String tagsource, String entitydest) {
	Collection<String> tags = asset.getValues(tagsource);
	Collection assetTags = new HashSet();
	if (tags != null ) {
		for(tag in tags) {
			Data thetags = saveToList(entitydest, tag);
			assetTags.add(thetags.getId());
		}
		asset.setTagsValue(entitydest, assetTags);
		return true;
		
	}
	return false;
}


public Data saveToList(String tableName, Object value)
{
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	String id = PathUtilities.extractId(value.toString());
	Data data = mediaarchive.getCachedData(tableName, id);
	if (data == null)
	{
		data = mediaarchive.getSearcher(tableName).createNewData();
		data.setId(id);
		data.setName(value.toString());
		mediaarchive.saveData(tableName, data);
	}
	return data;
}


init();
