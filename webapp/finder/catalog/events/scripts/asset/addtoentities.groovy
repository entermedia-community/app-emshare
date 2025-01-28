package asset;
import org.apache.commons.codec.binary.Base64
import org.entermediadb.asset.Asset
import org.entermediadb.asset.MediaArchive
import org.openedit.Data
import org.openedit.data.Searcher
import org.openedit.event.WebEvent
public init(){
    MediaArchive mediaArchive = (MediaArchive)context.getPageValue("mediaarchive");
    Collection hits = mediaarchive.query("asset").matches("productid","*").search();
   
	Collection tosave = new ArrayList();
    hits.each{
        Data hit = it;
        if(hit.productid){
			Data product = mediaarchive.getCachedData("entityproduct",hit.productid).
			Category cat = mediaarchive.getEntityManager().loadDefaultFolder(product,null);
			if( !product.containsCategory(cat) )
			{
				product.addCategory(cat);
	            tosave.add(product);
			}
        }
        
    }   
    
}
//init();