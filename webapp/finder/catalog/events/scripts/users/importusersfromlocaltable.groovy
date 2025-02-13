package utils;

import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.users.User


public void init()
{
	WebPageRequest req = context;
	MediaArchive archive = req.getPageValue("mediaarchive");
	
	Searcher userssourcesearcher = archive.getSearcherManager().getSearcher(archive.getCatalogId(), "usertemp");
	Searcher usersearcher = archive.getUserManager().getUserSearcher();
	
	HitTracker hits = userssourcesearcher.getAllHits();
	List tosave = new ArrayList();
	hits.each {

		//search by emailaddress
		User found = archive.getUserManager().getUserByEmail(it.get("email"));
		if (!found) {
			found = (User)usersearcher.createNewData();
			//fix id to avoid duplicates
			String newid = "emorg_" + it.getId();
			found.setId(newid);
			found.setEmail(it.get("email"));
			found.setFirstName(it.get("firstname"));
			found.setLastName(it.get("lastname"));
			found.setPassword(it.get("password"));
			found.setValue("creationdate",it.get("creationdate"));
			found.setValue("lastlogin",it.get("lastlogin"));
			
			tosave.add(found);
			//usersearcher.saveData(found,null);
			log.info("Importing: " + it.get("email"));
		}	
		
		//add to project as follower
		String collectionid = "AZR1eDv-51lGyX3yxY7s";
		Searcher collectionusersearcher = archive.getSearcherManager().getSearcher(archive.getCatalogId(), "librarycollectionlikes");
		Data collectionuser = collectionusersearcher.query().exact("collectionid", collectionid).exact("followeruser", found.getId()).searchOne();
		if (collectionuser == null) {
			collectionuser = collectionusersearcher.createNewData();
			collectionuser.setValue("followeruser", found.getId());
			collectionuser.setValue("collectionid", collectionid);
			collectionuser.setValue("addeddate", new Date());
			collectionusersearcher.saveData(collectionuser);
			log.info("Added to Collection: " + it.get("email"));
		}
		
	}
	archive.getSearcher("user").saveAllData(tosave, null);

}
init();


