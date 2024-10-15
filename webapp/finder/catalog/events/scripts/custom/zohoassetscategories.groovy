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
	
	String zohoRootCategoryId = "zoho";
	
	Category zohoRootCategory = archive.getCategory(zohoRootCategoryId)
	for (Iterator iterator = zohoRootCategory.getChildren().iterator(); iterator.hasNext();)
		{
			Category zohoParentCategory = (Category) iterator.next();
			//2-2831-00
			Pattern pattern = Pattern.compile("(\\d{1}-\\d{4}-\\d{2})");
			Matcher m = pattern.matcher(zohoParentCategory.getName());
			if (m.find())
			{
				String projectId = m.group(0);
				//Search Collections with projectID
				Data found = archive.query("librarycollection").startsWith("jobnumber",projectId).searchOne();  //mattches not working
				
				if(found != null) {
					log.info("Found Project: " + found.getName());
					
					String projectCategoryId = found.get("rootcategory");
					Category projectCategory = archive.getCategorySearcher().getCategory(projectCategoryId);
					
					HitTracker assets = archive.getAssetSearcher().query().match("category", zohoParentCategory.getId()).search(context);
					if(assets != null) {
						Category projectDocumentsFolder = getDocumentsCategory(archive, projectCategory);
						if (projectDocumentsFolder == null) {
							log.info("Error, could not create Documents folder in Project.")
							continue;
						}
					
						Category zohoPhotoFolder = null;
						for (Iterator iterator2 = zohoParentCategory.getChildren().iterator(); iterator2.hasNext();)
						{
							Category zohoChild = (Category) iterator2.next();
							if(zohoChild.getName().equals("Field Photos")) {
								zohoPhotoFolder = zohoChild;
							}
							else {
								Category documentsChild = projectDocumentsFolder.getChildByName(zohoChild.getName());
								if (documentsChild == null) {
									documentsChild = (Category) archive.getCategorySearcher().createNewData();
									documentsChild.setName(zohoChild.getName());
									projectDocumentsFolder.addChild(documentsChild);
									archive.getCategorySearcher().saveCategory(documentsChild);
								}
								archive.getCategoryEditor().copyEverything(null, zohoChild, documentsChild);
								log.info("Syncing: " + zohoChild);
							}
						}
						
						if(zohoPhotoFolder != null) {
							//Search "Photos/01_During" subcategory
							Category projectPhotos = projectCategory.getChildByName("Photos");
							if(projectPhotos == null) {
								//if not found create it
								projectPhotos = archive.getCategorySearcher().createNewData();
								projectPhotos.setName("Photos");
								projectCategory.addChild(projectPhotos);
								archive.getCategorySearcher().saveCategory(projectPhotos);
								log.info("Photos folder Created: " + projectPhotos.getCategoryPath());
								
							}
							Category projectPhotosDuring = projectPhotos.getChildByName("01_During");
							if(projectPhotosDuring == null) {
								//if not found create it
								projectPhotosDuring = archive.getCategorySearcher().createNewData();
								projectPhotosDuring.setName("01_During");
								projectPhotos.addChild(projectPhotosDuring);
								archive.getCategorySearcher().saveCategory(projectPhotosDuring);
								log.info("Created 01_During folder: " + projectPhotosDuring.getCategoryPath());
								
							}
							if(projectPhotosDuring != null) {
								log.info("Syncing: " + zohoPhotoFolder + " to: " + projectPhotosDuring.getCategoryPath());
								archive.getCategoryEditor().copyEverything(null, zohoPhotoFolder, projectPhotosDuring);
							}

						}
							
					}
					
				}
			}
			
		}
		
}



public Category getDocumentsCategory (MediaArchive archive, Category projectCategory) {
	//find Documents and move it to Project's root
	Category projectDocumentsFolder = null;
	for (Iterator iterator = projectCategory.getChildren().iterator(); iterator.hasNext();)
		{
			Category child = (Category) iterator.next();
			if(child.getName().equals("Documents")) {
				projectDocumentsFolder = child;
			}
		}
	if(projectDocumentsFolder == null) {
		//if not found create it
		log.info("Creating Documents folder");
		Category newCat = archive.getCategorySearcher().createNewData();
		newCat.setName("Documents");
		projectCategory.addChild(newCat);
		archive.getCategorySearcher().saveCategory(newCat);
		projectDocumentsFolder = newCat;
		
		
	}
	return projectDocumentsFolder;
} 

init();

