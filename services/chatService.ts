
import { find, insert } from './db.ts';
import { TeamChatMessage } from '../types.ts';
import { getCurrentUser } from './authService.ts';

const TABLE = 'team_chat_messages';

export const getTeamMessages = async (): Promise<TeamChatMessage[]> => {
    const messages = await find<TeamChatMessage>(TABLE);
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendTeamMessage = async (message: string): Promise<TeamChatMessage> => {
    const user = getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    const newMessage: Omit<TeamChatMessage, 'id'> = {
        employeeId: user.id,
        employeeName: user.name,
        employeeAvatar: user.avatar,
        message,
        timestamp: new Date().toISOString()
    };

    return insert<TeamChatMessage>(TABLE, newMessage);
};
