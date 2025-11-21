import { AttendanceRecord } from '../types.ts';
import { find, insert, update, remove } from './db.ts';
import { getEmployees } from './employeeService.ts';

const haversineDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371e3; // Earth's radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
};

export const getAttendanceRecords = (): Promise<AttendanceRecord[]> => find('attendance_records');

export const getEmployeeStatus = async (employeeId: number): Promise<{ status: 'in' | 'out', record: AttendanceRecord | null }> => {
    const allRecords = await find<AttendanceRecord>('attendance_records');
    const employeeRecords = allRecords
        .filter(r => r.employeeId === employeeId)
        .sort((a, b) => new Date(b.punchInTime).getTime() - new Date(a.punchInTime).getTime());
    
    const lastRecord = employeeRecords[0] || null;

    if (lastRecord && !lastRecord.punchOutTime) {
        return { status: 'in', record: lastRecord };
    }
    return { status: 'out', record: null };
};

export const punchIn = async (employeeId: number): Promise<AttendanceRecord> => {
    const employees = await getEmployees();
    const employee = employees.find(e => e.id === employeeId);

    if (employee && employee.workLocation && employee.workLocation.radius > 0) {
        try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
            
            const distance = haversineDistance(
                latitude,
                longitude,
                employee.workLocation.latitude,
                employee.workLocation.longitude
            );

            if (distance > employee.workLocation.radius) {
                throw new Error(`You are ~${Math.round(distance)} meters away from your work location. Please move within the ${employee.workLocation.radius}m radius to punch in.`);
            }
        } catch (error: any) {
            if (error.code === 1) { throw new Error("Location permission is required to punch in. Please enable it in your browser settings."); }
            if (error.code === 2 || error.code === 3) { throw new Error("Could not determine your location. Please check your device's location services and try again."); }
            throw error; // Rethrow custom messages
        }
    }
    
    const newRecord: Omit<AttendanceRecord, 'id'> = {
        employeeId,
        punchInTime: new Date().toISOString(),
        punchOutTime: null,
        date: new Date().toISOString().split('T')[0],
    };

    return insert('attendance_records', newRecord);
};

export const punchOut = async (employeeId: number): Promise<AttendanceRecord> => {
    const { record: recordToUpdate } = await getEmployeeStatus(employeeId);

    if(!recordToUpdate) {
        throw new Error("No active punch-in record found to punch out.");
    }

    const updatedRecord = { ...recordToUpdate, punchOutTime: new Date().toISOString() };
    return update('attendance_records', updatedRecord);
};

export const undoPunchIn = async (employeeId: number): Promise<void> => {
    const { record: recordToUndo } = await getEmployeeStatus(employeeId);
    
    if (recordToUndo && recordToUndo.id) {
        await remove('attendance_records', recordToUndo.id);
    }
};
