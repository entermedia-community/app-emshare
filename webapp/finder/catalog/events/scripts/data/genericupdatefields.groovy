import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.cluster.IdManager
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init() {
	
	String searcherid = "postdata";
	
	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher searcher = archive.getSearcher(searcherid);
	HitTracker rows = searcher.getAllHits();
	ArrayList saveAll = new ArrayList();
	rows.enableBulkOperations();
	rows.each{
		String id = it.id;
	
		Data row = searcher.loadData(id);

		String keywords = row.get("knowledgebase_tag");
		if (keywords != null)
		{
			String fixedkeywords = keywords.replace(",", "|");
			row.setValue("knowledgebase_tag", fixedkeywords);
			saveAll.add(row);
		}
		
		
	}
	searcher.saveAllData(saveAll, null);
	
}


init();