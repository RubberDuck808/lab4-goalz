namespace Goalz.Core.DTOs;

public record SensorDataResponse(long Id, long Light, long Humidity, double Temp, DateTime Timestamp);
