namespace Goalz.Core.Interfaces
{
    public interface IJwtService
    {
        string Generate(string username, string role);
        string Generate(string username, string role, string name);
    }
}
