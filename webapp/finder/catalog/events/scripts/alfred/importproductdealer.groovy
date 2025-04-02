package librarycollection;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.importer.CsvImporter
import org.entermediadb.asset.util.CSVReader
import org.entermediadb.asset.util.ImportFile
import org.entermediadb.asset.util.Row
import org.entermediadb.modules.publishing.PubLookUp;
import org.entermediadb.modules.update.Downloader
import org.mozilla.javascript.ImporterTopLevel
import org.openedit.Data
import org.openedit.OpenEditException
import org.openedit.WebPageRequest
import org.openedit.data.Searcher
import org.openedit.page.Page

public void init(){
	System.out.println("import products");
	WebPageRequest req = context;

	MediaArchive archive = req.getPageValue("mediaarchive");
	Searcher publicationsearcher = archive.getSearcher("publication");
	Searcher pubpartsearcher = archive.getSearcher("publicationpart");
	Searcher pubscoresearcher = archive.getSearcher("publicationscore");
	Searcher relatedsearcher = archive.getSearcher("publicationrelated");
	

	List scorerows = new ArrayList();
	List partrows = new ArrayList();
	List parentrows = new ArrayList();
	List relatedrecordsrows = new ArrayList();
	//String csvpath = "/${catalogid}/imports/ALF2.txt";
	
	String csvpath = "/${catalogid}/imports/dealer/MR_Upload_Dealer_Full.txt";
	Page dbpage = archive.getPageManager().getPage(csvpath);
	Reader reader = dbpage.getReader();
	
	//Downloader dl = new Downloader();
	//ftp://pics1.alfred.com/CatData/DailyAll/ALF_ALL_ALL.txt
	//String dlname = upload.getContentItem().getAbsolutePath();
	//dl.ftpDownload("pics1.alfred.com", "/CatData/DailyAll", "ALF_ALL_ALL.txt", dlname, "", "");

	CsvImporter importer = new CsvImporter() {
		public void importData() throws Exception {
			
			try{
				Integer li = 1;
				Integer foundcount = 0;
				Integer imagefoundcount = 0;
				
				int rowNum = 0;
				
				ImportFile file = new ImportFile();
				file.setParser(new CSVReader(reader, (char)',', (char)'"'));
				file.read(reader);
				file.getHeader().replaceLabel("Pages", "Pub Pages");
				file.getHeader().replaceLabel("Enabled", "Pub Enabled");
				
				Row trow = null;
				
				Boolean eof = false;
				while ( !eof)
				{
					rowNum++;
					trow = file.getNextRow();
					if (trow == null ) {
						//skyp empty line once
						trow = file.getNextRow();
						if (trow == null ) {
							eof = true;
							break;
						}
					}
					
					String SKU =  trow.get("SKU"); //ID
					
					if (SKU == null)
					{
						continue;
					}
					
					String ref_SKU = trow.get("Ref_SKU");
					
					
					
					PubLookUp publookup = archive.getBean("pubLookUp");
					String foundcatsourcepath =  publookup.lookUpSourcepathbyPubId(ref_SKU);
					
					if (foundcatsourcepath != null)
					{
						foundcount++;//found
					}
					else {
						continue; //Skip record since is not matching standard Pub Lookup with ref_SKU
					}
					
					Data datarow = null;		

					String recType = trow.get("ens_RecType");
		
					if (recType.equals("Score") || SKU.endsWith("S"))
					{
						setSearcher(pubscoresearcher);
						datarow = pubscoresearcher.searchById(SKU);
						if(datarow == null) {
							datarow = pubscoresearcher.createNewData();
							datarow.setId(SKU);
						}
						scorerows.add(datarow);
					}
					else if (recType.equals("Part") || recType.equals("World Part"))
					{
						setSearcher(pubpartsearcher);
						datarow = pubpartsearcher.searchById(SKU);
						if(datarow == null) {
							datarow = pubpartsearcher.createNewData();
							datarow.setId(SKU);
						}
						partrows.add(datarow);
					}
					else 
					{
						/*
						if (recType != null && !recType.equals("Parent") && !recType.equals("") )
						{
							getLog().info("Unknown recType: " +recType );
							continue;
						}
						*/
						
						setSearcher(publicationsearcher);
						datarow = publicationsearcher.searchById(SKU);
						if(datarow == null) {
							datarow = publicationsearcher.createNewData();
							datarow.setId(SKU);
						}
						String fullpath = "/WEB-INF/data/" + mediaArchive.getCatalogId() + "/originals/"+ foundcatsourcepath;
						if (mediaArchive.getPageManager().getRepository().doesExist(fullpath) )
							{
								datarow.setValue("foundproductcat", true);
							}
						//mediaArchive.getCategorySearcher().loadCategoryByPath(foundcatsourcepath);
						parentrows.add(datarow);
					}
										
					datarow.setValue("uploadsourcepath", foundcatsourcepath);
					
					//Clean Old Stuff - Dev
					datarow.setValue("rootcategory",  null);
					datarow.setValue("primaryimage",  null);
					

					
					addProperties(trow, datarow);
		
					String datarowname =  trow.get("Title");
					if (datarowname == null) {
						datarowname = SKU;
					}
					datarow.setName(datarowname);
					
					
					String groupID = trow.get("ens_GroupID");
					if (groupID == null)
					{
						groupID = ref_SKU;
					}
					if (groupID == null)
					{
						groupID = SKU;
					}
					datarow.setValue("ens_groupid", groupID);
					
					
					String moduleid = getSearcher().getSearchType();
					Data foundrelatedrecord = relatedsearcher.query().exact("ens_groupid", groupID).exact(moduleid, datarow.getId()).searchOne();
					if (foundrelatedrecord == null)
					{
						foundrelatedrecord = relatedsearcher.createNewData();
						foundrelatedrecord.setValue("ens_groupid", groupID);
						foundrelatedrecord.setValue(moduleid, datarow.getId());
						relatedrecordsrows.add(foundrelatedrecord);
					}
					

					
					if(scorerows.size() > 3000){
						pubscoresearcher.saveAllData(scorerows, null);
						getLog().info("Saving "+scorerows.size()+" Score Publications. ");
						scorerows.clear();
					}
					if(partrows.size() > 3000){
						pubpartsearcher.saveAllData(partrows, null);
						getLog().info("Saving "+partrows.size()+" Part Publications. ");
						partrows.clear();
					}
					if(parentrows.size() > 3000){
						publicationsearcher.saveAllData(parentrows, null);
						getLog().info("Saving "+parentrows.size()+" Parent Publications. ");
						parentrows.clear();
					}
					if (relatedrecordsrows.size() > 3000) {
						relatedsearcher.saveAllData(relatedrecordsrows, null);
						getLog().info("Saving "+relatedrecordsrows.size()+" Related Groups. ");
						relatedrecordsrows.clear();
					}
					
					
					li++;
				};
			
				//getLog().info("Found: "+ foundcount + " on: " + li-1 + " lines");
				if(scorerows.size() > 0){
						pubscoresearcher.saveAllData(scorerows, null);
						getLog().info("Saving "+scorerows.size()+" Score Publications. ")
					}
					if(partrows.size() > 0){
						pubpartsearcher.saveAllData(partrows, null);
						getLog().info("Saving "+partrows.size()+" Part Publications. ")
						
					}
					if(parentrows.size() > 0){
						publicationsearcher.saveAllData(parentrows, null);
						getLog().info("Saving "+parentrows.size()+" Parent Publications. ")
						
					}
					if (relatedrecordsrows.size() > 0) {
						relatedsearcher.saveAllData(relatedrecordsrows, null);
						getLog().info("Saving "+relatedrecordsrows.size()+" Related Groups. ");
					}
			} catch (Exception e){
				throw new OpenEditException(e);
			}
		}
		
	};
	
	importer.setLog(log);
	importer.setContext(context);
	importer.setModuleManager(archive.getModuleManager());
	importer.addDbLookUp("arrangement");
	importer.addDbLookUp("genre");
	importer.addDbLookUp("territory");
	importer.importData();
	
	
	
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

