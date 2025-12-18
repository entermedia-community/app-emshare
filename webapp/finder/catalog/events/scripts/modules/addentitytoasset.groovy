package modules

import org.entermediadb.asset.MediaArchive
import org.entermediadb.workspace.WorkspaceManager
import org.openedit.data.PropertyDetail
import org.openedit.data.PropertyDetails
import org.openedit.hittracker.HitTracker

public void init(){
	MediaArchive archive = context.getPageValue("mediaarchive");
	WorkspaceManager manager= archive.getModuleManager().getBean(archive.getCatalogId(), "workspaceManager");
	String appid = context.findValue("applicationid");
	String  id = data.getId();
	String  name = data.getName();
	String isentity = data.getValue("isentity");
	if(isentity.asBoolean()) {
		PropertyDetails details = archive.getAssetSearcher().getPropertyDetails();
		PropertyDetail detail = details.getDetail(id);
		if(detail != null){
			//Field already exists, may be a exisisting not related field or it was created previously
			return;
		}
		if(detail == null){
			//legacy?
			detail = details.getDetail(id);
		}
		
		if (detail == null)
		{
			detail = archive.getAssetSearcher().getPropertyDetailsArchive().createDetail("asset",id, name);
			detail.setDataType("list");
			detail.setViewType("entity");
			archive.getAssetSearcher().getPropertyDetailsArchive().savePropertyDetail(detail, archive.getAssetSearcher().getSearchType(), context.getUser());
			archive.getAssetSearcher().putMappings();
		}
	}
	
	
	
	
}


init();

