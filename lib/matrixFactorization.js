//possible solution!!!!!
export class MatrixFactorization {
    constructor(numUsers, numListings, numFactors, learningRate = 0.01, lambda = 0.02, iterations = 1000) {
        this.numUsers = numUsers;
        this.numListings = numListings;
        this.numFactors = numFactors;
        this.learningRate = learningRate;
        this.lambda = lambda;
        this.iterations = iterations;
        this.userFactors = Array(numUsers).fill().map(() => Array(numFactors).fill(Math.random()));
        this.itemFactors = Array(numListings).fill().map(() => Array(numFactors).fill(Math.random()));
        this.R = Array(numUsers).fill().map(() => Array(numListings).fill(0)); // Rating matrix
    }

    initializeRatings(interactions, userIdToIndex, listingIdToIndex) {
        interactions.forEach(({ userId, listingId, interaction }) => {
            const userIndex = userIdToIndex[userId.toString()];
            const listingIndex = listingIdToIndex[listingId.toString()];
            if (userIndex !== undefined && listingIndex !== undefined) {
                this.R[userIndex][listingIndex] = interaction;
            }
        });
    }

    calculateRMSE() {
        let totalError = 0;
        let count = 0;

        for (let i = 0; i < this.numUsers; i++) {
            for (let j = 0; j < this.numListings; j++) {
                if (this.R[i][j] > 0) {
                    let error = this.R[i][j] - this.predict(i, j);
                    totalError += error ** 2;
                    count++;
                }
            }
        }

        return Math.sqrt(totalError / count);
    }

    train() {
        let previousRMSE = Number.MAX_VALUE;
        let stableCount = 0; // To keep track of RMSE stability

        for (let iter = 0; iter < this.iterations; iter++) {
            for (let i = 0; i < this.numUsers; i++) {
                for (let j = 0; j < this.numListings; j++) {
                    if (this.R[i][j] > 0) {
                        let error = this.R[i][j] - this.predict(i, j);
                        // console.log("values", this.R[i][j], this.predict(i, j));
                        for (let k = 0; k < this.numFactors; k++) {
                            let userFactor = this.userFactors[i][k];
                            let itemFactor = this.itemFactors[j][k];
                            this.userFactors[i][k] += this.learningRate * (2 * error * itemFactor - this.lambda * userFactor);
                            this.itemFactors[j][k] += this.learningRate * (2 * error * userFactor - this.lambda * itemFactor);
                        }
                    }
                }
            }

            // Calculate the RMSE after this iteration
            const currentRMSE = this.calculateRMSE();
            // UNCOMMENT FOR DEBUG REASONS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            // console.log(`Iteration ${iter + 1}, RMSE: ${currentRMSE}`);

            // Check if RMSE is not decreasing, increment stability count
            if (currentRMSE >= previousRMSE) {
                stableCount++;
            } else {
                stableCount = 0;
            }

            // Update previous RMSE
            previousRMSE = currentRMSE;

            // Terminate the loop if RMSE does not decrease for 2 iterations
            if (stableCount >= 2) {
                console.log("RMSE has not decreased for 2 iterations, stopping early.");
                break;
            }
        }
    }

    predict(userId, listingId) {
        let prediction = 0;
        for (let k = 0; k < this.numFactors; k++) {
            prediction += this.userFactors[userId][k] * this.itemFactors[listingId][k];
        }
        return prediction;
    }
}