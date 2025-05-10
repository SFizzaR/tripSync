const app = require("./app");
const { spawn } = require('child_process');
const cron = require('node-cron');

const port = process.env.PORT || 5000;

const updateDataAndRetrain = () => {
    const fetchProcess = spawn('python', ['./recommender/fetch_data.py']);
    fetchProcess.stdout.on('data', (data) => {
        console.log(`fetch_data.py: ${data}`);
    });
    fetchProcess.stderr.on('data', (data) => {
        console.error(`fetch_data.py error: ${data}`);
    });
    fetchProcess.on('close', (code) => {
        console.log(`fetch_data.py exited with code ${code}`);
        if (code === 0) {
            const trainProcess = spawn('python', ['./recommender/train_recommender.py']);
            trainProcess.stdout.on('data', (data) => {
                console.log(`train_recommender.py: ${data}`);
            });
            trainProcess.stderr.on('data', (data) => {
                console.error(`train_recommender.py error: ${data}`);
            });
            trainProcess.on('close', (trainCode) => {
                console.log(`train_recommender.py exited with code ${trainCode}`);
            });
        }
    });
};

// Schedule hourly retraining
cron.schedule('0 * * * *', () => {
    console.log('Running scheduled data fetch and model retraining...');
    updateDataAndRetrain();
});

updateDataAndRetrain();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
