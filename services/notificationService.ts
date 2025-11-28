
import { Notification, NotificationType, Employee } from '../types.ts';
import { find, insert, update } from './db.ts';
import { getEmployees } from './employeeService.ts';

const TABLE = 'notifications';

export const getNotifications = async (userId: number): Promise<Notification[]> => {
    const all = await find<Notification>(TABLE);
    return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const markAsRead = async (id: number): Promise<void> => {
    const all = await find<Notification>(TABLE);
    const notification = all.find(n => n.id === id);
    if (notification) {
        await update(TABLE, { ...notification, isRead: true });
    }
};

export const markAllAsRead = async (userId: number): Promise<void> => {
    const all = await find<Notification>(TABLE);
    const userNotifications = all.filter(n => n.userId === userId && !n.isRead);
    
    for (const notification of userNotifications) {
        await update(TABLE, { ...notification, isRead: true });
    }
};

/**
 * Creates a notification for a user, respecting their preferences.
 */
export const createNotification = async (
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
): Promise<void> => {
    const employees = await getEmployees();
    const user = employees.find(e => e.id === userId);

    if (!user) return;

    // Check preferences
    const prefs = user.notificationPreferences;
    if (type === 'leave_request' || type === 'leave_status') {
        if (!prefs.leaveUpdates) return;
    } else if (type === 'policy_update') {
        if (!prefs.policyUpdates) return;
    } else if (type === 'meeting') {
        if (!prefs.meetingInvites) return;
    } else if (type === 'general') {
        if (!prefs.generalAnnouncements) return;
    }
    // 'upcoming_leave' is usually critical or self-reminder, so we might force it or check leaveUpdates

    const newNotification: Omit<Notification, 'id'> = {
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
        link
    };

    await insert(TABLE, newNotification);
};

export const notifyAllEmployees = async (
    type: NotificationType,
    title: string,
    message: string,
    link?: string
): Promise<void> => {
    const employees = await getEmployees();
    for (const emp of employees) {
        await createNotification(emp.id, type, title, message, link);
    }
};

export const notifyAdmins = async (
    type: NotificationType,
    title: string,
    message: string,
    link?: string
): Promise<void> => {
    const employees = await getEmployees();
    // Assuming roleId 1 is Admin and 3 is HR Manager (who usually have manage permissions)
    const admins = employees.filter(e => e.roleId === 1 || e.roleId === 3);
    for (const admin of admins) {
        await createNotification(admin.id, type, title, message, link);
    }
};
