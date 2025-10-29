package categories

import org.entermediadb.asset.Category
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
	
	String searchtype = "category";
	Searcher searcher = archive.getSearcher(searchtype);
	HitTracker hits = searcher.query().all().search();
	
	
	hits.enableBulkOperations();
	List tosave = new ArrayList();
	hits.each{
		Data hit = it;		
		
		Category category = searcher.loadData(hit);
		
		String path = category.loadCategoryPath();
		category.setValue("parents", category.getParentCategories());
		category.setValue("categorypath", path);
		
		tosave.add(category);			
		if( tosave.size() == 1000)
		{
			searcher.saveAllData(tosave, null);
			tosave.clear();
			log.info("Saved: 1000 (" + searchtype + ")");
		}
		
	}
	if (tosave.size() > 0) {
		searcher.saveAllData(tosave, null);
		log.info("Saved: "+ tosave.size() + " (" + searchtype + ")");
	}
	
}


init();



