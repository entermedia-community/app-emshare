@Grapes(
    @Grab(group='net.sourceforge.htmlunit', module='htmlunit', version='2.8')
)

import com.gargoylesoftware.htmlunit.*
import com.gargoylesoftware.htmlunit.html.*


String searchQuery = "DNS Scrape" ;

//might need to enable Java Script
try {
 /* String searchUrl = "https://dnschecker.org/#A/global.unitednations.entermediadb.net"
	+ URLEncoder.encode(searchQuery, "UTF-8");
  HtmlPage page = client.getPage(searchUrl);*/
  URL url = new URL("https://dnschecker.org/#A/global.unitednations.entermediadb.net" + URLEncoder.encode(searchQuery, "UTF-8"));
  StringWebResponse response = new StringWebResponse("<html><head><title>Test</title></head><body></body></html>", url);
  WebClient client = new WebClient();
  client.getOptions().setJavaScriptEnabled(true);
  client.getOptions().setCssEnabled(true);
  HtmlPage page = client.getPage(url);
  
  System.out.println(page);
  
}catch(Exception e){
  e.printStackTrace();
}
