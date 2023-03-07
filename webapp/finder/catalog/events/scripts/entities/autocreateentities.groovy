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
		int deep = module.getInt("autocreatedeep");
		log.info("Scanning: " + startingpath);
		//scan folders till deep
		Category root = mediaArchive.createCategoryPath(startingpath);
		processChildren(mediaArchive, module, root,deep, 0);		
	}	
}
public void processChildren(MediaArchive mediaArchive, Data inmodule, Category parent, int startfromdeep, int currentdeep)
{
	if(startfromdeep == currentdeep )
	{
		//Check each child
		for (Data child in parent.getChildren())
		{
			 String id = childg.getValue(inmodule.getId());
			 if( id == null )
			 {
			 	Data newchild = mediaArchive.getSearcher(inmodule.getId()).createNewData();
			 	newchild.setName(child.getName());
			 	
			 	//TODO Check parent for any entites and pass those down
			 	for( String key in parent.getProperties().keySet() )
			 	{
			 		if( mediaArchive.getCachedData("module",key ) != null )
			 		{
			 			String val = parent.get(key);
			 			newchild.setValue(key,val);
			 		}
			 	}
			 	mediaArchive.saveData(inmodule.getId(),newchild);
			 	log.info("Save new entity " + inmodule + " / " + newchild);
			 }
		}
	}
	else
	{
		int nextdeep = currentdeep++;
		for (Data child in parent.getChildren())
		{
			processChildren(mediaArchive,inmodule, child,deep, nextdeep);
		}
	}
}

init();

