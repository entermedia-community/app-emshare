package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceProfileManager
import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.hittracker.HitTracker

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	HitTracker faces = archive.query("faceembedding").all().sort("locationhUp").search();
	faces.enableBulkOperations();
	List<MultiValued> tosave = new ArrayList();
	
	Map<String,MultiValued> lookup = new HashMap();
	for(MultiValued face in faces)
	{
		face.setValue("parentembeddingid",null);
		face.setValue("parentids",null);
		face.setValue("parentassetid",null);
		face.setValue("parentdistance",null);
		if( face.getId() == null)
		{
			throw new RuntimeException("Should not be nulll");
		}
		lookup.put(face.getId(),face);
		tosave.add(face);
	}				
	FaceProfileManager manager = archive.getBean("faceProfileManager");
		
	for(MultiValued face in tosave)
	{
		Data parent = manager.findSimilar(face);
		if( parent != null)
		{
			face.setValue("parentembeddingid",parent.getId());
			face.setValue("parentassetid",parent.get("assetid"));
		}
	}
	
	for(MultiValued face in tosave)
	{
		Collection parentids = new ArrayList();
		Data startdata = face;
		while( startdata != null)
		{
			String currentid = startdata.getId();
			parentids.add(currentid);
			String parentid = startdata.get("parentembeddingid");
			if( parentid == null || parentids.contains(parentid) )
			{
				//log.info("Stop" + startdata.getId());
				break;
			}
			startdata = lookup.get(parentid);
//			if( startdata != null)
//			{
//				Collection setparents = startdata.getValues("parentids"); //Make sure no parent ever has a parent already included
//				if(setparents != null && setparents.contains(currentid) )
//				{
//					//Dont keep looking, circular loop
//					break;
//				}
//			}
		}
		face.setValue("parentids",parentids);
		log.info(face.get("assetid") + " Saved parents" + parentids);
	}

	
	archive.saveData("faceembedding",tosave);
		
}


init();
