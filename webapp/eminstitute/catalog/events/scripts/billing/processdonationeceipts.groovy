package billing;

import org.entermedia.sitemanager.StripePaymentProcessor
import org.entermediadb.asset.MediaArchive
import org.entermediadb.email.WebEmail
import org.openedit.*
import org.openedit.data.Searcher
import org.openedit.users.User

public void init() {
	MediaArchive mediaArchive = context.getPageValue("mediaarchive");
	Searcher transactionSearcher = mediaArchive.getSearcher("transaction");
	//Searcher receiptSearcher = mediaArchive .getSearcher("donationreceipt");
	
	sendDonationReceipt(mediaArchive, transactionSearcher);
}

private void sendDonationReceipt(MediaArchive mediaArchive, Searcher transactionSearcher) {
	Collection pendingNotification = transactionSearcher.query()
			.exact("receiptstatus","new").search();

	//log.info("Sending Notification for " + pendingNotification.size() + " Donations");
	sendReceipt(mediaArchive, transactionSearcher, pendingNotification, "notificationsent");
}

private void sendReceipt(MediaArchive mediaArchive, Searcher transactionSearcher, Collection receipts, String iteratorType) {
	for (Iterator receiptIterator = receipts.iterator(); receiptIterator.hasNext();) {
		Data receipt = transactionSearcher.loadData(receiptIterator.next());
		
		String receiptemail = receipt.getValue("paymentemail");
		
		if (receiptemail != null) {
			String emailbody = "";
			String subject = "";
			
			//get emailbody from collection
			Data collection = mediaArchive.getData("librarycollection", receipt.getValue("collectionid"));
			if(collection != null) {
				if (collection.getValue("donationemailtemplate")) {
					emailbody = (String) collection.getValue("donationemailtemplate");
				}
				if (collection.getValue("donationemailsubject")) {
					subject = (String) collection.getValue("donationemailsubject");
				}
			}
			//default emailbody+subject
			if (emailbody.equals("")) {
				emailbody = (String) mediaArchive.getCatalogSettingValue("donation_email_body");
			}
			if (emailbody.equals("")) {
				emailbody = "Thank you for your Donation.";
			}
			if (subject.equals("")) {
				subject =  "Donation Receipt";
			}
			
			Map objects = new HashMap();
			
			objects.put("mediaarchive", mediaArchive);
			objects.put("receipt", receipt);
			//objects.put("receiptuser", user);
			objects.put("donor", (String) receipt.getValue("name"));
			objects.put("amount", (String) receipt.getValue("totalprice"));
			if (collection != null) {
				objects.put("organization", collection.getName());
			}
		
			WebEmail templateEmail = mediaArchive.createSystemEmailBody(receiptemail);
			templateEmail.setSubject(subject);
			templateEmail.loadSettings(context);
			templateEmail.send(emailbody, objects);
			
			receipt.setValue("receiptstatus", "sent");
			transactionSearcher.saveData(receipt);
			
			log.info("Email sent to: " + receiptemail);
		}
	}
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
