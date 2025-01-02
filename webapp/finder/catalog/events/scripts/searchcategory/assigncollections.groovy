package entityproject

import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init() {
	
	String entitysubmodule = "entityactivity"; 
	String entityparent = "entityproject";

		MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");
		
		HitTracker entities = mediaArchive.query(entityparent).search();
		entities.enableBulkOperations();

		List tosave = new ArrayList();
		
		entities.each
		{
			Data data = it;
			Collection categories = data.getValues("searchcategory");
			if(categories != null) 
			{
				log.info("Searching unassigned categories for: " +  data);
				HitTracker existing = mediaArchive.query(entitysubmodule).exact(entityparent, data.getId()).search();
				Collection ids = existing.collectValues("id");
				for (String cat in categories) {
					boolean foundcopy = false;
					for (Data activity in existing) {
						if (activity.getId().endsWith(cat)) 
						{
							foundcopy = true;
							break;
						}
					}
					if(!foundcopy) 
					{
						Data category = mediaArchive.getCachedData("searchcategory", cat);
						Data newactivity = mediaArchive.getSearcher(entitysubmodule).createNewData();
						newactivity.setId(data.getId() + cat);
						newactivity.setValue(entityparent, data.getId());
						newactivity.setValue("name", category.getName() + " - " + data.getName());
						newactivity.setValue("longcaption", data.getValue("longcaption"));
						newactivity.setValue("searchcategory", cat);
						newactivity.setValue("entity_date", data.getValue("entity_date"));
						tosave.add(newactivity);
						if(tosave.size()>100)
						{
							log.info("Saved " + tosave.size() + " - " + entitysubmodule);
							mediaArchive.saveData(entitysubmodule, tosave);
							tosave.clear();
						}
					}
				}
			}
		}
		mediaArchive.saveData(entitysubmodule, tosave);
}

init();

