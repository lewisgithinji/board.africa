import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;

export class LiveKitService {
    static async createToken(roomName: string, participantName: string, identity: string) {
        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
            console.warn("LIVEKIT_API_KEY or SECRET not set. Returning mock token.");
            return 'mock-token';
        }

        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: identity,
            name: participantName,
        });

        at.addGrant({ roomJoin: true, room: roomName });

        return await at.toJwt();
    }
}
