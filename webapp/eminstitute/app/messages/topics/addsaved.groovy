package importing;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.LibraryCollection
import org.entermediadb.projects.ProjectManager
import org.openedit.Data
import org.openedit.users.User


public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");

	String collectionid = context.getRequestParameter("collectionid");
	LibraryCollection collection = archive.getData("librarycollection", collectionid);

	ProjectManager pm = archive.getProjectManager();

	String sendtouserid = context.getRequestParameter("sendto.value");
	User sendtouser = archive.getUser(sendtouserid);
	LibraryCollection target = pm.getMessagesCollection(sendtouser);
	
	def pair = [collection.getId(),target.getId()];
	
	Data currenttopic = archive.query("collectiveproject").andExact("parentcollectionid",pair).searchOne();
	if( currenttopic == null)
	{
		currenttopic = archive.getSearcher("collectiveproject").createNewData();
		currenttopic.setValue("parentcollectionid",pair);
		archive.saveData("collectiveproject",currenttopic);
	}
	context.putPageValue("currenttopic",currenttopic); 
}

init();


