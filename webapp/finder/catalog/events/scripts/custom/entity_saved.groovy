package entityproject

import org.apache.jasper.tagplugins.jstl.core.ForEach
import org.apache.velocity.runtime.directive.Foreach
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.hittracker.HitTracker

public void init() {
	
	String entitysubmodule = "entityactivity"; 
	String entityparent = "entityproject";

		MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");
		Data data = (Data)context.getPageValue("data");
		Collection categories = data.getValues("searchcategories");
		HitTracker existing = mediaArchive.query(entitysubmodule).exact(entityparent, data.getId()).search();
		Collection ids = existing.collectValues("id");
		List tosave = new ArrayList();
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
				newactivity.setValue("name", category.getName() + " - " + data.getName());
				newactivity.setValue("longcaption", data.getValue("longcaption"));
				newactivity.setValue("entity_date", data.getValue("entity_date"));
				tosave.add(newactivity);
			}
		}
		log.info("Saved " + tosave.size() + " - " + entitysubmodule)
		mediaArchive.saveData(entitysubmodule, tosave);
		
	
}

init();

