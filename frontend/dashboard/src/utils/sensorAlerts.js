export function getSensorAlertState(sensor) {
  if (sensor.soilMoisture != null && sensor.soilMoisture < 25)
    return { message: 'Soil moisture is low — check irrigation' };
  if (sensor.soilMoisture != null && sensor.soilMoisture >= 80)
    return { message: 'Soil moisture is high — risk of saturation' };
  return null;
}
