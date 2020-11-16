package collections;

import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.ProjectManager
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery




public void init(){

	MediaArchive archive = context.getPageValue("mediaarchive");
	Searcher collectionsearcher = archive.getSearcher("librarycollection");

	String collectionid = context.getRequestParameter("collectionid");
	HitTracker collections = null;
	if(collectionid == null){
		collections = collectionsearcher.getAllHits();
	} else{

		collections = collectionsearcher.fieldSearch("id", collectionid);
	}
	ProjectManager projects = archive.getProjectManager();
	collections.enableBulkOperations();
	Searcher catsearcher = archive.getSearcher("category");
	ArrayList rootcats = new ArrayList(); 
	collections.each{
		String name = it.name;

		String [] splits = name.split("-");
		String searchstring = splits[splits.length -1];
		//searchstring = searchstring.replaceFirst("^0+(?!\$)", "")

		String colid = it.id;
		Data collection = archive.getData("librarycollection", colid);
		//log.info("Searching for categories contains categorypath = " +  searchstring);
		HitTracker categories =  catsearcher.query().contains("categorypath", searchstring).sort("categorypathUp").search();
		//log.info("Found ${categories.size()} existing categories");
		
		
		
		categories.enableBulkOperations();
		if(categories.size() > 0){
			rootcats = findCommonRoots(categories);
			rootcats.remove(collection.get("rootcategory"));
			
			context.putPageValue("foundcategories", rootcats);
		}
	
		Searcher assets = archive.getAssetSearcher();
		SearchQuery query = assets.createSearchQuery();
		query.addSortBy("sourcepath");
		//query.addContains("description", searchstring);
		query.addContains("name", searchstring);  //Search Only Filename
		log.info("Searching assets contains = " +  searchstring + " for Collection: " + name);
		
		rootcats.each{
			query.addNot("category", it);
		}
		
		//log.info(query.toFriendly());
		
		
		HitTracker hits = assets.search(query);
		//log.info(hits.getSearchQuery().getTerms());
		
		context.putPageValue("assets", hits);
		
		
	}
	

	
	
	
}






public List findCommonRoots(HitTracker inCategories){
	
	MediaArchive archive = context.getPageValue("mediaarchive");

	Searcher catsearcher = archive.getSearcher("category");

	ArrayList sorted = new ArrayList(inCategories);
	Collections.sort(sorted, new Comparator()
	{
		public int compare(Object inA, Object inB)
		{
			Data dA = (Data)inA;
			Data dB = (Data)inB;
			
			String path = dA.get("categorypath");
			String path2 = dB.get("categorypath");
			return path.compareTo(path2);
		}
	}	
	);

	List finallist = new ArrayList();

	String lastroot = "_";
	sorted.each{
		Data hit = (Data)it;
		String catpath = hit.getValue("categorypath");
		
		if(catpath.contains("Collections")) {
			return;
		}
		if( !catpath.startsWith(lastroot))
		{
			finallist.add(hit.getId());
			lastroot = catpath;
		}
		else
		{
			//log.info("skip " + catpath);
		}

	}
	
	
	
	log.info("got  " + finallist.size());
	return finallist;
}

init();

