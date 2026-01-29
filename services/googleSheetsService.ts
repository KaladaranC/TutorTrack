import { Session } from '../types';

// TODO: User must provide this URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVKCSfYOC7DSloMm-sslEnuPii5UBSJIaBDWmNl9P5MtNW6F33BbX5dBmGtCX-vn8m5g/exec';

export const fetchSessions = async (): Promise<Session[]> => {
    if (GOOGLE_SCRIPT_URL.includes('AKfycbyVKCSfYOC7DSloMm-sslEnuPii5UBSJIaBDWmNl9P5MtNW6F33BbX5dBmGtCX-vn8m5g')) return [];
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
};

export const addSession = async (session: Session): Promise<Session[]> => {
    return sendRequest('create', session);
};

export const updateSession = async (session: Session): Promise<Session[]> => {
    return sendRequest('update', session);
};

export const removeSession = async (id: string): Promise<Session[]> => {
    return sendRequest('delete', { id } as any);
};

async function sendRequest(action: string, payload: any): Promise<Session[]> {
    if (GOOGLE_SCRIPT_URL.includes('AKfycbyVKCSfYOC7DSloMm-sslEnuPii5UBSJIaBDWmNl9P5MtNW6F33BbX5dBmGtCX-vn8m5g')) {
        alert("Please configure your Google Sheet URL in services/googleSheetsService.ts");
        return [];
    }

    // Google Apps Script requires text/plain for CORS text
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, payload })
    });

    return await response.json();
}
