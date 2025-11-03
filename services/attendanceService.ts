import { AttendanceRecord } from '../types.ts';
import { getEmployees } from './employeeService.ts';

const STORAGE_KEY = 'pharmayush_hr_attendance';

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
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};


export const getAttendanceRecords = (): AttendanceRecord[] => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error("Failed to parse attendance records from localStorage", error);
        return [];
    }
};

const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getEmployeeStatus = (employeeId: number): { status: 'in' | 'out', record: AttendanceRecord | null } => {
    const records = getAttendanceRecords();
    const employeeRecords = records.filter(r => r.employeeId === employeeId);
    
    // Find the most recent record
    const latestRecord = employeeRecords.sort((a, b) => new Date(b.punchInTime).getTime() - new Date(a.punchInTime).getTime())[0];

    if (latestRecord && latestRecord.punchOutTime === null) {
        // The latest record has no punch-out time, so they are punched in.
        return { status: 'in', record: latestRecord };
    }

    // Otherwise, they are punched out.
    return { status: 'out', record: null };
};

export const punchIn = async (employeeId: number): Promise<AttendanceRecord> => {
    const employees = getEmployees();
    const employee = employees.find(e => e.id === employeeId);

    // If employee has a work location defined, check their current position
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
            if (error.code === 1) { // PERMISSION_DENIED
                 throw new Error("Location permission is required to punch in. Please enable it in your browser settings.");
            }
             if (error.code === 2) { // POSITION_UNAVAILABLE
                 throw new Error("Could not determine your location. Please check your device's location services.");
            }
            // Re-throw custom error or other geolocation errors
            throw error;
        }
    }

    const records = getAttendanceRecords();
    const now = new Date();
    
    const newRecord: AttendanceRecord = {
        id: Date.now(),
        employeeId: employeeId,
        punchInTime: now.toISOString(),
        punchOutTime: null,
        date: now.toISOString().split('T')[0],
    };

    const updatedRecords = [...records, newRecord];
    saveAttendanceRecords(updatedRecords);
    return newRecord;
};

export const punchOut = (employeeId: number): AttendanceRecord | null => {
    const records = getAttendanceRecords();
    const { record: currentRecord } = getEmployeeStatus(employeeId);

    if (currentRecord) {
        const now = new Date().toISOString();
        const updatedRecord = { ...currentRecord, punchOutTime: now };

        const updatedRecords = records.map(r => r.id === currentRecord.id ? updatedRecord : r);
        saveAttendanceRecords(updatedRecords);
        return updatedRecord;
    }

    console.error("Punch out attempted for an employee who is not punched in.");
    return null;
};
