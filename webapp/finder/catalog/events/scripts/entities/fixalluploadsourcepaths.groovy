package entities;

import org.entermediadb.asset.Category
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.util.DateStorageUtil


public void init()
{
	MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");

    //Scan Modules for Scan Path. Make a new child as needed dependi
	mediaArchive.clearCaches();
	int count = 0;
	
	Date thisdate = new Date();
	thisdate = DateStorageUtil.getStorageUtil().parseFromStorage("1/1/2024");
	Collection hits = mediaArchive.query("eduactivity").before("entity_date", thisdate).search();
	//log.info( "Searching:  " + hits);
	Collection tosave = new ArrayList();
	for (Data hit in hits)
	{

		String sourcepath = hit.getValue("sourcepath");
		if( sourcepath != null && sourcepath.startsWith("Activities/0000-2023/"))
		{
			//log.info("skipping " + sourcepath);
			
		}
		else
        {
			sourcepath = null;
			
			String rootcategory = hit.getValue("rootcategory");
			if (rootcategory != null)
            {
                Category cat = mediaArchive.getCategory(rootcategory);
				if (cat != null) {
					String csourcepath = cat.getCategoryPath();
					if (csourcepath != null && csourcepath.startsWith("Activities/0000-2023/"))
					{
						//calculate
						sourcepath = csourcepath;
						log.info("Fixed sourcepath Category " + sourcepath + " " + hit);
					}
					else
					{
						log.info("Root Category is invalid on " + sourcepath + " " + hit);
					}
				}
            }
        }
		if( sourcepath == null)
        {
			String departmentid = hit.get("edudepartment");
			Data dept = mediaArchive.getCachedData("edudepartment",departmentid)
			if( dept != null)
			{
				sourcepath = "Activities/0000-2023/" + dept.getName() + "/" + hit.getName();
				log.info("Fixed sourcepath with department " + sourcepath + " " + hit);
			}
		}
		if( sourcepath != null)
		{
			//log.info("Root Category saved on " + sourcepath + " " + hit);
			hit.setValue("sourcepath", sourcepath);
			hit.setValue("archivesourcepath", sourcepath);
			tosave.add(hit);
			count++;
		}
		else
		{
			log.info("Soure is invalid on " + hit);
		}
	}
	mediaArchive.saveData("eduactivity",tosave);
	log.info( "Saved:  " + count);
	
	mediaArchive.clearCaches();
}

init();
