package asset

import org.entermediadb.asset.MediaArchive
import org.entermediadb.dropbox.DropboxManager

public void runit()
{
	
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");

	DropboxManager manager = mediaArchive.getBean("dropboxManager");
	manager.listNamespaces();
	manager.listTeamMembers();
	
	manager.listFolders("");
	
}

runit();

