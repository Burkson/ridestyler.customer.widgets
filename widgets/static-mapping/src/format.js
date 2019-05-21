export function formatMultipleVehicleDescriptions(vehicles) {
    let vehicleDescription = '';

    for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];

        if (i > 2) {
            vehicleDescription += ` and ${vehicles.length - i} more`
            break;
        }

        if (i > 0) {
            if (i < vehicles.length - 1)  vehicleDescription += ', ';
            else vehicleDescription += ' and ';
        }

        vehicleDescription += vehicle.FullDescription;
    }

    return vehicleDescription;
}