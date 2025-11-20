
using System.Text.Json.Serialization;
using CashCaddy.API.Utilities;

namespace CashCaddy.API.Models;
public class Expense
    {
        public Guid Id { get; set; }

        [JsonConverter(typeof(DateOnlyJsonConverter))]
        public DateTime Date { get; set; }
        
        [JsonConverter(typeof(DecimalJsonConverter))]
        public decimal Amount { get; set; }
        
        public string? Description { get; set; }
        public string? Category { get; set; }
    }