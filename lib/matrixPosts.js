export class MatrixFactorization {
    constructor(numUsers, numPosts, numFactors, learningRate = 0.01, lambda = 0.02, iterations = 1000) {
        this.numUsers = numUsers;
        this.numPosts = numPosts;
        this.numFactors = numFactors;
        this.learningRate = learningRate;
        this.lambda = lambda;
        this.iterations = iterations;
        this.userFactors = Array(numUsers).fill().map(() => Array(numFactors).fill(Math.random()));
        this.postFactors = Array(numPosts).fill().map(() => Array(numFactors).fill(Math.random()));
        this.R = Array(numUsers).fill().map(() => Array(numPosts).fill(0)); // Interaction matrix
    }

    initializeRatings(interactions, userIdToIndex, postIdToIndex) {
        interactions.forEach(({ userId, postId, interaction }) => {
            const userIndex = userIdToIndex[userId.toString()];
            const postIndex = postIdToIndex[postId.toString()];
            if (userIndex !== undefined && postIndex !== undefined) {
                this.R[userIndex][postIndex] = interaction;
            }
        });
    }

    calculateRMSE() {
        let totalError = 0;
        let count = 0;

        for (let i = 0; i < this.numUsers; i++) {
            for (let j = 0; j < this.numPosts; j++) {
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
        let stableCount = 0;

        for (let iter = 0; iter < this.iterations; iter++) {
            for (let i = 0; i < this.numUsers; i++) {
                for (let j = 0; j < this.numPosts; j++) {
                    if (this.R[i][j] > 0) {
                        let error = this.R[i][j] - this.predict(i, j);
                        for (let k = 0; k < this.numFactors; k++) {
                            let userFactor = this.userFactors[i][k];
                            let postFactor = this.postFactors[j][k];
                            this.userFactors[i][k] += this.learningRate * (2 * error * postFactor - this.lambda * userFactor);
                            this.postFactors[j][k] += this.learningRate * (2 * error * userFactor - this.lambda * postFactor);
                        }
                    }
                }
            }

            const currentRMSE = this.calculateRMSE();
            // UNCOMMENT THIS CONSOLE LOG FOR DEBUG REASONS
            // console.log(`Iteration ${iter + 1}, RMSE: ${currentRMSE}`);

            if (currentRMSE >= previousRMSE) {
                stableCount++;
            } else {
                stableCount = 0;
            }

            previousRMSE = currentRMSE;

            if (stableCount >= 2) {
                console.log("RMSE has not decreased for 2 iterations, stopping early.");
                break;
            }
        }
    }

    predict(userId, postId) {
        let prediction = 0;
        for (let k = 0; k < this.numFactors; k++) {
            prediction += this.userFactors[userId][k] * this.postFactors[postId][k];
        }
        return prediction;
    }
}
