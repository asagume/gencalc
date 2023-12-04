functions.http('api', async (req, res) => {
    const ALLOWD_METHODS = 'GET';   // comma
    const ALLOWED_ORIGINS = ['https://asagume.github.io', 'http://localhost:8080'];

    const origin = req.get('origin');
    if (origin || ALLOWED_ORIGINS.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    } else {
        res.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    }
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Method', ALLOWD_METHODS);
        res.set('Access-Control-Allow-Headers', 'User-Agent');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    const api = req.query['api'];
    if (!api) {
        res.status(400).send('');   // Bad request
        return;
    }
    try {
        const url = 'https://enka.network/api/' + req.query.api;
        const headers = {};
        const userAgent = req.get('user-agent');
        if (userAgent) {
            headers['User-Agent'] = userAgent;
        }
        const options = {
            method: req.method,
            headers: headers,
        };
        const exres = await fetch(url, options);
        res.status(exres.status).send(await exres.json());
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send(error);
    }
});