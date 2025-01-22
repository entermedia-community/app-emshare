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
	Searcher searcher = archive.getSearcher("entityproduct");

	List rows = new ArrayList();
	String csvpath = "/${catalogid}/imports/ALF2.txt";


	Page upload = archive.getPageManager().getPage(csvpath);
	Downloader dl = new Downloader();
	//ftp://pics1.alfred.com/CatData/DailyAll/ALF_ALL_ALL.txt
	String dlname = upload.getContentItem().getAbsolutePath();
	//dl.ftpDownload("pics1.alfred.com", "/CatData/DailyAll", "ALF_ALL_ALL.txt", dlname, "", "");
	
	Reader reader = upload.getReader();
	try{
		Integer li = 1;
		Integer foundcount = 0;
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
			
			if (product.get("rootcategory") == null) {
				PubLookUp publookup = archive.getBean("pubLookUp");
				Category foundcat =  publookup.lookUpbyPubId(pubitem);
				if (foundcat != null)
				{
					product.setValue("rootcategory", foundcat.getId());
					//log.info("Line:"+li+" pubitem: " + pubitem + " category: " + foundcat.getParentCategories());
					foundcount++;//found
				}
			}
			
			//Find Product Image
			if (product.get("primaryimage") == null) {  //Overwrite if exists?
				Data asset = archive.getAssetSearcher().query().startsWith("name", pubitem).searchOne();
				if (asset != null)
				{
					product.setValue("primaryimage", asset.getId());
					log.info("Asset found and assigned to: " + pubitem + " id: " + product.getId());
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
		log.info("Saving "+rows.size()+" Products. "+foundcount+" categories found.");
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

