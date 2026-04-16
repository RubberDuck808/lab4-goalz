namespace Goalz.Core.DTOs
{
    public class DatasetPreview
    {
        public List<string> ColumnNames { get; set; } = new List<string>();
        public List<List<string>> values { get; set; } = new List<List<string>>();
    }
}
