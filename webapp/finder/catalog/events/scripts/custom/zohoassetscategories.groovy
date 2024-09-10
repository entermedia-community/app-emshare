package asset


import java.util.regex.*
import java.nio.charsets.*

import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.Category
import org.openedit.Data
import org.openedit.hittracker.HitTracker






public init() {

	MediaArchive archive = context.getPageValue("mediaarchive");

	//Zoho category, make it custom like zohorootpath
	
	/*
	 * Zoho/Stryker, Brian 2-2831-00/
	 * -Field Photos/
	 * -Approved Addendums/
	 * -Original Contract Documents/ 
	 * 
	 * */

	HitTracker assets = archive.getAssetSearcher().query().match("category", "AZG5-vz-LDoKP-EzSdfM").sort("uploadeddate").search(context);
	for(Data hit in assets) {
		Asset asset = archive.getAssetSearcher().loadData(hit);
		Collection categories = asset.getCategories();
		if(categories != null && categories.size() == 1) {
			Category category = categories.iterator().next();
			Category zohoParentCategory = archive.getCategorySearcher().getCategory(category.getParentId());
			String zohoCategoryName = zohoParentCategory.getName();
			//2-2831-00
			Pattern pattern = Pattern.compile("(\\d{1}-\\d{4}-\\d{2})");
			Matcher m = pattern.matcher(zohoCategoryName);
			if (m.find())
			{
				String projectId = m.group(0);
				//Search Collections with projectID
				//log.info("Searching project id: " + projectId);
				Data found = archive.query("librarycollection").startsWith("jobnumber",projectId).searchOne();  //mattches not working
				String destinationCatId = null;
				if(found != null) {
					log.info("Found Project: " + found.getName());
					String rootCategoryId = found.get("rootcategory");
					Category rootCategory = archive.getCategorySearcher().getCategory(rootCategoryId);
					//Search "Documents" subcategory
					for (Iterator iterator = rootCategory.getChildren().iterator(); iterator.hasNext();)
					{
						Category child = (Category) iterator.next();
						if(child.getName().equals("Documents")) {
							destinationCatId = child.getId();
						}
					}
					if(destinationCatId == null) {
						//if not found create it
						log.info("Creating Documents folder for: " + found.getName());
						Category newCat = archive.getCategorySearcher().createNewData();
						newCat.setName("Documents");
						rootCategory.addChild(newCat);
						archive.getCategorySearcher().saveCategory(newCat);
						destinationCatId = newCat.getId();
						
						
					}
					if(destinationCatId != null) {
						String[] catids = new String [1];
						catids[0] = zohoParentCategory.getId();
						log.info("Syncing: " + zohoParentCategory + " to: " + found.getName());
						archive.getCategoryEditor().copyEverything(null, catids, destinationCatId);
					}
				}
			}
			
		}
	}
}


init();

