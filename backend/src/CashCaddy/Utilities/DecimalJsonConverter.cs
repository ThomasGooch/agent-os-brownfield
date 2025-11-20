using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CashCaddy.API.Utilities;

public class DecimalJsonConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetDecimal();
        }
        
        if (reader.TokenType == JsonTokenType.String)
        {
            var stringValue = reader.GetString();
            if (string.IsNullOrEmpty(stringValue))
            {
                return 0m;
            }
            
            // Remove common formatting characters (commas, spaces)
            stringValue = stringValue.Replace(",", "").Replace(" ", "");
            
            // Parse using invariant culture to avoid locale issues
            if (decimal.TryParse(stringValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
            {
                return result;
            }
            
            throw new JsonException($"Unable to parse '{stringValue}' as decimal.");
        }
        
        throw new JsonException($"Unexpected token type {reader.TokenType} when parsing decimal.");
    }

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
    {
        // Always write as number without formatting
        writer.WriteNumberValue(value);
    }
}
