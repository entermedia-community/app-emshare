package entities;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.users.PermissionManager
import org.openedit.Data
import org.openedit.data.EntityPermissions
import org.openedit.data.Searcher

public void init()
{
	MediaArchive mediaarchive = (MediaArchive) context.getPageValue("mediaarchive");

	String moduleid = context.getRequestParameter("moduleid");
	String groupid = context.getRequestParameter("settingsgroupid");
	
	PermissionManager permissionManager = mediaarchive.getBean("permissionManager");
	Map permissionassigned = permissionManager.loadEntitySettingsGroupPermissions(moduleid, groupid);
	
	String[] fields = context.getRequestParameters("field");
	
	Searcher permissionsSearcher = mediaarchive.getSearcher("permissionentityassigned");

	for (permissionid in fields) {
	
		String permissionidvalue = context.getRequestParameter(permissionid+".value");
		if(permissionidvalue == null && permissionassigned.containsKey(permissionid))
		{
			Data data = permissionassigned.get(permissionid);
			permissionsSearcher.delete(data, null);
		}
		else if(permissionidvalue != null && permissionidvalue.asBoolean() && !permissionassigned.containsKey(permissionid))
		{
			Data data = permissionsSearcher.createNewData();
			data.setValue("moduleid", moduleid);
			data.setValue("settingsgroup", groupid);
			data.setValue("permissionsentity", permissionid);
			data.setValue("enabled", true);
			permissionsSearcher.saveData(data);
			log.info("Permission saved " + permissionid);
		}
	}
	mediaarchive.getSearcherManager().getCacheManager().clear("permissions" + mediaarchive.getCatalogId());
	
    
}


init();

