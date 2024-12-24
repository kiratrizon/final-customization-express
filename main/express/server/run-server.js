const app = require('../../../lara-express');

const PORT = env('PORT', 3000);

app.listen(PORT, async () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});