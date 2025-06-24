package asset

import org.entermediadb.asset.*
import org.entermediadb.asset.facedetect.FaceProfileManager
import org.openedit.Data
import org.openedit.MultiValued
import org.openedit.hittracker.HitTracker

public void init()
{
	MediaArchive archive = context.getPageValue("mediaarchive");//Search for all files looking for videos

	FaceProfileManager manager = archive.getBean("faceProfileManager");
	manager.fixAllParents();
		
}


init();
