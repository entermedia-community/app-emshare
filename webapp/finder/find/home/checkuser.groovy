import org.openedit.OpenEditException
import org.openedit.users.User
import org.openedit.users.UserManager

public User checkUser()
{
	String userid = context.getRequestParameter("userid");
	if( userid == null)
	{
		return;
	}
	if( userid == "admin")
	{
		throw new OpenEditException("Can not login as admin");
	}
	UserManager um = userManager;
	
	User newuser = um.getUser(userid);
//	if( newuser != null && !newuser.isInGroup("autologin"))
//	{
//		throw new OpenEditException("Can only auto login users in the autologin group");
//	}
	if( newuser == null)
	{
		newuser = um.createGuestUser(userid,null,"autologin");
		newuser.setVirtual(false);
		um.saveUser(newuser);
	}
	um.logIntoApp(context,newuser);
}

checkUser();
