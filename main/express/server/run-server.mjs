import app from './connect.mjs'

const PORT = env('PORT', 3000);

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});