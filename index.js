//index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const scanRoutes = require('./routes/scanRoutes');
const securityScanRoutes = require('./routes/securityScanRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
app.use('/scans', scanRoutes);
app.use('/owasp', securityScanRoutes);

mongoose.connect('mongodb://localhost:27017/grid-api-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

app.get('/', (req, res) => {
    res.send('API Server is running');
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
