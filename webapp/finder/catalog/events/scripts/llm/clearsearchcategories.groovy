import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.QueryBuilder
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init() {
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	
	//Delete the semanticebeded table first
	archive.getSearcher("semanticembedding").deleteAll(null);

	HitTracker allmodules = archive.query("module").exact("semanticenabled", true).search();
	for (module in allmodules) {
		
		QueryBuilder query = archive.query(module.getId()).exact("taggedbyllm", "true").exact("semantictopicsindexed", "true");
		//QueryBuilder query = archive.query(module.getId()).exact("taggedbyllm", "true").exists("semantictopics");
		
		HitTracker rows = query.search();
		rows.enableBulkOperations();
	
		ArrayList saveAll = new ArrayList();
		int count = 0;
		Searcher searcher = archive.getSearcher(module.getId());
		for(data in rows) 
		{
			
			Data row = searcher.loadData(data);
			
			row.setValue("taggedbyllm", false);
			row.setValue("semantictopicsindexed", false);
			row.setValue("searchcategory", null);
			
			saveAll.add(row);
			count ++;
			if(saveAll.size()> 1000)
			{
				searcher.saveAllData(saveAll, null);
				log.info("Saved " + count + " in " + module);
				saveAll.clear();
			}
			
		}
		searcher.saveAllData(saveAll, null);
		log.info("Saved " + count + " in " + module);
		if(module.getId() == "asset")
		{
			archive.fireSharedMediaEvent("importing/assetscreated");
		}
	}
}


init();