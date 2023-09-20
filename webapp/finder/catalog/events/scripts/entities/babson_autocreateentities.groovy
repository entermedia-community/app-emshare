package entities;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.Category
import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.users.User
import org.openedit.util.DateStorageUtil

import groovy.util.logging.Log


public void init()
{
	MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");

    //Scan Modules for Scan Path. Make a new child as needed dependi
	
	HitTracker modules = mediaArchive.query("module").exact("autocreateentities","true").sort("ordering").search();
	log.info("Scanning: " + modules);
	for (Data module in modules)
	{
		String startingpath = module.get("autocreatestartingpath");
		int deeplevel = module.getInt("autocreatedeep");
		log.info("Scanning: " + module + "for " + startingpath);
		//scan folders till deep
		Category root = mediaArchive.createCategoryPath(startingpath);
		int count = root.getParentCategories().size();
		processChildren(mediaArchive, module, root,deeplevel, count);		
	}	
}
public void processChildren(MediaArchive mediaArchive, Data inmodule, Category parent, int startfromdeep, int currentdeep)
{
	if(startfromdeep == currentdeep )
	{
		//Check each child
		for (Data category in parent.getChildren())
		{
			 String id = category.getValue(inmodule.getId());
			 if( id == null )
			 {
			 	Data newchild = mediaArchive.getSearcher(inmodule.getId()).createNewData();
				 
				String categoryname = category.getName();
				
				/*
				 * 2014-15 Alumni_Gameday
				 * 2017 Softball_NCAA Regional
				 * 2023-08-25 Orientation_JKnight
				 * Alpine Ski_180120
				 * */
				
				
				
				if(categoryname.startsWith('20')) {
					//matches 20xx-***
					String yearname = categoryname.substring(0, 4);
				}
				
			 	newchild.setName(categoryname);
			 	
			 	//TODO Check parent for any entites and pass those down
			 	for( String key in parent.getProperties().keySet() )
			 	{
			 		if( mediaArchive.getCachedData("module",key ) != null )
			 		{
			 			String val = parent.get(key);
			 			newchild.setValue(key,val);
			 		}
			 	}
			 	
			 	newchild.setValue("uploadsourcepath",category.getCategoryPath());
			 	mediaArchive.saveData(inmodule.getId(),newchild);
			 	category.setValue(inmodule.getId(), newchild.getId());
			 	mediaArchive.saveData("category",category);
			 	log.info("Save new entity " + inmodule + " / " + newchild);
			 }
		}
	}
	else
	{
		log.info("processChildren Folder:" + parent + " Actual:" + currentdeep + " Matches? " + startfromdeep);
	
		int nextdeep = currentdeep + 1;
		for (Data child in parent.getChildren())
		{
			processChildren(mediaArchive,inmodule, child,startfromdeep, nextdeep);
		}
	}
}

init();

