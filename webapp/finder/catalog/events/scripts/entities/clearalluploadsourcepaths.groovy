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
	
	HitTracker modules = mediaArchive.query("module").exact("isentity",true).sort("ordering").search();
	log.info("Scanning: " + modules);
	for (Data module in modules)
	{
		int count = 0;
		Collection hits = mediaArchive.query(module.getId()).all().search();
		Collection tosave = new ArrayList();
		for (Data hit in hits)
		{
			if( hit.getValue("uploadsourcepath") != null || hit.getValue("rootcategory") )
			{
				hit.setValue("uploadsourcepath",null);
				hit.setValue("rootcategory",null);
				tosave.add(hit);
				count++;
			}
		}
		mediaArchive.saveData(module.getId(),tosave);
		log.info("Edited " + module + " " + count);
	}	
}

init();
