package entities;

import java.text.*
import java.util.*
import java.util.regex.*
import java.nio.charsets.*

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.repository.*
import org.openedit.hittracker.HitTracker
import org.apache.commons.io.IOUtils
import java.nio.charset.StandardCharsets


public void init() throws Exception
{
	MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");

    //Scan Modules for Scan Path. Make a new child as needed dependi
	
	HitTracker modules = mediaArchive.query("module").exact("autocreateentities","true").sort("ordering").search();
	log.info("Scanning: " + modules);
	for (Data module in modules)
	{
		String startingpath = module.get("autocreatestartingpath");
		int deeplevel = module.getInt("autocreatedeep");
		log.info("Scanning: " + module + " for path: " + startingpath);
		//scan folders till deep
		Category root = mediaArchive.createCategoryPath(startingpath);
		int count = root.getParentCategories().size();
		processChildren(mediaArchive, module, root,deeplevel, count);		
	}	
}
				/*
				 * 2023-08-25 Orientation_JKnight
				 * 2014-15 Alumni_Gameday
				 * Alpine Ski_180120
				 * 2017 Softball_NCAA Regional
				 * */



public Date findDate(String inName)
{
	/*
		Pattern[] all = new Pattern[] {
			Pattern.compile("(\\d{4}-\\d{2}-\\d{2})"), 
			Pattern.compile("^(\\d{4}-\\d{2})"),
			Pattern.compile("^(\\d{4})"),
			Pattern.compile("(\\d{6})")
		};
		String[] formats = {"yyyy-MM-dd","yyyy-MM","yyyy","yyMMdd"};	
	*/		

	MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");
	Collection rules = mediaArchive.getList("entitydateformatrules");

	for (Data rule in rules)
	{
		Pattern pattern = Pattern.compile(rule.pattern); 
		Matcher m = pattern.matcher(inName);
		if (m.find()) 
		{
		     Date date = new SimpleDateFormat(rule.dateformat).parse(m.group(1));
		     return date;
		}
	}
	return null;	
}

public void processChildren(MediaArchive mediaArchive, Data inmodule, Category parent, int startfromdeep, int currentdeep) throws Exception
{
	if(startfromdeep == currentdeep )
	{
		
		
		//Check each child
		for (Data category in parent.getChildren())
		{
			 String id = category.getValue(inmodule.getId());
			 boolean createrow = false;
			 if( id == null )
			 {
			    createrow = true;
			 }
			 else
			 {
			 	Data found = mediaArchive.getData(inmodule.getId(),id);
				if( found != null)
				{
					readInSideCart(mediaArchive,category,found);	
					mediaArchive.saveData(inmodule.getId(),found);		 	
				}
				else
				{
					createrow = true;
				}			 	
			 }			 
			 if( createrow )
			 {
				String categoryname = category.getName();
				if (categoryname == null) 
				{
					log.info("Empty Category: " + category.getId());
					continue;
				}
				
				Searcher entitysearcher = mediaArchive.getSearcher(inmodule.getId());
			 	Data newchild = entitysearcher.createNewData();
			 	newchild.setId(id);
				newchild.setName(categoryname);
				Date date = findDate(categoryname);
						
				if(date != null)
				{
					newchild.setValue("entity_date", date);
				}
			 	
			 	//TODO Check parent for any entites and pass those down
			 	
			 	HitTracker allentities = mediaArchive.query("module").sort("ordering").search();
			 	for (Data entity in allentities)
			 	{
			 		
			 		if ( entitysearcher.getDetail(entity.getId()) != null )  //if Activity has a field for Departments
			 		{
			 			//Search cateogry path for it
						String parententity = category.findValue(entity.getId());
						log.info(entity.getId() +" - " + parententity);
			 			newchild.setValue(entity.getId(), parententity);
			 		}
			 	}

				readInSideCart(mediaArchive,category,newchild);			 	
			 	newchild.setValue("uploadsourcepath",category.getCategoryPath());
			 	
			 	mediaArchive.saveData(inmodule.getId(),newchild);
			 	category.setValue(inmodule.getId(), newchild.getId());
			 	
			 	mediaArchive.saveData("category",category);
			 	log.info("Save new entity " + inmodule + " / " + newchild);
			 }
		}
	}
	else
	{
		//log.info("Process Children Folder: " + parent + " Actual: " + currentdeep + " Matches: " + startfromdeep);
	
		int nextdeep = currentdeep + 1;
		for (Data child in parent.getChildren())
		{
			processChildren(mediaArchive,inmodule, child, startfromdeep, nextdeep);
		}
	}
}

public readInSideCart(MediaArchive mediaArchive,Category category,Data newchild)
{
	
	if( newchild.getValue("longcaption") == null )
	{
			 	//Look for ingest files
			 	ContentItem item = mediaArchive.getContent("/WEB-INF/data/" + mediaArchive.getCatalogId() + "/originals/" + category.getCategoryPath() + "/_ingest.txt");
			 	//log.info("Looking for: " + item.getAbsolutePath() );
			 	if( item.exists() )
			 	{
			 		 String result = IOUtils.toString(item.getInputStream(), StandardCharsets.UTF_8);
			 		 log.info("Read in " + result);
				 	 newchild.setValue("longcaption",result);
			 	}
	}
}

try
{
	init();
}
catch(Exception ex)
{
	log.error("Could not process" , ex);	
}
