package billing;

import org.entermedia.sitemanager.StripePaymentProcessor
import org.entermediadb.asset.MediaArchive
import org.entermediadb.email.WebEmail
import org.openedit.*
import org.openedit.data.Searcher
import org.openedit.users.User

public void init() {
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	Searcher transactionSearcher = mediaArchive .getSearcher("transaction");
	
	Data payment = context.getPageValue("payment");
	Data receipt = context.getPageValue("receipt");
	
	User user = context.getUser();
	
	String appid = mediaArchive.getCatalogSettingValue("events_billing_notify_invoice_appid");
	String emailbody = "Thank you for your donation.";
	String subject = "Donation Receipt"; //Better Default Donation Text & Subject
	
	//get emailbody from collection
	Data collection = mediaArchive.getData("librarycollection", context.getPageValue("collectionid"));
	if (collection.getValue("donationemailtemplate")) {
		emailbody = collection.getValue("donationemailtemplate");
	}
	if (collection.getValue("donationemailsubject")) {
		subject = collection.getValue("donationemailsubject");
	}
	
	Map objects = new HashMap();

	objects.put("receiptuser", user);
	objects.put("donor", user.getName());
	objects.put("amount", receipt.getValue("amount"));
	objects.put("mediaarchive", mediaArchive);
	objects.put("receipt", receipt);
	objects.put("payment", payment);

	WebEmail templateEmail = mediaArchive.createSystemEmailBody(user, emailbody);
	templateEmail.setSubject(subject);
	templateEmail.loadSettings(context);
	templateEmail.send(objects);
	
	log.info("Email sent to: "+user.getEmail());
}

private String getSiteRoot() {
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	String site = mediaArchive.getCatalogSettingValue("siteroot");
	if (!site) {
		site = mediaArchive.getCatalogSettingValue("cdn_prefix");
	}
	return site;
}

init();
