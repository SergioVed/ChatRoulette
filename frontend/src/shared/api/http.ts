export const API_BASE_URL = "http://localhost:9000";
export const WS_BASE_URL = "ws://localhost:4321";


export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    let response: Response;

    try {
        const headers = new Headers(options.headers)
        if (typeof options.body === 'string' && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }

        response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...options,
            headers,
        })
    } catch (error) {
        throw new Error('Unable to connect')
    }

    const data = await response.json()

    if (!response.ok) {
        const message = data?.message;

        const errorMessage = Array.isArray(message)
            ? message.join(', ')
            : typeof message === 'string'
                ? message
                : 'Request failed';

        throw new Error(
            response.status >= 500
                ? 'Server error. Please try again later.'
                : errorMessage
        );
    }

    return data
}