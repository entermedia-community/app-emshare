package librarycollection;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.util.CSVReader
import org.entermediadb.modules.publishing.PubLookUp;
import org.entermediadb.modules.update.Downloader
import org.openedit.Data
import org.openedit.OpenEditException
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.page.Page

public void init(){
	System.out.println("import products");
	WebPageRequest req = context;

	MediaArchive archive = req.getPageValue("mediaarchive");
	Searcher searcher = archive.getSearcher("entitypublication");

	List rows = new ArrayList();
	//String csvpath = "/${catalogid}/imports/ALF2.txt";
	
	String csvpath = "/${catalogid}/imports/publications/CatData/DailyAll/ALF_ALL_ALL_PipeDelimited.txt";
	

	
	/*
	 *  -Numeric Items goes to numeric folders 000-xxx (so 24 "0024" will be at 00000-09999/000-0999/24, 4229 is 00000-09999/4000-4999/4229)
		-Alpha numeric Items goes to Warner-X (so H1 will be at Warner-H/H1)
		
		00-43122S  --- Ends on S or Z just match the numeric part. (It may exisist same ID in Warner folders)
		80000 attach a z

	 * */

	Page upload = archive.getPageManager().getPage(csvpath);
	Downloader dl = new Downloader();
	//ftp://pics1.alfred.com/CatData/DailyAll/ALF_ALL_ALL.txt
	String dlname = upload.getContentItem().getAbsolutePath();
	//dl.ftpDownload("pics1.alfred.com", "/CatData/DailyAll", "ALF_ALL_ALL.txt", dlname, "", "");
	
	Reader reader = upload.getReader();
	try{
		Integer li = 1;
		Integer foundcount = 0;
		Integer imagefoundcount = 0;
		//CSVReader read = new CSVReader(reader, (char)'\t', true);
		CSVReader read = new CSVReader(reader, (char)'|', true);
		String[] headers = read.readNext();
		String[] line;
		while ((line = read.readNext()) != null){
			if (line.length < 2) 
			{
				continue;
			}
			String pubitem =  getline(line, 2); //Pub-Item
			
			if (pubitem == null) 
			{
				continue;
			}
			
			Data product = searcher.searchById(pubitem);
			if(product == null) {
				product = searcher.createNewData();
				
				product.setId(pubitem);
				
				String productname =  getline(line, 9); //9 is Title
				if (productname == null) {
					productname = pubitem;
				}
				product.setName(productname);
				
				//collection.setValue("rootcategory",id);
			}
			//product.setValue("library", "products");
			
			product.setValue("projectdescription", getline(line, 36));
			
			//product.setValue("title", line[9]);
			product.setValue("subtitle",  getline(line, 10));
			product.setValue("genre",  getline(line, 16));
			product.setValue("level",  getline(line, 21));
			product.setValue("series",  getline(line, 20));
			product.setValue("keywords",  getline(line, 26));
			product.setValue("pubstatus",  getline(line, 3));
			
			product.setValue("rootcategory",  null);
			product.setValue("uploadsourcepath",  null);
			product.setValue("primaryimage",  null);
			
			if (product.get("rootcategory") == null) {
				PubLookUp publookup = archive.getBean("pubLookUp");
				
				Category foundcat =  publookup.lookUpbyPubId(pubitem);
				
				if (foundcat != null)
				{
					product.setValue("rootcategory", foundcat.getId());
					product.setValue("uploadsourcepath", foundcat.getCategoryPath());
					//log.info("Line:"+li+" pubitem: " + pubitem + " category: " + foundcat.getParentCategories());
					foundcount++;//found
				}
			}
			
			//Find Product Image
			if (product.get("primaryimage") == null) {  //Overwrite if exists?
				
				//Assets in category:   793939  -- Publication Files/Catpics/Large
				
				String thumbnailcat = "793939";
				 
				Data asset = archive.getAssetSearcher().query().match("category", thumbnailcat).startsWith("name", pubitem).searchOne();
				if (asset != null)
				{
					product.setValue("primaryimage", asset.getId());
					imagefoundcount++;
					//log.info("Asset found and assigned to: " + pubitem + " id: " + product.getId());
				}
			}
			
			
			rows.add(product);
			
			if(rows.size() > 1000){
				searcher.saveAllData(rows, null);
				log.info("Saving "+rows.size()+" Products. "+foundcount+" categories found.")
				rows.clear();
			}
			li++;
		}
		//log.info("Found: "+ foundcount + " on: " + li-1 + " lines");
		searcher.saveAllData(rows, null);
		log.info("Saving "+rows.size()+" Products. Total: " + li + " - " +foundcount+" categories found - " + imagefoundcount + " assets assigned.");
	} catch (Exception e){
		throw new OpenEditException(e);
	}
}

public String getline(String[] line, Integer linenumber)
{
	if(line.length > linenumber) 
	{
		return line[linenumber];
	}
	return null;
}

init();

