package asset

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.page.manage.PageManager
import org.openedit.repository.ContentItem


public init()
{
	 
	
	MediaArchive mediaarchive = (MediaArchive)context.getPageValue("mediaarchive");
	
	String entitymoduleid = "copyrightreleases";
	Data entitymodule = mediaarchive.getCachedData("module", entitymoduleid);
	
	PageManager pageManager = mediaarchive.getPageManager();
	Searcher entitysearcher = mediaarchive.getSearcher(entitymoduleid);
	
	HitTracker attachments = mediaarchive.getSearcher("attachment").query().all().search();
	ArrayList tosave = new ArrayList();
	for (element in attachments) {
		String name = element.name;
		if (!name.endsWith("pdf"))
		{
			continue;
		}
		
		Asset originalasset = mediaarchive.getAsset(element.assetid);
		if (originalasset == null) {
			log.info("Original Asset Missing: " + element.assetid)
			continue;
		}
		
		String attachmentsourcepath = "/WEB-INF/data/" + mediaarchive.getCatalogId()+ "/originals/"+ element.sourcepath+ "/"+name;
		log.info("Attachmet sourcepath: " + attachmentsourcepath);
		ContentItem originalcontent = mediaarchive.getContent(attachmentsourcepath);
		if (!originalcontent.exists()) {
			log.info("Missing Original Attachment: " + attachmentsourcepath);
			continue;
		}
		
		String date = element.assetmodificationdate;
		
		//Create entity
		Data newentity = entitysearcher.query().exact("name", name).searchOne();
		if (newentity != null)
		{
			String selectedassetsourcepath = mediaarchive.getEntityManager().loadUploadSourcepath(entitymodule, newentity, null);
			String finalsourcepath = "/WEB-INF/data/" + mediaarchive.getCatalogId()+ "/originals/"+selectedassetsourcepath + "/" + name;
			ContentItem currentcontent = mediaarchive.getContent(finalsourcepath);
			if (originalcontent.getLength() != currentcontent.getLength() )
			{
				name = name + " " + currentcontent.getLength();
				newentity = entitysearcher.createNewData();
				newentity.setName(name);
			}
			else
			{
				//exists and is same size, just assign it to Original Asset
				
			}
		}
		if (newentity == null) 
		{
			newentity = entitysearcher.createNewData();
			newentity.setName(name);
			
			newentity.setValue("entity_date", date);
			mediaarchive.saveData(entitymoduleid, newentity);
			
			String selectedassetsourcepath = mediaarchive.getEntityManager().loadUploadSourcepath(entitymodule, newentity, null);
			
			//Create asset (selected file)
			String finalsourcepath = "/WEB-INF/data/" + mediaarchive.getCatalogId()+ "/originals/"+selectedassetsourcepath + "/" + name;
			ContentItem newcontent = mediaarchive.getContent(finalsourcepath);
			mediaarchive.getPageManager().getRepository().copy(originalcontent, newcontent);
			
			Asset selectedasset = mediaarchive.getAssetImporter().getAssetUtilities().createAssetIfNeeded(newcontent, mediaarchive, null);
			selectedasset.setValue("assetaddeddate", date);
			tosave.add(selectedasset);
		}
		
		//Assign entity to Original asset
		originalasset.addValue("copyrightreleases", newentity.getId());
		tosave.add(originalasset);
	}
	if (!tosave.isEmpty()) 
	{
		mediaarchive.saveAssets(tosave);
		log.info("Saved: " + tosave.size());
	}
	
	mediaarchive.fireSharedMediaEvent("importing/assetscreated");
	
}

init();
