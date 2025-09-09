package entities;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.Category
import org.openedit.Data
import org.openedit.data.*
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
	mediaArchive.clearCaches();
	HitTracker modules = mediaArchive.query("module").exact("isentity",true).sort("ordering").search();
	for (Data module in modules)
	{
		PropertyDetail detail = mediaArchive.getSearcher(module.getId()).getDetail("sourcepath");
		if( detail == null)
		{
			continue;
		}
		int count = 0;
		Collection hits = mediaArchive.query(module.getId()).all().search();
		Collection tosave = new ArrayList();
		for (Data hit in hits)
		{
			if( hit.getValue("sourcepath") != null || hit.getValue("rootcategory") != null)
			{
				//Reload path 
				hit.setValue("rootcategory",null); //this will auto correct
				hit.setValue("sourcepath",null);
				hit.setValue("archivesourcepath",null);
				String sourcepath = mediaArchive.getEntityManager().loadUploadSourcepath(module, hit, null, true);
				//log.info("  	Set:" + module.getId() + " -> " + sourcepath);
				hit.setValue("sourcepath",sourcepath);
				//TODO: Now reload one at a time based on parent child relationships
				tosave.add(hit);
				count++;
			}	
		}
		mediaArchive.saveData(module.getId(),tosave);
		log.info( "" + module + " " + count);
	}	
	mediaArchive.clearCaches();
}

init();
