const app = require('../../../index');

const PORT = env('PORT', 3000);

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});