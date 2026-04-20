using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Data;
using System.IO;

namespace Goalz.Core.Services
{
    public class DatasetService : IDatasetService
    {
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

                    //if (isFirstRow)
                    //{
                    //    // Add columns to DataTable
                    //    foreach (var columnName in values)
                    //    {
                    //        dataTable.Columns.Add(columnName);
                    //        datasetPreview.ColumnNames.Add(columnName);
                    //    }
                    //    isFirstRow = false;
                    //}
                    //else
                    //{
                    //    // Add rows to DataTable
                    //    dataTable.Rows.Add(values);
                    //    datasetPreview.values.Add(values);
                    //}
                }
            }

            return col;
        }
    }
}
