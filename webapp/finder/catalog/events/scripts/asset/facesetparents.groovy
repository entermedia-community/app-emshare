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
	List tosave = new ArrayList();
	
	Map<String,MultiValued> lookup = new HashSet(tosave.size());
	for(Data face in faces)
	{
		face.setValue("parentembeddingid",null);
		face.setValue("parentids",null);
		face.setValue("parentassetid",null);
		face.setValue("parentscore",null);
		lookup.put(face.getId(),face);
		tosave.add(tosave);
	}				
	FaceProfileManager manager = archive.getBean("faceProfileManager");
		
	for(MultiValued face in tosave)
	{
		Data parent = manager.findSimilar(face);
		if( parent != null)
		{
			face.setValue("parentembeddingid",parent.getId());
			face.setValue("parentassetid",parent.get("assetid"));
			
			Collection parentids = new ArrayList();
			Data startdata = face;
			while( startdata != null)
			{
				parentids.add(startdata.getId());
				String parentid = startdata.get("parentembeddingid");
				startdata = lookup.get(parentid);
			}
			face.setValue("parentids",parentids);

			tosave.add(tosave);
		}
	}
	archive.saveData("faceembedding",tosave);
		
}


init();
