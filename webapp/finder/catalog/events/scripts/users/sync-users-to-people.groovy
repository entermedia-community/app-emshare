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

	Searcher users = archive.getUserManager().getUserSearcher();
	HitTracker hits = users.getAllHits();
	List tosave = new ArrayList();
	hits.each { 
		if( it.getId() != "admin")
		{
			User user = archive.getUser(it.getId());
			Data entity = archive.query("entityperson").match("email",user.getEmail()).searchOne();
			if( entity == null)
			{
				entity = archive.getSearcher("entityperson").createNewData();
				if(user.getFirstName() != null && user.getLastName() != null)
				{
					entity.setName(user.getFirstName() + " " + user.getLastName());
				}
				else
				{
					entity.setName(user.getName());
				}
				entity.setValue("firstName",user.getFirstName());
				entity.setValue("lastName",user.getLastName());
				entity.setValue("contact_email",user.getEmail());
				//entity.setValue("contact_type","producer");
				tosave.add(entity);
			}
		}
	}
	log.info("Added " + tosave.size());
	archive.getSearcher("entityperson").saveAllData(tosave, null);
}
init();


