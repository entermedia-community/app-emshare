package asset

import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.page.Page
import org.openedit.util.DateStorageUtil
import org.openedit.util.PathUtilities



//copied from clearemptycategories
public void fixPaths() {
	WebPageRequest req = context;
	MediaArchive archive = req.getPageValue("mediaarchive");
	
	Searcher entitysearcher = archive.getSearcher("eduactivity");
	HitTracker entities = entitysearcher.query().all().search();
	
	Data module = archive.getCachedData("module", "eduactivity")
	
	entities.enableBulkOperations();
	List tosave = new ArrayList();
	entities.each{
		Data entity = it;
			
			Category entitycategory = archive.getEntityManager().loadDefaultFolder(module, entity, null, false);
			if(entitycategory != null) {
				
				Data parent = entitycategory.getParentCategory();
				
				if(parent.get("categorypath").equals("Activities/null")) {
					//fix it
					
					String categorypath = parent.get("categorypath");
					
					String year = DateStorageUtil.getStorageUtil().formatDateObj(entity.getValue("entity_date"), "yyyy");
					String month = DateStorageUtil.getStorageUtil().formatDateObj(entity.getValue("entity_date"), "MM");
					
					if(year != null && month != null) {
						String newcategorypath = PathUtilities.extractRootDirectory(categorypath) + "/" + year + "/" + month;
						//move assets
						moveAssets(archive, entitycategory.getId(), newcategorypath);
						
						Category newparent = archive.createCategoryPath(newcategorypath);
						entitycategory.setParentCategory(newparent);
						archive.getCategorySearcher().saveCategory(entitycategory);
						log.info("Saved: " + entitycategory.get("categorypath"));
					}
					
				
				}
				
				
			}
		
	}
	if (tosave.size() > 0) {
		//entitysearcher.saveAllData(tosave, null);
		log.info("Saved: "+ tosave.size());
	}
}

public moveAssets(MediaArchive archive, String inCategoryId, String inNewcategorypath) {
	AssetSearcher assetsearcher = archive.getAssetSearcher();
	HitTracker all = assetsearcher.query().exact("category",inCategoryId).search();
	all.enableBulkOperations();
	HashSet tosave = new HashSet();
	for(Data data in all)
	{
		Asset asset = archive.getAssetSearcher().loadData(data);
		String assetsourcepath =  asset.getSourcePath();
		Page fullpath = pageManager.getPage("/WEB-INF/data/" + archive.getCatalogId() + "/originals/" + assetsourcepath );
		if(fullpath.exists()){
			String newsourcepath = assetsourcepath.replace("Activities/null", inNewcategorypath);
			Page newpage = pageManager.getPage("/WEB-INF/data/" + archive.getCatalogId() + "/originals/" + newsourcepath);
			pageManager.movePage(fullpath,newpage);
			log.info("Moving asset to: ${newpage.getContentItem().getAbsolutePath()}");
			asset.setValue("sourcepath",newsourcepath);
			asset.setValue("importstatus", "created");
			tosave.add(asset);
		}
	}
	assetsearcher.saveAllData(tosave, null);
}


public init()
{
	fixPaths();  //removes empty categories and empty entities
}


init();
