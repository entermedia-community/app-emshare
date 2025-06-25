import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init() {
	
	String searcherid = "order";
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getSearcher(searcherid);
	HitTracker rows = searcher.getAllHits();

	ArrayList saveAll = new ArrayList();
	rows.enableBulkOperations();
	int count = 0;
	rows.each{

		MultiValued row = it;
		String user = row.getValue("userid");
		row.addValue("viewusers", user);
		
		
		saveAll.add(row);
		count ++;

		
		if(saveAll.size()> 1000)
		{
			searcher.saveAllData(saveAll, null);
			log.info("Saved " + count);
			saveAll.clear();
		}

		
	}
	searcher.saveAllData(saveAll, null);
	log.info("Saved " + count);
}


init();