import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery

public void init()
{
		MediaArchive archive = context.getPageValue("mediaarchive");
		Searcher tasksearcher = archive.getSearcherManager().getSearcher(archive.getCatalogId(), "conversiontask");
		
		SearchQuery query = tasksearcher.createSearchQuery();
		//query.addMatches("status", "error");
		
		HitTracker tasks = tasksearcher.search(query);
		
		if (tasks.isEmpty())
		{
			return;
		}
		
		log.info("Clearing " + tasks.size()+ " conversion errors.");
		
		tasks.enableBulkOperations();
		List all = new ArrayList(tasks);
		for (Data hit in all)
		{
			Data realtask = tasksearcher.searchById(hit.getId());
			realtask.setProperty("status","new");
			tasksearcher.saveData(realtask,null);
		}
}

init();