import org.entermediadb.asset.MediaArchive
import org.entermediadb.location.Position
import org.entermediadb.projects.*
import org.openedit.Data

import org.openedit.data.BaseSearcher
import org.openedit.data.Searcher

public void init()
{
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");//Search for all files looking for videos
	BaseSearcher collectionsearcher = mediaArchive.getSearcher("librarycollection");
	String  id = context.getRequestParameter("dataid");
	if( id == null )
	{
		id = data.getId();
	}
	LibraryCollection data = (LibraryCollection)collectionsearcher.searchById(id);

	if( data.getValue("geo_point") != null && data.getValue("library") != null)
	{
		return;
	}
	Searcher librarysearcher = mediaArchive.getSearcher("library");


	log.info("User is: " + user.getId() );

	
	Data library = librarysearcher.searchByField("owner", user.getId());
	if( library == null)
	{
		library = librarysearcher.createNewData();
		library.setValue("owner", user.getId());
		library.setName(user.getScreenName());
		librarysearcher.saveData(library);
	}
	data.setValue("library",library.getId());
	if( data.get("owner") == null )
	{
		data.setValue("owner",user.getId());
	}	
	
//	org.entermediadb.asset.Category root = mediaArchive.getProjectManager().createRootCategory(mediaArchive,data);
//	data.getRootCategoryId(root.getId();
	
	//Search Google and put point on map
	String location = "";
	if (data.get("street")) {
		location = data.get("street");
	}
	if (data.get("city")) {
		location += " " + data.get("city");
	}
	Data country = mediaArchive.getData("country", data.get("country"));
	if (country) {
		location += " " + country;
	} 
	
	if (location != "")
	{
		//location = location.replaceAll("null","");
		Position p = (Position)collectionsearcher.getGeoCoder().findFirstPosition(location);
		if( p != null)
		{
			data.setValue("geo_point",p);
			data.setValue("geo_point_formatedaddress",p.getFormatedAddress());
		}	
	}
	collectionsearcher.saveData(data);
	
}

init();