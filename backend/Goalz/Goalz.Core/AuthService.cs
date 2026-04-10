namespace Goalz.Core
{
    public class AuthService
    {
        public bool checkAuth(string email, string password) {
            string expectedemail = "johndoe@gmail.com";
            string expectedpass = "hello123";
            if (email == expectedemail)
            {
                if (password == expectedpass)
                {
                    return true;
                }
                return false;
            }
            return false;
           
        }
    }
}
