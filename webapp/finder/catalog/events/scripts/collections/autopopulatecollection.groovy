package collections;

import org.apache.lucene.queryparser.flexible.core.builders.QueryBuilder
import org.entermediadb.asset.MediaArchive
import org.entermediadb.projects.ProjectManager
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.hittracker.HitTracker
import org.openedit.hittracker.SearchQuery


public void init(){

	MediaArchive archive = context.getPageValue("mediaarchive");
	
	String search = context.getRequestParameter("search");
	
	if(search == null) {
		search = context.getRequestParameter("entityid");
	}
	
	context.putPageValue("searchby", search);
	
	log.info(search);
	
	if(search == null) {
		return;
	}
	
		
	Searcher catsearcher = archive.getSearcher("category");
	ArrayList rootcats = new ArrayList(); 
	String name = search;

	String [] splits = name.split("-");
	String searchstring = splits[splits.length -1];
	//searchstring = searchstring.replaceFirst("^0+(?!\$)", "")

	//log.info("Searching for categories contains categorypath = " +  searchstring);
	
	String rootCategory = "4";
	
	HitTracker categories =  catsearcher.query().exact("parents", rootCategory).contains("categorypath", searchstring).sort("categorypathUp").search();
	log.info(categories);
	log.info("Found ${categories.size()} existing categories");
	categories.enableBulkOperations();
	
	if(categories.size() > 0){
		rootcats = findCommonRoots(categories);	
		context.putPageValue("foundcategories", rootcats);
	}

	Searcher assets = archive.getAssetSearcher();
	org.openedit.data.QueryBuilder query = assets.query().freeform("description", searchstring).exact("category", rootCategory).sort("sourcepath");
	rootcats.each{
		query.not("category", it);
	}
	
	
	log.info("Searching assets contains = " +  searchstring );
	
	HitTracker hits = query.search();
	
	log.info(hits);
	
	
	//log.info(hits.getSearchQuery().getTerms());
	
	context.putPageValue("assets", hits);
	
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

	String excludepath = context.getRequestParameter("excludepath");
	List finallist = new ArrayList();
	String lastroot = "_";
	
	sorted.each{
		Data hit = (Data)it;
		String catpath = hit.getValue("categorypath");
		
		if (excludepath != null && catpath.startsWith(excludepath))
		{
			return;
		}
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
	
	log.info("got  " + finallist);
	return finallist;
}

init();

