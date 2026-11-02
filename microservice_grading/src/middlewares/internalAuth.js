export async function internalAuth(req, res, next){
    const saved_token = process.env.INTERNAL_API_TOKEN;
    const token = req.headers['x-internal-token'];
    if (!token || token !== saved_token) {
        return res.status(403).json({ error: 'Forbidden: Invalid internal token' });
    }
    next();
}
