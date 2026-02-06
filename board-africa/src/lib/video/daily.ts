const DAILY_API_KEY = process.env.DAILY_API_KEY;

interface DailyRoomOptions {
    privacy?: 'public' | 'private';
    name?: string;
}

export class DailyService {
    static async createRoom(options: DailyRoomOptions = {}) {
        if (!DAILY_API_KEY) {
            console.warn("DAILY_API_KEY not set. Returning mock room for development.");
            return {
                url: 'https://board-africa-demo.daily.co/demo-room',
                name: 'demo-room',
                privacy: 'public'
            };
        }

        const data = {
            name: options.name,
            properties: {
                privacy: options.privacy || 'private',
                exp: Math.round(Date.now() / 1000) + 3600 * 4, // 4 hours expiry
                enable_chat: true,
                enable_screenshare: true,
                start_audio_off: true,
                start_video_off: true,
            }
        };

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to create Daily room: ${err}`);
        }

        const room = await response.json();
        return room;
    }

    static async createMeetingToken(roomName: string, userName: string, isOwner: boolean = false) {
        if (!DAILY_API_KEY) {
            return "mock-token";
        }

        const data = {
            properties: {
                room_name: roomName,
                user_name: userName,
                is_owner: isOwner,
                enable_recording_ui: isOwner,
                start_video_off: false,
                start_audio_off: false,
            }
        };

        const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to create Daily token: ${err}`);
        }

        const token = await response.json();
        return token.token;
    }
}
