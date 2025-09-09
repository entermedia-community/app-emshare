package asset

import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.search.AssetSearcher
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery



/*

Done sofar:
-Rename $cat. to Departments

-Rename Multiple $cat, Marketing
-Remove null
-Combine multiple cats BabsonARTS/ | General/ | Marketing
-Move to Departments/
-Delete empty
 
-Create Entities: Departments, Events, People.
- Manualy click on entities to save


 
Original Tasks:
Everything under Libraries are Departments
Departemnts List:
-atheletics
-cutler center
Marketing move to Departments/
Move users (Collections/Galleries/*) to: User Folders/
 Create a librarycollection for each user
 
  
 

*/



public void createEntities()
{

	Searcher modulesearcher = mediaarchive.getSearcher("module");

	Data entity = modulesearcher.createNewData();
	entity.setId("edudepartment");
	entity.setName("Departments");
	entity.setProperty("uploadsourcepath", 'Departments/${edudepartment.name}');
	entity.setProperty("isentity", "true");
	entity.setProperty("showonsearch", "true");
	entity.setProperty("enableuploading", "true");
	modulesearcher.saveData(entity);
	
	entity = modulesearcher.createNewData();
	entity.setId("eduactiviy");
	entity.setName("Activity");
	entity.setProperty("uploadsourcepath", 'Activities/${eduactiviy.name}');
	entity.setProperty("isentity", "true");
	entity.setProperty("showonsearch", "true");
	entity.setProperty("enableuploading", "true");
	modulesearcher.saveData(entity);
	
	entity = modulesearcher.createNewData();
	entity.setId("edupeople");
	entity.setName("People");
	entity.setProperty("uploadsourcepath", 'People/${edupeople.name}');
	entity.setProperty("isentity", "true");
	entity.setProperty("showonsearch", "true");
	entity.setProperty("enableuploading", "true");
	modulesearcher.saveData(entity);
	
	//App Menu
	Searcher appsectionsearcher = mediaarchive.getSearcher("appsection");
	
	Data menu = appsectionsearcher.createNewData();
	menu.setId("menudepartment");
	menu.setName("Departments");
	menu.setProperty("toplevelentity", "edudepartment");
	menu.setProperty("ordering", "1");
	appsectionsearcher.saveData(menu);
	
	
	menu = appsectionsearcher.createNewData();
	menu.setId("menuactivity");
	menu.setName("Activity");
	menu.setProperty("toplevelentity", "eduactivities");
	menu.setProperty("ordering", "0");
	appsectionsearcher.saveData(menu);
	
	menu = appsectionsearcher.createNewData();
	menu.setId("menupeople");
	menu.setName("People");
	menu.setProperty("toplevelentity", "edupeople");
	menu.setProperty("ordering", "2");
	appsectionsearcher.saveData(menu);

	
}	


public void renameCategoryById(String categoryid, String categoryname) {
	
	Category category = mediaarchive.getCategory(categoryid);
	if (category != null) {
		Searcher searcher = mediaarchive.getSearcher("category");
		category.setName(categoryname);
		searcher.saveData(category);
	}
}


//copied from categories/clearduplicates.groo
public void checkCategories(MediaArchive mediaarchive, Category inCat )
{
	AssetSearcher assetsearcher = mediaarchive.getAssetSearcher();
	Map cats = new HashMap(inCat.getChildren().size());
	List copy = new ArrayList(inCat.getChildren());
	for( Category childcat in copy)
	{
		Category existing = cats.get(childcat.getName());
		if( existing != null)
		{
			//move all the assets to other one
			HitTracker all = assetsearcher.query().exact("category",childcat.getId()).search();
			all.enableBulkOperations();
			HashSet tosave = new HashSet();
			for(Data data in all)
			{
				Asset asset = mediaarchive.getAssetSearcher().loadData(data);
				asset.addCategory(existing);
				tosave.add(asset);
				//mediaarchive.saveData("asset",asset);
			}
			//Move any subchildren to the new category
			if( childcat.hasChildren())
			{
				for( Category childcat2 in childcat.getChildren())
				{
					existing.addChild(childcat2);
				}
			}
			log.info("Saving assets " + tosave.size());
			assetsearcher.saveAllData(tosave, null);
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
	for(Category childcat in inCat.getChildren())
	{
		checkCategories( mediaarchive, childcat );
	}
		
}


public void deleteCategory(String categoryid) {
	Category category = mediaarchive.getCategory(categoryid);
	if(category) {
		mediaarchive.getCategorySearcher().delete(category,user);
		log.info("Category Deleted:"+categoryid)
	}
}

public void updateParentCategory(String categoryid, String parentcategoryid) {
	Category category = mediaarchive.getCategory(categoryid);
	if(category != null) {
		category.setValue("parentid", parentcategoryid);
		mediaarchive.getCategorySearcher().saveData(category);
		log.info("Category Saved:"+categoryid)
	}
}


//copied from clearemptycategories
public void removeEmptyCategories() {
	
	HitTracker categories = mediaarchive.getCategorySearcher().getAllHits();
	HitTracker modules = mediaarchive.query("module").sort("ordering").search();
	
	categories.enableBulkOperations();
	for (Data data in categories)
	{
		SearchQuery q = mediaarchive.getAssetSearcher().createSearchQuery();
		q.addExact("category", data.getId() );
		q.addNot("editstatus","7");
		Data oneasset = mediaarchive.getAssetSearcher().searchByQuery(q);
		if( oneasset == null )
		{
			Category cat = mediaarchive.getCategorySearcher().loadData(data);
		
			//Scan modules for 
			for (Data module in modules)
			{
				String id = cat.getValue(module.getId());	
				if(id != null) {
					Searcher searcher = mediaarchive.getSearcher(module.getId());
					Data entry = (Data) searcher.searchById(id);
					if(entry != null) { 
						searcher.delete(entry,null);
						
						log.info("Deleting empty entity: " + module.getId() + " id:" + id);
					}
				}
			}	
			//Remove
			mediaarchive.getCategorySearcher().deleteCategoryTree(cat);
			log.info("removed ${cat}" );
			
		}
	}
}

public init()
{
	removeEmptyCategories();  //removes empty categories and empty entities
}


public init_full()
{
	
	MediaArchive mediaarchive = context.getPageValue("mediaarchive");
	
	//rename root $cat to Departments  AVj0tDVxnPVib_aqW1RM
	renameCategoryById("AVj0tDVxnPVib_aqW1RM", "Departments");
	
	// Departments/$cat
	renameCategoryById("AWK0qfwJ-CFYQLHMDPcV", "Marketing");
	
	//Move AYbhy2dOfHhvoan1hV_P to Departments/
	updateParentCategory("AYbhy2dOfHhvoan1hV_P", "AVj0tDVxnPVib_aqW1RM");
	//AYi7i_6QfHhvoan1iDQ6
	updateParentCategory("AYi7i_6QfHhvoan1iDQ6", "AVj0tDVxnPVib_aqW1RM");
	//AYi7i_7MfHhvoan1iDQ7
	updateParentCategory("AYi7i_7MfHhvoan1iDQ7", "AVj0tDVxnPVib_aqW1RM");
	
	//AW28n8AbPFXYA4gVMy9K
	renameCategoryById("AW28n8AbPFXYA4gVMy9K", "User Folder");
	updateParentCategory("AW28n8AbPFXYA4gVMy9K", "index");
	
	//AW5l48ErlTGEiVZ2xp9y
	renameCategoryById("AW5l48ErlTGEiVZ2xp9y", "2019 Summer Mag");
	updateParentCategory("AW5l48ErlTGEiVZ2xp9y", "AVj00WqRdFyD1fyZhHqc");
	
	//Remove: AYPrhmiBfHhvoan1gjur ($cat)
	deleteCategory("AYPrhmiBfHhvoan1gjur");
	//AYbhy2cNfHhvoan1hV_O   (null)
	deleteCategory("AYbhy2cNfHhvoan1hV_O");
	
	//mediaarchive.getCategorySearcher().reIndexAll();
	
	Category rootCat = mediaarchive.getCategorySearcher().getRootCategory();

	//checkCategories(mediaarchive, rootCat);
	
	//removeEmptyCategories();
	
	//createEntities();
	
	
}

init();
