@Grapes([
	@Grab(group='org.jsoup', module='jsoup', version='1.6.2'),
	@Grab(group='net.sourceforge.htmlunit', module='htmlunit', version='2.8'),
	@Grab(group='org.seleniumhq.selenium', module='selenium-java', version='3.14.0')
]
)
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.BrowserVersion;
import org.jsoup.*
import org.jsoup.nodes.*
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements

public static void main(String[] args) throws Exception {

	//java.util.logging.Logger.getLogger("com.gargoylesoftware.htmlunit").setLevel(java.util.logging.Level.OFF);
	//java.util.logging.Logger.getLogger("org.apache.http").setLevel(java.util.logging.Level.OFF);
	
	client = new WebClient();
	//waiting for javascript to load and set other client props
	//client.waitForBackgroundJavaScriptStartingBefore(50000);
	client.waitForBackgroundJavaScript(50000);
	client.setJavaScriptTimeout(50000);
	client.setThrowExceptionOnScriptError(false);
	client.setJavaScriptEnabled(true);
	client.setCssEnabled(true);
	
	
	HtmlPage mypage = client.getPage('https://dnschecker.org/#A/global.unitednations.entermediadb.net');
	//System.out.println(mypage.asXml());
	
	//use Jsoup to parse page
	Document doc = Jsoup.parse(mypage.asXml());
	//retrieve only the 'results' table
	Element results = doc.getElementById("results");
	// get the names of the locations within
	Elements tableRowElements = results.select(":not(thead) tr");
	//print(tableRowElements);
	
	//correct version of parse loop
	for (int i = 0; i < tableRowElements.size(); i++) {
		Element row = tableRowElements.get(i);
		System.out.println("row");
		Elements rowItems = row.select("td");
		for (int j = 0; j < rowItems.size(); j++) {
			System.out.println(rowItems.get(j).text());
			//Do something
			/*if(j != rowItems.size() -1){
			 writer.append(',');
			 }*/
		}
	}
	/*for (Element name : names) {
	 String city = name.text();
	 System.out.println(city);
	 }*/



}