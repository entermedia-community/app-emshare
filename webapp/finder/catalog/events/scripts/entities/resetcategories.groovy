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
	HitTracker modules = mediaArchive.query("module").exact("isentity",true).not("id", "asset").sort("ordering").search();
	for (Data module in modules)
	{
		PropertyDetail detail = mediaArchive.getSearcher(module.getId()).getDetail("uploadsourcepath");
		if( detail == null)
		{
			continue;
		}
		int count = 0;
		Collection hits = mediaArchive.query(module.getId()).all().search();
		Collection tosave = new ArrayList();
		for (Data hit in hits)
		{
			String sourcepath = hit.getValue("uploadsourcepath");
			if( sourcepath == null )
			{
				sourcepath = mediaArchive.getEntityManager().loadUploadSourcepath(module, hit, null);
				hit.setValue("uploadsourcepath",sourcepath);
			}
			Category rootcategory = mediaArchive.getCategorySearcher().createCategoryPath(sourcepath);
			if (rootcategory != null)
			{
				hit.setValue("rootcategory", rootcategory.getId());
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
