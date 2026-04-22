namespace Goalz.Core.DTOs
{
    public class JoinPartyRequest
    {
        public int Code {get; set;}
        //Because there is no input field for the username, it needs to be retrieved from the JWT Token later in the Controller!

    } 
}