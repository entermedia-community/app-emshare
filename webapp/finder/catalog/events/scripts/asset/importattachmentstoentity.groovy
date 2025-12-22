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
		
		//Create entity
		Data newentity = entitysearcher.createNewData();
		newentity.setName(name);
		String date = element.assetcreationdate;
	    newentity.setValue("entity_date", date);
		mediaarchive.saveData(entitymoduleid, newentity);
		
		String selectedassetsourcepath = mediaarchive.getEntityManager().loadUploadSourcepath(entitymodule, newentity, null);
				
		//Create asset (selected file)
		String attachmentsourcepath = "/WEB-INF/data/" + mediaarchive.getCatalogId()+ "/originals/"+ element.sourcepath+ "/"+name;
		log.info("Attachmet sourcepath: " + attachmentsourcepath);
		ContentItem originalcontent = mediaarchive.getContent(attachmentsourcepath);
		String finalsourcepath = "/WEB-INF/data/" + mediaarchive.getCatalogId()+ "/originals/"+selectedassetsourcepath + "/" + name;
		ContentItem newcontent = mediaarchive.getContent(finalsourcepath);
		mediaarchive.getPageManager().getRepository().copy(originalcontent, newcontent);
		
		Asset selectedasset = mediaarchive.getAssetImporter().getAssetUtilities().createAssetIfNeeded(newcontent, mediaarchive, null);
		tosave.add(selectedasset);
		
		//Assign entity to primary asset
		
		Asset originalasset = mediaarchive.getAsset(element.assetid);
		originalasset.addValue("copyrightreleases", newentity.getId());
		tosave.add(originalasset);
	}
	if (!tosave.isEmpty()) 
	{
		mediaarchive.saveAssets(tosave);
	}
	
	mediaarchive.fireSharedMediaEvent("importing/assetscreated");
	
}

init();
