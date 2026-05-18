using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Domain.Entities;

namespace Goalz.Core.Services;

public class PopUpService : IPopUpService
{
    private readonly IPopUpRepository _repository;
    private readonly ISensorRepository _sensorRepository;

    public PopUpService(IPopUpRepository repository, ISensorRepository sensorRepository)
    {
        _repository = repository;
        _sensorRepository = sensorRepository;
    }

    public async Task<PopUpDto?> GetBySensorIdAsync(long sensorId)
    {
        var popUp = await _repository.GetBySensorIdAsync(sensorId);
        if (popUp is null) return null;
        return new PopUpDto(popUp.Id, popUp.InfoText);
    }

    public async Task<(bool Success, string? Error)> CreateAsync(long sensorId, CreatePopUpRequest request)
    {
        var sensor = await _sensorRepository.GetByIdAsync(sensorId);
        if (sensor is null) return (false, "sensor_not_found");
        if (sensor.PopUpId is not null) return (false, "already_exists");

        var popUp = new PopUp { InfoText = request.InfoText };
        await _repository.CreateAsync(popUp);

        sensor.PopUpId = popUp.Id;
        await _sensorRepository.UpdateAsync(sensor);

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> UpdateAsync(long sensorId, UpdatePopUpRequest request)
    {
        var popUp = await _repository.GetBySensorIdAsync(sensorId);
        if (popUp is null) return (false, "not_found");

        popUp.InfoText = request.InfoText;
        await _repository.UpdateAsync(popUp);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(long sensorId)
    {
        var sensor = await _sensorRepository.GetByIdAsync(sensorId);
        if (sensor is null) return (false, "sensor_not_found");
        if (sensor.PopUpId is null) return (false, "not_found");

        var deleted = await _repository.DeleteAsync(sensor.PopUpId.Value);
        if (!deleted) return (false, "not_found");
        return (true, null);
    }
}
