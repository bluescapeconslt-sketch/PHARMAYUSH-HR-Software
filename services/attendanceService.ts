import { AttendanceRecord } from '../types.ts';
import { DEFAULT_ATTENDANCE_RECORDS } from './mockData.ts';
import { getEmployees } from './employeeService.ts';

const ATTENDANCE_KEY = 'pharmayush_hr_attendance';

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

const getFromStorage = (): AttendanceRecord[] => {
    try {
        const data = localStorage.getItem(ATTENDANCE_KEY);
        if (!data) {
            localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(DEFAULT_ATTENDANCE_RECORDS));
            return DEFAULT_ATTENDANCE_RECORDS;
        }
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
        return DEFAULT_ATTENDANCE_RECORDS;
    }
};

const saveToStorage = (records: AttendanceRecord[]): void => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
    return Promise.resolve(getFromStorage());
};

export const getEmployeeStatus = async (employeeId: number): Promise<{ status: 'in' | 'out', record: AttendanceRecord | null }> => {
    const records = getFromStorage();
    const lastRecord = records
        .filter(r => r.employeeId === employeeId)
        .sort((a, b) => new Date(b.punchInTime).getTime() - new Date(a.punchInTime).getTime())[0];

    if (lastRecord && !lastRecord.punchOutTime) {
        return Promise.resolve({ status: 'in', record: lastRecord });
    }
    return Promise.resolve({ status: 'out', record: null });
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
    
    const records = getFromStorage();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
    const newRecord: AttendanceRecord = {
        id: newId,
        employeeId,
        punchInTime: new Date().toISOString(),
        punchOutTime: null,
        date: new Date().toISOString().split('T')[0],
    };

    saveToStorage([...records, newRecord]);
    return Promise.resolve(newRecord);
};

export const punchOut = async (employeeId: number): Promise<AttendanceRecord> => {
    let records = getFromStorage();
    let updatedRecord: AttendanceRecord | undefined;
    
    records = records.map(r => {
        if(r.employeeId === employeeId && !r.punchOutTime) {
            updatedRecord = { ...r, punchOutTime: new Date().toISOString() };
            return updatedRecord;
        }
        return r;
    });

    if(!updatedRecord) {
        return Promise.reject(new Error("No active punch-in record found to punch out."));
    }

    saveToStorage(records);
    return Promise.resolve(updatedRecord);
};

export const undoPunchIn = async (employeeId: number): Promise<void> => {
    let records = getFromStorage();
    const recordToUndo = records
        .filter(r => r.employeeId === employeeId && !r.punchOutTime)
        .sort((a,b) => new Date(b.punchInTime).getTime() - new Date(a.punchInTime).getTime())[0];
    
    if (recordToUndo) {
        records = records.filter(r => r.id !== recordToUndo.id);
        saveToStorage(records);
    }
    return Promise.resolve();
};
