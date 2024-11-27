require('dotenv').config();
const app = require('./serve');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
 console.log(`Server running on port http://localhost:${PORT}`);
});