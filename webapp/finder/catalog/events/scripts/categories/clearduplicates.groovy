package categories

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.xmldb.CategorySearcher
import org.openedit.Data

public void init()
{
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	CategorySearcher searcher = mediaarchive.getCategorySearcher();
	
	
	checkChildren( mediaarchive, mediaarchive.getCategorySearcher().getRootCategory() );
		
}

public void checkChildren(MediaArchive mediaarchive, org.entermediadb.asset.Category inCat )
{
	
	Map cats = new HashMap(inCat.getChildren().size());
	List copy = new ArrayList(inCat.getChildren());
	for( org.entermediadb.asset.Category childcat in copy)
	{
		org.entermediadb.asset.Category existing = cats.get(childcat.getName());
		if( existing != null)
		{
			//move all the assets to other one
			Collection assets = mediaarchive.query("asset").exact("category",childcat.getId()).search();
			for(Data data in assets)
			{
				Asset asset = mediaarchive.getAssetSearcher().loadData(data);
				asset.addCategory(existing);
				mediaarchive.saveData("asset",asset);
			}
			//Move any subchildren to the new category
			if( childcat.hasChildren())
			{
				for( org.entermediadb.asset.Category childcat2 in childcat.getChildren())
				{
					existing.addChild(childcat2);
				}
			}
			//delete new cat
			inCat.removeChild(childcat);
			mediaarchive.getCategorySearcher().delete(childcat,user);
			mediaarchive.getCategorySearcher().saveData(inCat);
			
			log.info("Deleted " + childcat.getCategoryPath());
		}
		else
		{
			cats.put(childcat.getName(),childcat);
		}
		
	}
	//Check remaining ones
	for( org.entermediadb.asset.Category childcat in inCat.getChildren())
	{
		checkChildren( mediaarchive, childcat );
	}
		
}
log.info("Clear duplicate categories");
init();
