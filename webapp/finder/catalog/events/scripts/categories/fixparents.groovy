package categories

import org.entermediadb.asset.Category;
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init()
{
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	
	Category parent = mediaarchive.getCategory("1464281146024"); //1464281146024
	log.info("Parent category: " + parent.getId() + " - " + parent.getChildren().size());
	Category parenttarget = mediaarchive.getCategory("AYi7i_7MfHhvoan1iDQ7"); //Marketing
	for (Category cat in parent.getChildren())
	{
		parenttarget.addChild(cat);
		
	}
	mediaarchive.saveData("category", parent.getChildren());
	
	
	HitTracker activities = mediaarchive.query("eduactivity").startsWith("uploadsourcepath", "Activities/0000-2023/Marketing0000").search();
	log.info("Found " + activities.size() + " activities to update");
	List tosave = new ArrayList();
	for (Data activity in activities)
    {
	    String oldpath = activity.get("uploadsourcepath");
		String newpath = oldpath.replace("Activities/0000-2023/Marketing0000", "Activities/0000-2023/Marketing");
		activity.setValue("uploadsourcepath", newpath);
		activity.setValue("rootcategory", null);
		tosave.add(activity);
		log.info("Updating activity " + activity.getId() + " from " + oldpath + " to " + newpath);
        
    }
	mediaarchive.saveData("eduactivity", tosave);
	
}



init();

