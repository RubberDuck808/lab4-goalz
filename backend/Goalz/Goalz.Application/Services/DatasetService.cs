using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;
using Microsoft.AspNetCore.Http;
using NetTopologySuite.Geometries;
using System.Data;
using System.Text;

namespace Goalz.Core.Services
{
    public class DatasetService : IDatasetService
    {
        INatureElementRepository _natureElementRepository;
        public DatasetService(INatureElementRepository natureElementRepository)
        {
            _natureElementRepository = natureElementRepository;
        }

        public async Task<List<string>> ReadCSV(IFormFile file)
        {
            if (file == null)
            {
                throw new ArgumentNullException(nameof(file), "File cannot be null.");
            }

            DataTable dataTable = new DataTable();
            DatasetPreview datasetPreview = new DatasetPreview();

            List<string> col = new List<string>();

            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                bool isFirstRow = true;
                while (!reader.EndOfStream)
                {
                    var line = await reader.ReadLineAsync();
                    if (line == null) continue;

                    col.Add(line);
                }
            }

            return col;
        }

        public async Task StoreCSVFile(List<string> file)
        {
            bool isFirstRow = true;
            var dataTable = new DataTable();

            foreach (var line in file)
            {
                var cells = line.Split(';');

                if (isFirstRow)
                {
                    // Process header row
                    foreach (var cell in cells)
                    {
                        dataTable.Columns.Add(cell);
                    }

                    isFirstRow = false;
                }
                else
                { 
                    dataTable.Rows.Add(cells);
                }
            }

            ValidateFileStructure(dataTable);

            var elements = new List<Element>();
            foreach (DataRow row in dataTable.Rows)
            {
                var latitude = double.TryParse(row["Latitude"].ToString(), out var lat) ? lat : 0;
                var longitude = double.TryParse(row["Longitude"].ToString(), out var lng) ? lng : 0;
                var elementName = row["Type"].ToString() ?? string.Empty;
                var elementId = _natureElementRepository.GetNatureElementTypeByName(elementName)?.Id;

                if(elementId == null)
                {
                    throw new InvalidOperationException($"Element with name '{row["Type"]}' does not exist in the database. Please check the element name and try again.");
                }

                var element = new Element
                {
                    ElementName = row["Name"].ToString() ?? string.Empty,
                    ElementTypeId = Convert.ToInt32(elementId),
                    Geom = new Point(new Coordinate(latitude, longitude)),
                    IsGreen = bool.TryParse(row["IsGreen"].ToString(), out var isGreen) ? isGreen : false,
                    ImageUrl = row["ImageUrl"].ToString()
                };

                elements.Add(element);
            }

            _natureElementRepository.StoreElements(elements);
        }

        private void ValidateFileStructure(DataTable dataTable)
        {
            var requiredColumns = new List<string> { "Name", "Type", "Latitude", "Longitude", "IsGreen", "ImageUrl" };

            var missingColumns = requiredColumns.Where(col => !dataTable.Columns.Contains(col)).ToList();

            var columnNames = dataTable.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList();

            if (missingColumns.Any())
            {
                throw new Exception($"Missing required columns: {string.Join(", ", missingColumns)}");
            }

            if(columnNames.Count != requiredColumns.Count)
            {
                throw new Exception($"Unexpected number of columns. Expected: {requiredColumns.Count}, Found: {dataTable.Columns.Count}");
            }

            if (columnNames.Any(string.IsNullOrWhiteSpace))
            {
                throw new InvalidOperationException("One or more columns have empty names.");
            }

            var typeValues = dataTable.Rows
                .Cast<DataRow>()
                .Select(row => row["Type"].ToString())
                .Where(type => !string.IsNullOrWhiteSpace(type))
                .ToList();

            if (!ValidateElementTypes(typeValues))
            {
                throw new Exception("One or more element types are invalid. Please check the allowed types and try again.");
            }
        }

        private bool ValidateElementTypes(List<string> elementTypes)
        {
            var types = _natureElementRepository.GetAllElementTypes().Select(et => et.Name).ToList();

            foreach (var type in elementTypes)
            {
                if (!types.Contains(type))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
