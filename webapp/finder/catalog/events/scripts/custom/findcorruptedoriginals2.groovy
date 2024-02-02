package asset;

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.repository.*
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery

public void checkforTasks()
{
	mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");//Search for all files looking for videos
	
	AssetSearcher searcher = mediaarchive.getAssetSearcher();
	//recordmodificationdate
	//editstatus:7
	
	SearchQuery query = searcher.createSearchQuery();
	//query.addMatches("editstatus", "7");
	
	query.addSortBy("filesizeDown");
	
	HitTracker newitems = searcher.search(query);
	newitems.enableBulkOperations();

	log.info("Searching for ${query.toString()} found ${newitems.size()}");
	
	Collection tosave = new ArrayList();
	
	Integer count = 0;
	
	for (Data hit in newitems)
	{	
		Asset realitem = searcher.searchById(hit.getId());
		
		
		if (realitem != null)
		{
			
			Double filesize = realitem.get("filesize").toDouble();
			
			ContentItem fullpath = 	mediaarchive.getOriginalContent(realitem);
			
			if(fullpath.getLength() == 138){
				if (filesize < 2000000) {

					if(realitem.getSourcePath() != null) {
						log.info(realitem.getName() + " " + realitem.get("filesize"));					
						ContentItem sourceImagepath = mediaarchive.getPageManager().getRepository().get("/WEB-INF/data/" + mediaarchive.getCatalogId() + "/generated/" + realitem.getSourcePath() + "/" + "image1500x1500.jpg");	
						
						if(sourceImagepath.exists())
						{
							
							pageManager.getRepository().remove(fullpath);
							pageManager.getRepository().copy(sourceImagepath, fullpath);
							
							realitem.setValue("originalreplaced", true);
							realitem.setValue("corruptedoriginal", false);
							tosave.add(realitem);
								
							log.info("Saved to: "  + fullpath);
							count = count +1;
						}
					}
				}
				
				
			}
		}
		else
		{
			log.info("Can't find task object with id '${hit.getId()}'. Index out of date?")
		}
	}
	log.info(count);
	mediaarchive.saveAssets(tosave);
	
}


checkforTasks();



