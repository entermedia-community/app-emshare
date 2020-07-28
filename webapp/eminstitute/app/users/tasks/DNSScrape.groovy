@Grab('net.sourceforge.htmlunit:htmlunit:2.42.0')
import com.gargoylesoftware.htmlunit.WebClient
import com.gargoylesoftware.htmlunit.*
import com.gargoylesoftware.htmlunit.html.*


String searchQuery = "DNS Scrape" ;

//might need to enable Java Script
try {
 /* String searchUrl = "https://dnschecker.org/#A/global.unitednations.entermediadb.net"
	+ URLEncoder.encode(searchQuery, "UTF-8");
  HtmlPage page = client.getPage(searchUrl);*/
  URL url = new URL("https://dnschecker.org/#A/global.unitednations.entermediadb.net");
  StringWebResponse response = new StringWebResponse("<html><head><title>Test</title></head><body></body></html>", url);
  WebClient client = new WebClient()
  HtmlPage page = HTMLParser.parseHtml(response, client.getCurrentWindow());
  System.out.println(page.getTitleText());
  
}catch(Exception e){
  e.printStackTrace();
}
