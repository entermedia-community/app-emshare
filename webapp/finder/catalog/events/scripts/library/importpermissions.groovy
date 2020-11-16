package library

import org.entermediadb.asset.Asset
import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.LibraryCollection
import org.entermediadb.projects.ProjectManager
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker

public void init() 
{
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	Searcher libraries = mediaArchive.getSearcher("library");
	libs = libraries.getAllHits();
	libs.each {
		Data library =  it;
		if( library.get("categoryid") == null )
		{
			String path = library.get("folder");
			if( path == null)
			{
				path = "Collections/" + library.getName();
			}
			if( path == null)
			{
				return;
			}
			Category node = mediaArchive.createCategoryPath(path);
			library.setValue("categoryid", node.getId() );
			libraries.saveData(library);
		}
		Category node = mediaArchive.getData("category",library.get("categoryid") );
		
			
		
		HitTracker users = mediaArchive.getSearcher("libraryusers").query().match("libraryid",library.getId()).search();
		users.each {
			library.addValue("viewusers",it.userid);
			if(node != null) {
				node.addValue("viewusers",it.userid);
			}
		}
		

		HitTracker groups = mediaArchive.getSearcher("librarygroups").query().match("libraryid",library.getId()).search();
		groups.each {
			library.addValue("viewgroups",it.groupid);
			if(node != null) {
				
			node.addValue("viewgroups",it.groupid);
			}
		}

		HitTracker roles = mediaArchive.getSearcher("libraryroles").query().match("libraryid",library.getId()).search();
		roles.each {
			library.addValue("viewroles",it.roleid);
			if(node != null) {
				
			node.addValue("viewroles",it.roleid);
			}
		}
		
		libraries.saveData(library);
		if( node != null)
		{
			mediaArchive.getCategorySearcher().saveData(node);
		}
		log.info("saved  ${library.getName() }");
	}

	ProjectManager projectmanager = (ProjectManager)moduleManager.getBean(catalogid,"projectManager");
	
	HitTracker all = mediaArchive.getSearcher("librarycollectionasset").getAllHits();
	all.enableBulkOperations();
	
	Collection tosave = new ArrayList();
	all.each {
		Data hit = it;
		
		LibraryCollection librarycollection = mediaArchive.getData("librarycollection",hit.get("librarycollection") );
		
		Category rootcategory = projectmanager.getRootCategory(mediaArchive,librarycollection);
		if(rootcategory != null)
		{
			String assetid = hit.get("_parent");
			if( assetid == null )
			{
				assetid = hit.get("asset");
			}
			Asset asset = mediaArchive.getAsset( assetid );
			if( asset == null)
			{
				log.error("Missing asset " + assetid);
			}
			
			if( asset != null && !asset.isInCategory(rootcategory.getId()))
			{
				asset.addCategory(rootcategory);
				tosave.add(asset);
				if( tosave.size() > 500)
				{
					mediaArchive.getAssetSearcher().saveAllData(tosave,null);
					tosave.clear();
				}
			}
		}
		else
		{
			log.info("No root category: " + librarycollection);
		}
	}
	mediaArchive.getAssetSearcher().saveAllData(tosave,null);
		
}


	
init();