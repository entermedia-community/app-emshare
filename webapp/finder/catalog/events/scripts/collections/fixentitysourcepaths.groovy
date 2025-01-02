package collections;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.LibraryCollection
import org.entermediadb.projects.ProjectManager
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker


public void init(){

	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher collectionsearcher = archive.getSearcher("librarycollection");
	HitTracker collections = collectionsearcher.getAllHits();
	collections.enableBulkOperations();
	int fixed = 0;
	Collection tosave = new ArrayList();
	collections.each
	{
		Data collection = (Data)it;
		String catid = collection.getValue("rootcategory");
		if( catid != null)
		{
			Category cat = archive.getCategory(catid);
			if( cat == null)
			{
				log.error("No rootcategory on" + collection);
				return;
			}
			collection.setValue("uploadsourcepath",cat.getCategoryPath());
			tosave.add(collection);
			
			if( !cat.getName().equals(collection.getName() ) )
			{
				log.error("Category not the same name on" + collection.getName() + " != " +  cat.getName() );
			}			
			fixed++;
		}
		else
		{
			log.error("No rootcategory on" + collection);
		}
	}
	archive.saveData("librarycollection",tosave);
	log.info("Fixed collections " + fixed);
}


init();

