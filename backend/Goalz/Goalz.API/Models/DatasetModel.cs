namespace Goalz.API.Models
{
    public class DatasetModel
    {
        public string ElementName { get; set; } = string.Empty;
        public string ElementType { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public bool IsGreen { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
