package asset;


import org.apache.commons.codec.binary.Base64
import org.dom4j.Element;
import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.entermediadb.asset.publish.publishers.vizonepublisher;
import org.openedit.Data
import org.openedit.data.Searcher

public init(){
	/*
	 * Predeleting Handled on deleting.groovy
	 * 
	log.info("Starting Pre-Deletion Event (Delete)");
	MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");
	Searcher targetsearcher = mediaArchive.getAssetSearcher();
	String assetids = context.getRequestParameter("assetids");
	Collection hits = mediaarchive.getAssetSearcher().query().orgroup("id",assetids).search();
	//http://vizmtlvamf.media.in.cbcsrc.ca/vms/#ItemPlace:2101409230000048521
	vizone = mediaArchive.getModuleManager().getBean(mediaArchive.getCatalogId(), "VizOnepublisher");
	String username = "EMDEV";
	String password  = "3nterMed1a";
	
	String enc = username + ":" + password;
	byte[] encodedBytes = Base64.encodeBase64(enc.getBytes());
	String authString = new String(encodedBytes);
	//public Element setMetadata(MediaArchive inArchive, String servername, Asset inAsset, String inAuthString) throws Exception{
		
	hits.each{
		Data hit = it;
		if(hit.vizid){
			Asset asset = targetsearcher.loadData(hit);
			asset.setValue("vizoneretention", "remove");
			targetsearcher.saveData(asset);
			vizone.setMetadata(mediaArchive, "http://vme.mtl.cbc.ca/", asset, authString );
			
		}
		
	}
	
	*/
	
}

init();