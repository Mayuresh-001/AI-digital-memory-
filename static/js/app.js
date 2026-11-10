/**
 * AI Digital Memory for Students - Frontend Application
 */

const API_BASE = "/api";
const IS_STATIC_HOST = window.location.hostname.includes("github.io") || window.location.protocol === "file:";

// Application State
const state = {
    token: localStorage.getItem("adm_token") || null,
    student: null,
    currentTab: "dashboard",
    sidebarCollapsed: false,
    charts: {},
    activeQuiz: null,
    quizAnswers: {},
    subjects: [],
    topics: [],
    newTopicFiles: [],
    activeTopicDetails: null,
    plannerViewMode: "table",
    activePlannerFilter: "ALL",
    activePlannerUploadTopicId: null,
    plannerRecommendations: [],
    subjectsViewMode: "cards",
    activeSubjectPdfUploadTopicId: null
};

// Comprehensive Master Quiz Question Bank (225 questions, exactly 25 per topic)
const MASTER_QUIZ_BANK = [
    {
        "id": 1,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What does the slope coefficient represent in a simple linear regression y = beta_0 + beta_1 * x?",
        "option_a": "The expected value of y when x is zero",
        "option_b": "The expected change in y for every one-unit increase in x",
        "option_c": "The total residual sum of squares",
        "option_d": "The Pearson correlation coefficient squared",
        "correct_option": "B",
        "explanation": "The slope coefficient (beta_1) quantifies the estimated change in dependent variable y for every 1-unit increase in predictor x."
    },
    {
        "id": 2,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "Which metric penalizes complex models by factoring in the number of predictors?",
        "option_a": "R-squared",
        "option_b": "Adjusted R-squared",
        "option_c": "Mean Absolute Error",
        "option_d": "Mean Squared Error",
        "correct_option": "B",
        "explanation": "Adjusted R-squared penalizes the inclusion of unnecessary explanatory variables relative to sample size."
    },
    {
        "id": 3,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "If the learning rate in gradient descent is excessively large, what occurs?",
        "option_a": "Gradient descent converges very slowly",
        "option_b": "The parameters overshoot the minimum and the cost function may diverge",
        "option_c": "The model underfits due to vanishing gradients",
        "option_d": "The residuals automatically equal zero",
        "correct_option": "B",
        "explanation": "An excessively large learning rate causes gradient descent steps to overshoot the global minimum, causing oscillations or divergence."
    },
    {
        "id": 4,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What is the closed-form analytical solution (Normal Equation) for Ordinary Least Squares?",
        "option_a": "beta = (X^T X)^(-1) X^T y",
        "option_b": "beta = (X X^T)^(-1) X y",
        "option_c": "beta = X^T (X X^T)^(-1) y",
        "option_d": "beta = (X^T y)^(-1) X",
        "correct_option": "A",
        "explanation": "The Normal Equation is derived by setting the gradient of the residual sum of squares to zero: beta = (X^T X)^(-1) X^T y."
    },
    {
        "id": 5,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What assumption about residuals is tested using a quantile-quantile (Q-Q) plot?",
        "option_a": "Multicollinearity",
        "option_b": "Homoscedasticity",
        "option_c": "Normality of error terms",
        "option_d": "Independence of observations",
        "correct_option": "C",
        "explanation": "A Q-Q plot compares the quantiles of residual errors against a theoretical standard normal distribution."
    },
    {
        "id": 6,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What phenomenon describes unequal variance of residuals across levels of an independent variable?",
        "option_a": "Multicollinearity",
        "option_b": "Heteroscedasticity",
        "option_c": "Autocorrelation",
        "option_d": "Endogeneity",
        "correct_option": "B",
        "explanation": "Heteroscedasticity occurs when the spread or variance of the residuals varies systematically with the values of predictor variables."
    },
    {
        "id": 7,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "Which metric is commonly used to detect multicollinearity among features?",
        "option_a": "Variance Inflation Factor (VIF)",
        "option_b": "Durbin-Watson statistic",
        "option_c": "Akaike Information Criterion (AIC)",
        "option_d": "Cook's Distance",
        "correct_option": "A",
        "explanation": "A Variance Inflation Factor (VIF) greater than 5 or 10 indicates problematic multicollinearity among predictors."
    },
    {
        "id": 8,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What penalty term is added to the loss function in Ridge Regression (L2 regularization)?",
        "option_a": "lambda * sum(|beta_j|)",
        "option_b": "lambda * sum(beta_j^2)",
        "option_c": "lambda * max(|beta_j|)",
        "option_d": "lambda * det(X^T X)",
        "correct_option": "B",
        "explanation": "Ridge regression penalizes the sum of squared coefficients (L2 norm), shrinking weights towards zero without setting them strictly to zero."
    },
    {
        "id": 9,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "How does Lasso Regression (L1 regularization) differ fundamentally from Ridge Regression?",
        "option_a": "Lasso can set coefficients exactly to zero, performing automatic feature selection",
        "option_b": "Lasso has a closed-form analytical solution while Ridge does not",
        "option_c": "Lasso only works for non-negative predictors",
        "option_d": "Lasso increases the variance of predictions more than ordinary least squares",
        "correct_option": "A",
        "explanation": "L1 regularization produces a diamond-shaped constraint region, which tends to intersect cost contours at coordinate axes, forcing weights to zero."
    },
    {
        "id": 10,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What is the Durbin-Watson statistic used to detect in regression residuals?",
        "option_a": "Heteroscedasticity",
        "option_b": "Non-normality",
        "option_c": "First-order autocorrelation",
        "option_d": "Multicollinearity",
        "correct_option": "C",
        "explanation": "The Durbin-Watson test checks for correlation between consecutive residuals, with values near 2.0 indicating no autocorrelation."
    },
    {
        "id": 11,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What is the computational complexity of computing the Normal Equation with d features and n samples?",
        "option_a": "O(n * d)",
        "option_b": "O(d^3 + n * d^2)",
        "option_c": "O(n^2 * d)",
        "option_d": "O(2^d)",
        "correct_option": "B",
        "explanation": "Computing X^T X takes O(n * d^2), and inverting the d x d matrix takes O(d^3), making gradient descent preferable when d is very large."
    },
    {
        "id": 12,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "Why must features be normalized before training a linear regression model with Gradient Descent?",
        "option_a": "To satisfy the Gauss-Markov theorem",
        "option_b": "To make the cost surface isotropic and allow faster, direct convergence towards the minimum",
        "option_c": "To eliminate residual autocorrelation",
        "option_d": "To prevent collinearity between independent variables",
        "correct_option": "B",
        "explanation": "Feature standardization creates circular/spherical loss contours, preventing gradient descent from oscillating slowly along elongated ravines."
    },
    {
        "id": 13,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What diagnostic metric identifies influential observations that disproportionately affect regression coefficients?",
        "option_a": "R-squared",
        "option_b": "Cook's Distance",
        "option_c": "Mean Absolute Error",
        "option_d": "F-statistic",
        "correct_option": "B",
        "explanation": "Cook's Distance measures the change in all fitted values when a specific data point is deleted from the training set."
    },
    {
        "id": 14,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "In simple linear regression, what is the geometric relationship between the residual vector and column space of X?",
        "option_a": "They are parallel",
        "option_b": "They are orthogonal (perpendicular)",
        "option_c": "They have an angle of 45 degrees",
        "option_d": "They are identical",
        "correct_option": "B",
        "explanation": "OLS projects vector y onto the column space of X; the residual vector (y - y_hat) is orthogonal to the column space spanned by X."
    },
    {
        "id": 15,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What does the Gauss-Markov theorem state about OLS estimators under standard assumptions?",
        "option_a": "They have zero variance",
        "option_b": "They are the Best Linear Unbiased Estimators (BLUE)",
        "option_c": "They achieve 100% test accuracy",
        "option_d": "They eliminate all non-linear interactions",
        "correct_option": "B",
        "explanation": "The Gauss-Markov theorem proves that OLS estimators have the minimum variance among all linear unbiased estimators."
    },
    {
        "id": 16,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "If you have a categorical variable with k categories, how many dummy variables should be included to avoid the dummy variable trap?",
        "option_a": "k",
        "option_b": "k - 1",
        "option_c": "k + 1",
        "option_d": "2 * k",
        "correct_option": "B",
        "explanation": "Using k dummy variables alongside an intercept term causes perfect multicollinearity; using k - 1 avoids the dummy variable trap."
    },
    {
        "id": 17,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What happens to the bias and variance of a linear model as the regularization parameter lambda increases?",
        "option_a": "Bias decreases, variance increases",
        "option_b": "Bias increases, variance decreases",
        "option_c": "Both bias and variance increase",
        "option_d": "Both bias and variance decrease",
        "correct_option": "B",
        "explanation": "Increasing regularization restricts model flexibility, which increases bias but significantly reduces model variance."
    },
    {
        "id": 18,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What does the overall F-test in a multiple linear regression evaluate?",
        "option_a": "Whether the intercept is equal to zero",
        "option_b": "Whether at least one predictor coefficient is significantly different from zero",
        "option_c": "Whether residuals are normally distributed",
        "option_d": "Whether training error equals test error",
        "correct_option": "B",
        "explanation": "The global F-test tests the null hypothesis that all regression slope coefficients are simultaneously equal to zero against the alternative that at least one is non-zero."
    },
    {
        "id": 19,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "Which loss metric is most sensitive to large outlier errors?",
        "option_a": "Mean Absolute Error (MAE)",
        "option_b": "Median Absolute Deviation (MAD)",
        "option_c": "Mean Squared Error (MSE)",
        "option_d": "Huber loss with delta = 0.5",
        "correct_option": "C",
        "explanation": "MSE squares each error term, penalizing large residual errors quadratically and heavily weighting outliers."
    },
    {
        "id": 20,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What is an advantage of Stochastic Gradient Descent (SGD) over Batch Gradient Descent for linear regression?",
        "option_a": "Guaranteed monotonic decrease in cost function at every step",
        "option_b": "Ability to update weights online and handle massive datasets that do not fit in RAM",
        "option_c": "No requirement for setting a learning rate",
        "option_d": "Exact computation of matrix inverses",
        "correct_option": "B",
        "explanation": "SGD updates parameters using one sample or mini-batch at a time, making it memory-efficient and capable of streaming updates."
    },
    {
        "id": 21,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "If the Pearson correlation between x and y is r = -0.8, what is the coefficient of determination R-squared in simple regression?",
        "option_a": "-0.80",
        "option_b": "0.64",
        "option_c": "-0.64",
        "option_d": "0.80",
        "correct_option": "B",
        "explanation": "In simple univariate linear regression, R-squared equals the square of Pearson's correlation coefficient: (-0.8)^2 = 0.64 (or 64%)."
    },
    {
        "id": 22,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What is the gradient of the MSE cost function J(w) = (1/n) * ||Xw - y||^2 with respect to weight vector w?",
        "option_a": "(2/n) * X^T (Xw - y)",
        "option_b": "(1/n) * (Xw - y)",
        "option_c": "(2/n) * (Xw - y) X",
        "option_d": "(1/2n) * X^T y",
        "correct_option": "A",
        "explanation": "Differentiating the matrix quadratic form yields the gradient (2/n) * X^T (Xw - y), which points in the direction of steepest cost ascent."
    },
    {
        "id": 23,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What does a high leverage point represent in a regression dataset?",
        "option_a": "An observation with an extreme value in the response variable y",
        "option_b": "An observation with extreme or outlier values in the predictor space X",
        "option_c": "A data point where residual error is zero",
        "option_d": "A feature with zero variance",
        "correct_option": "B",
        "explanation": "Leverage measures the distance of an observation's predictor values from the mean of predictors; points with extreme X have high leverage on the regression line."
    },
    {
        "id": 24,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "How does Polynomial Regression fit non-linear curves while still being classified as a linear model?",
        "option_a": "It uses deep neural layers",
        "option_b": "It is non-linear in parameters beta but linear in the feature matrix",
        "option_c": "It is linear in the parameters beta even though features are raised to polynomial powers",
        "option_d": "It computes non-Euclidean distance kernels",
        "correct_option": "C",
        "explanation": "Linearity in linear regression refers strictly to the parameters beta; raising input x to powers (x^2, x^3) creates linear combinations of polynomial basis features."
    },
    {
        "id": 25,
        "topic_id": 1,
        "topic_title": "Linear Regression",
        "question_text": "What is the mathematical consequence of having two perfectly collinear independent variables in X?",
        "option_a": "The cost function becomes strictly non-convex",
        "option_b": "The matrix X^T X is singular (non-invertible) with determinant equal to zero",
        "option_c": "The residuals will sum to infinity",
        "option_d": "Gradient descent will immediately diverge",
        "correct_option": "B",
        "explanation": "When features are perfectly collinear, columns of X are linearly dependent, making X^T X non-invertible so OLS has infinite non-unique solutions."
    },
    {
        "id": 26,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "Which mathematical tool is the fundamental engine of backpropagation?",
        "option_a": "Taylor series expansion",
        "option_b": "Multivariable Chain Rule",
        "option_c": "Lagrange multipliers",
        "option_d": "Singular Value Decomposition",
        "correct_option": "B",
        "explanation": "Backpropagation computes partial derivatives of the scalar loss with respect to all network weights by systematic backward application of the multivariable chain rule."
    },
    {
        "id": 27,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the derivative of the standard logistic sigmoid function sigma(z)?",
        "option_a": "sigma(z) * (1 - sigma(z))",
        "option_b": "1 - sigma(z)^2",
        "option_c": "exp(-z) / (1 + exp(-z))",
        "option_d": "sigma(z) * exp(z)",
        "correct_option": "A",
        "explanation": "The derivative of sigmoid simplifies to sigma(z) * (1 - sigma(z)), reaching a maximum value of 0.25 at z = 0."
    },
    {
        "id": 28,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What causes the vanishing gradient problem during backpropagation in deep neural networks with sigmoid activations?",
        "option_a": "Weights exploding to infinity during matrix products",
        "option_b": "Maximum derivative of sigmoid is 0.25; chaining multiple layers repeatedly multiplies numbers < 1 towards zero",
        "option_c": "The learning rate dynamically increasing",
        "option_d": "Negative eigenvalues in the Hessian matrix",
        "correct_option": "B",
        "explanation": "Because sigmoid derivatives peak at 0.25, repeated multiplication through deep layers causes earlier gradients to shrink exponentially toward zero."
    },
    {
        "id": 29,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the derivative of the hyperbolic tangent activation function tanh(z)?",
        "option_a": "1 - tanh^2(z)",
        "option_b": "tanh(z) * (1 - tanh(z))",
        "option_c": "sech(z)",
        "option_d": "1 + tanh^2(z)",
        "correct_option": "A",
        "explanation": "Using basic calculus identities, the derivative of tanh(z) equals 1 - tanh^2(z), reaching a maximum of 1.0 at z = 0."
    },
    {
        "id": 30,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "Why does the Rectified Linear Unit (ReLU) function alleviate the vanishing gradient problem?",
        "option_a": "Its derivative is exactly 1 for all positive inputs z > 0",
        "option_b": "It is bounded between 0 and 1",
        "option_c": "It has continuous second derivatives everywhere",
        "option_d": "It converts matrix multiplication to element-wise addition",
        "correct_option": "A",
        "explanation": "For all z > 0, the derivative of ReLU is 1.0, preserving gradient magnitude through deep layers without exponential decay."
    },
    {
        "id": 31,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the 'Dying ReLU' problem?",
        "option_a": "Neurons whose activations permanently become 0 because inputs stay negative and gradients remain 0",
        "option_b": "Neurons whose weights grow exponentially without bound",
        "option_c": "Loss function oscillating wildly near the global minimum",
        "option_d": "Gradients flipping sign at every training epoch",
        "correct_option": "A",
        "explanation": "If a neuron's activation falls into the negative regime, its output is 0 and its local gradient is 0, preventing incoming weights from ever updating."
    },
    {
        "id": 32,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "When combining Softmax activation in the output layer with Cross-Entropy Loss, what does the gradient with respect to output logits simplify to?",
        "option_a": "p_i - y_i",
        "option_b": "p_i * y_i",
        "option_c": "(p_i - y_i) / (p_i * (1 - p_i))",
        "option_d": "log(p_i) - log(y_i)",
        "correct_option": "A",
        "explanation": "The derivative of cross-entropy loss with respect to pre-softmax logit z_i simplifies cleanly to the prediction minus ground truth: p_i - y_i."
    },
    {
        "id": 33,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the purpose of Gradient Clipping during backpropagation in deep or recurrent networks?",
        "option_a": "To accelerate forward pass computation",
        "option_b": "To prevent exploding gradients from destabilizing weight updates",
        "option_c": "To prune redundant synaptic connections",
        "option_d": "To force activations into the range [-1, 1]",
        "correct_option": "B",
        "explanation": "Gradient clipping rescales the gradient vector if its norm exceeds a threshold, avoiding destructive parameter updates caused by steep cliffs."
    },
    {
        "id": 34,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the recurrence relation for the error term delta^(l) in a layer with activation function f?",
        "option_a": "delta^(l) = (W^(l+1) * delta^(l+1)) * f(z^(l))",
        "option_b": "delta^(l) = (W^(l+1)T * delta^(l+1)) . f'(z^(l))",
        "option_c": "delta^(l) = W^(l) * f'(z^(l))",
        "option_d": "delta^(l) = delta^(l+1) * W^(l)",
        "correct_option": "B",
        "explanation": "The error delta at layer l is the backpropagated error from layer l+1 transposed through weights W^(l+1) and multiplied element-wise by the activation derivative f'(z^(l))."
    },
    {
        "id": 35,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "Why is He (Kaiming) weight initialization preferred over Xavier (Glorot) for ReLU networks?",
        "option_a": "Xavier initialization sets all weights to zero",
        "option_b": "He initialization accounts for the fact that half of ReLU activations are zero by scaling variance by 2/n",
        "option_c": "He initialization eliminates the need for backpropagation",
        "option_d": "Xavier initialization is only valid for convolutional layers",
        "correct_option": "B",
        "explanation": "Since ReLU zeroes out approximately half the incoming inputs, He initialization doubles the variance (Var(W) = 2/n_in) to keep signal variance constant across layers."
    },
    {
        "id": 36,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What happens if all weights in a neural network layer are initialized to the exact same constant value (e.g., all zeros)?",
        "option_a": "The network will converge twice as fast",
        "option_b": "Symmetry breaking fails; all hidden units in that layer compute identical gradients and remain identical throughout training",
        "option_c": "The learning rate will automatically decay to zero",
        "option_d": "The cost function will immediately reach a global minimum",
        "correct_option": "B",
        "explanation": "Identical weights cause all hidden units to compute identical forward activations and gradients, preventing the network from learning diverse features."
    },
    {
        "id": 37,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "How is Dropout handled during the backward pass of training?",
        "option_a": "All units receive gradients regardless of dropout mask",
        "option_b": "Gradients are only propagated backward through the neurons that were active during the forward pass",
        "option_c": "The dropout mask is inverted in the backward pass",
        "option_d": "Weights are updated using the Hessian matrix",
        "correct_option": "B",
        "explanation": "Backpropagation propagates errors through the exact same binary mask used during the forward pass; dropped units have zero gradient."
    },
    {
        "id": 38,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What does the Adam optimizer maintain for each individual network parameter during backpropagation?",
        "option_a": "First moment (mean) and second moment (uncentered variance) of the gradients",
        "option_b": "Only the Hessian matrix diagonal",
        "option_c": "The full covariance matrix of activations",
        "option_d": "A fixed decay factor independent of gradient history",
        "correct_option": "A",
        "explanation": "Adam maintains exponential moving averages of both the past gradients (m_t) and past squared gradients (v_t) with bias correction."
    },
    {
        "id": 39,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the computational relationship between the forward pass and backward pass in standard dense networks?",
        "option_a": "Backward pass takes approximately the same time or about twice as many FLOPs as the forward pass",
        "option_b": "Backward pass is O(1) complexity",
        "option_c": "Forward pass takes 100x longer than the backward pass",
        "option_d": "Backward pass does not require matrix multiplication",
        "correct_option": "A",
        "explanation": "The backward pass requires computing gradients with respect to both inputs and weights, typically requiring roughly 2x the floating-point operations of the forward pass."
    },
    {
        "id": 40,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "In reverse-mode automatic differentiation (backpropagation), how are gradients accumulated?",
        "option_a": "From input features forward to output loss",
        "option_b": "From scalar objective loss backward through intermediate computational graph nodes to input parameters",
        "option_c": "By computing finite numerical differences at every point",
        "option_d": "By randomly perturbing weights and checking loss differences",
        "correct_option": "B",
        "explanation": "Reverse-mode AD is optimal when the function has one scalar output (loss) and many input parameters, sweeping backwards from loss to inputs in a single pass."
    },
    {
        "id": 41,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "Why do Skip Connections (Residual Connections) in ResNets fundamentally improve gradient flow?",
        "option_a": "They replace backpropagation with reinforcement learning",
        "option_b": "They add identity shortcuts where gradients flow backward directly without attenuation (d(x + F(x))/dx = 1 + dF/dx)",
        "option_c": "They enforce all weights to be non-negative",
        "option_d": "They double the depth of every convolution filter",
        "correct_option": "B",
        "explanation": "The identity mapping ensures that the gradient contains an additive term of 1, allowing gradients to propagate directly to early layers without shrinking."
    },
    {
        "id": 42,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "How does Batch Normalization affect the loss landscape during backpropagation?",
        "option_a": "It introduces high-frequency oscillations into the loss surface",
        "option_b": "It smoothens the loss landscape, making gradients more predictive and stable across batches",
        "option_c": "It forces all weights to converge to zero",
        "option_d": "It removes the need for computing activation derivatives",
        "correct_option": "B",
        "explanation": "Batch Normalization re-centers and re-scales intermediate representations, making the optimization landscape significantly smoother and permitting higher learning rates."
    },
    {
        "id": 43,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the mathematical definition of the Jacobian matrix in vector-to-vector backpropagation?",
        "option_a": "Matrix of all first-order partial derivatives of a vector-valued function",
        "option_b": "Matrix of second-order partial derivatives of scalar loss",
        "option_c": "The inverse of the weight matrix W",
        "option_d": "The outer product of the bias vector with itself",
        "correct_option": "A",
        "explanation": "The Jacobian J_ij = df_i / dx_j holds all pairwise first-order partial derivatives between an output vector f and an input vector x."
    },
    {
        "id": 44,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the difference between Batch Gradient Descent, Mini-Batch GD, and Stochastic GD?",
        "option_a": "Batch uses entire dataset; Mini-batch uses subsets (e.g., 32-256 samples); SGD uses a single sample per step",
        "option_b": "Batch uses momentum; SGD does not",
        "option_c": "Mini-batch only works for convolutional networks",
        "option_d": "SGD computes second-order derivatives",
        "correct_option": "A",
        "explanation": "Batch GD computes gradients over the complete dataset; Mini-batch balances vectorization speed and gradient noise; SGD updates per single training observation."
    },
    {
        "id": 45,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the role of the Momentum term in gradient descent optimization?",
        "option_a": "It dampens oscillations in high-curvature directions and accelerates movement along persistent gradient directions",
        "option_b": "It randomly shuffles training samples at every iteration",
        "option_c": "It forces gradients to sum to zero",
        "option_d": "It dynamically adjusts the network's depth",
        "correct_option": "A",
        "explanation": "Momentum accumulates a velocity vector in the direction of persistent gradients: v_t = gamma * v_{t-1} + alpha * grad, smoothing zigzagging paths."
    },
    {
        "id": 46,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the Leaky ReLU activation function designed to address?",
        "option_a": "Exploding gradients in the output layer",
        "option_b": "The Dying ReLU problem by providing a small non-zero slope (e.g., 0.01) for negative inputs",
        "option_c": "Softmax normalization instabilities",
        "option_d": "Quadratic computation times",
        "correct_option": "B",
        "explanation": "Leaky ReLU defines f(z) = z for z > 0 and f(z) = alpha * z for z <= 0, ensuring neurons always have a non-zero gradient even when inactive."
    },
    {
        "id": 47,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What is the weight update rule in gradient descent with L2 Weight Decay (regularization factor lambda)?",
        "option_a": "w = (1 - lr * lambda) * w - lr * grad_loss",
        "option_b": "w = w - lr * grad_loss + lambda",
        "option_c": "w = w / (1 + lambda)",
        "option_d": "w = -lr * lambda * grad_loss",
        "correct_option": "A",
        "explanation": "L2 regularization adds (lambda/2)*||w||^2 to the loss, resulting in a gradient term lambda*w that shrinks weights by (1 - lr*lambda) at each iteration."
    },
    {
        "id": 48,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "In a multi-layer perceptron, what does the gradient of the loss with respect to bias b^(l) equal?",
        "option_a": "The error vector delta^(l) of that layer",
        "option_b": "delta^(l) multiplied by input activations a^(l-1)",
        "option_c": "The weight matrix W^(l) transposed",
        "option_d": "Zero",
        "correct_option": "A",
        "explanation": "Since z = W * a + b, dz/db is the identity matrix, meaning dLoss/db^(l) equals the layer error vector delta^(l)."
    },
    {
        "id": 49,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "Why is learning rate scheduling (e.g., Cosine Annealing or Step Decay) beneficial during training?",
        "option_a": "Large initial rates explore broad regions of loss space; smaller late rates allow fine convergence into sharp minima",
        "option_b": "It eliminates the need for computing activation derivatives",
        "option_c": "It guarantees the training accuracy reaches exactly 100%",
        "option_d": "It prevents the dataset from overfitting during validation",
        "correct_option": "A",
        "explanation": "High initial learning rates escape shallow local minima and saddle points, while decaying learning rates allow parameters to settle into deep minima."
    },
    {
        "id": 50,
        "topic_id": 2,
        "topic_title": "Neural Network Backpropagation",
        "question_text": "What does the Hessian matrix represent in neural network optimization?",
        "option_a": "Matrix of all second-order partial derivatives of the scalar loss with respect to parameters",
        "option_b": "Matrix of first-order derivatives of all hidden activations",
        "option_c": "The product of the weight matrix and bias vector",
        "option_d": "The inverse of the covariance matrix of input data",
        "correct_option": "A",
        "explanation": "The Hessian H_ij = d^2 L / (dw_i dw_j) captures local curvature of the loss surface, utilized in second-order optimization methods like Newton-Raphson."
    },
    {
        "id": 51,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What is the geometric objective of a Linear Support Vector Machine?",
        "option_a": "Minimize the mean squared error between predictions and ground truth",
        "option_b": "Maximize the margin between the separating hyperplane and the closest training points of any class",
        "option_c": "Cluster data points around centroids in feature space",
        "option_d": "Project data onto orthogonal principal components",
        "correct_option": "B",
        "explanation": "An SVM seeks the optimal decision boundary that maximizes the geometric distance (margin) to the nearest training instances of either class."
    },
    {
        "id": 52,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What are 'support vectors' in an SVM model?",
        "option_a": "All training observations in the dataset",
        "option_b": "The specific training points that lie on the margin boundaries or violate the margin",
        "option_c": "The orthogonal axes in kernel space",
        "option_d": "The eigenvectors of the Gram matrix",
        "correct_option": "B",
        "explanation": "Support vectors are the critical data points that lie on or within the margin boundary; removing all other data points would not change the decision boundary."
    },
    {
        "id": 53,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "In a hard-margin SVM, what is the geometric width of the margin between the two bounding planes?",
        "option_a": "2 / ||w||",
        "option_b": "||w||^2",
        "option_c": "1 / (2 * ||w||)",
        "option_d": "det(w)",
        "correct_option": "A",
        "explanation": "The margin boundary hyperplanes are w.x + b = 1 and w.x + b = -1. The geometric distance between them is 2 / ||w||."
    },
    {
        "id": 54,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "How does the regularization hyperparameter C influence the behavior of a Soft-Margin SVM?",
        "option_a": "Larger C tolerates more margin violations (wider margin)",
        "option_b": "Larger C heavily penalizes margin violations, resulting in a narrower margin with lower bias and higher variance",
        "option_c": "C controls the degree of the polynomial kernel",
        "option_d": "C sets the number of support vectors to a constant value",
        "correct_option": "B",
        "explanation": "C controls the trade-off between maximizing margin and minimizing slack violations. A large C penalizes errors strictly, risking overfitting."
    },
    {
        "id": 55,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What is the 'Kernel Trick' in Support Vector Machines?",
        "option_a": "Computing inner products in high-dimensional feature space using a kernel function without explicitly transforming coordinates",
        "option_b": "Using neural networks to preprocess tabular features",
        "option_c": "Applying k-means clustering before fitting an SVM",
        "option_d": "Replacing quadratic programming with gradient descent",
        "correct_option": "A",
        "explanation": "The kernel trick computes K(x, z) = <phi(x), phi(z)> directly, enabling non-linear classification in arbitrary high-dimensional Hilbert spaces at low computational cost."
    },
    {
        "id": 56,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What is the mathematical formula for the Radial Basis Function (RBF) or Gaussian kernel?",
        "option_a": "K(x, z) = exp(-gamma * ||x - z||^2)",
        "option_b": "K(x, z) = (x . z + c)^d",
        "option_c": "K(x, z) = tanh(gamma * x . z + c)",
        "option_d": "K(x, z) = ||x - z||",
        "correct_option": "A",
        "explanation": "The RBF kernel computes exponential decay of squared Euclidean distance between two vectors: K(x, z) = exp(-gamma * ||x - z||^2)."
    },
    {
        "id": 57,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "In an RBF kernel SVM, what occurs when the hyperparameter gamma is set to a very large value?",
        "option_a": "The model underfits and acts like a linear classifier",
        "option_b": "The decision boundary becomes overly complex, fitting tightly around individual points (high variance, risk of overfitting)",
        "option_c": "All points become support vectors with identical weights",
        "option_d": "The margin width expands to infinity",
        "correct_option": "B",
        "explanation": "A large gamma means the radius of influence of each support vector is small, creating localized islands around individual points and risking severe overfitting."
    },
    {
        "id": 58,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What loss function does a Support Vector Machine minimize in its primal formulation?",
        "option_a": "Binary Cross-Entropy Loss",
        "option_b": "Hinge Loss: max(0, 1 - y * f(x))",
        "option_c": "Mean Squared Error",
        "option_d": "Kullback-Leibler Divergence",
        "correct_option": "B",
        "explanation": "The SVM primal optimization problem minimizes Hinge Loss max(0, 1 - y_i(w.x_i + b)) combined with an L2 weight penalty ||w||^2."
    },
    {
        "id": 59,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What mathematical theorem guarantees that a kernel function corresponds to an inner product in some Hilbert feature space?",
        "option_a": "Gauss-Markov Theorem",
        "option_b": "Mercer's Theorem",
        "option_c": "Central Limit Theorem",
        "option_d": "Bayes' Theorem",
        "correct_option": "B",
        "explanation": "Mercer's Theorem states that any continuous, symmetric, positive semi-definite kernel function K(x, z) represents an inner product in a valid feature space."
    },
    {
        "id": 60,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What is the role of slack variables xi_i in a Soft-Margin SVM?",
        "option_a": "They measure the degree to which an observation violates the margin or is misclassified",
        "option_b": "They adjust the learning rate of the optimizer",
        "option_c": "They represent the bias term b",
        "option_d": "They scale the feature matrix to unit variance",
        "correct_option": "A",
        "explanation": "Slack variable xi_i >= 0 quantifies margin violations: xi_i = 0 if point is on/beyond margin, 0 < xi_i <= 1 if inside margin but correct side, and xi_i > 1 if misclassified."
    },
    {
        "id": 61,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "In the dual formulation of an SVM, what does alpha_i = 0 imply for training point x_i?",
        "option_a": "The point is a critical support vector on the margin",
        "option_b": "The point is correctly classified outside the margin and has zero influence on the decision boundary",
        "option_c": "The point is an extreme outlier that was pruned",
        "option_d": "The point has zero feature values",
        "correct_option": "B",
        "explanation": "Due to KKT complementary slackness conditions, training observations strictly outside the margin have Lagrange multiplier alpha_i = 0 and do not contribute to w."
    },
    {
        "id": 62,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "Why is feature scaling essential before training an SVM?",
        "option_a": "SVMs cannot process negative numbers",
        "option_b": "Distance-based margin calculations and kernels are dominated by features with large numerical ranges",
        "option_c": "Feature scaling guarantees zero training error",
        "option_d": "It converts non-linear relationships into linear ones",
        "correct_option": "B",
        "explanation": "Because SVM margins and kernel functions rely on Euclidean distances, unscaled features with large scales dominate the optimization objective."
    },
    {
        "id": 63,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "How does an SVM perform multi-class classification for K > 2 classes using One-vs-Rest (OvR)?",
        "option_a": "It trains K binary classifiers, each separating one class from all other K - 1 classes combined",
        "option_b": "It trains K * (K - 1) / 2 classifiers for every pair of classes",
        "option_c": "It computes a single decision boundary in K dimensions",
        "option_d": "It uses softmax normalization on slack variables",
        "correct_option": "A",
        "explanation": "One-vs-Rest trains K distinct binary SVM models; the predicted class is the one whose classifier produces the highest confidence decision margin."
    },
    {
        "id": 64,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What optimization algorithm is specifically designed to solve the dual quadratic programming problem of SVMs efficiently?",
        "option_a": "Stochastic Gradient Descent",
        "option_b": "Sequential Minimal Optimization (SMO)",
        "option_c": "Newton-Raphson method",
        "option_d": "Backpropagation",
        "correct_option": "B",
        "explanation": "SMO breaks the quadratic programming problem into the smallest possible sub-problems, optimizing pairs of Lagrange multipliers alpha_i and alpha_j analytically."
    },
    {
        "id": 65,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What is the general computational training complexity of an exact Kernel SVM with n samples?",
        "option_a": "O(n)",
        "option_b": "O(n^2) to O(n^3)",
        "option_c": "O(log n)",
        "option_d": "O(n * d)",
        "correct_option": "B",
        "explanation": "Computing the n x n kernel Gram matrix and solving the dual QP problem scales between O(n^2) and O(n^3), making kernel SVMs slow on datasets with > 100,000 samples."
    },
    {
        "id": 66,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What is the formula for a Polynomial Kernel of degree d with offset c?",
        "option_a": "K(x, z) = (gamma * <x, z> + c)^d",
        "option_b": "K(x, z) = exp(-gamma * <x, z>^d)",
        "option_c": "K(x, z) = <x, z>^d + c",
        "option_d": "K(x, z) = d * <x, z> + c",
        "correct_option": "A",
        "explanation": "The polynomial kernel is defined as K(x, z) = (gamma * <x, z> + c)^d, modeling all feature combinations up to degree d."
    },
    {
        "id": 67,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "In Support Vector Regression (SVR), what is the purpose of the epsilon-insensitive tube?",
        "option_a": "Errors smaller than epsilon are ignored and incur zero penalty in the loss function",
        "option_b": "It forces predictions to be non-negative",
        "option_c": "It clips regression targets to the range [-epsilon, epsilon]",
        "option_d": "It limits the number of features to epsilon",
        "correct_option": "A",
        "explanation": "In epsilon-SVR, any prediction within an epsilon radius of the target is assigned zero loss, creating a sparse regression model dependent only on boundary points."
    },
    {
        "id": 68,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What condition on the Gram matrix G (where G_ij = K(x_i, x_j)) is required by Mercer's condition?",
        "option_a": "It must be skew-symmetric",
        "option_b": "It must be positive semi-definite (all eigenvalues >= 0)",
        "option_c": "It must have a determinant equal to 1",
        "option_d": "All off-diagonal elements must be zero",
        "correct_option": "B",
        "explanation": "To guarantee a convex optimization problem with a unique global minimum, the kernel Gram matrix must be symmetric and positive semi-definite."
    },
    {
        "id": 69,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What are the Karush-Kuhn-Tucker (KKT) conditions in the context of SVM optimization?",
        "option_a": "First-order necessary conditions for a solution in non-linear programming to be optimal under inequality constraints",
        "option_b": "Rules for stopping gradient descent iterations",
        "option_c": "A method for initializing weights in neural networks",
        "option_d": "Formulas for calculating the variance inflation factor",
        "correct_option": "A",
        "explanation": "The KKT conditions generalize Lagrange multipliers to inequality constraints, linking primal weights, dual multipliers alpha_i, and slack variables xi_i."
    },
    {
        "id": 70,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "Under what condition does a Linear SVM achieve 100% training accuracy with hard margins?",
        "option_a": "The dataset must be linearly separable without any overlapping class points",
        "option_b": "The number of features must exceed 100",
        "option_c": "The data must be normalized using MinMax scaler",
        "option_d": "All features must have Gaussian distributions",
        "correct_option": "A",
        "explanation": "Hard-margin SVM requires strict linear separability; if any points overlap or cannot be cleanly separated by a hyperplane, the hard-margin QP has no feasible solution."
    },
    {
        "id": 71,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "In an SVM with dual variables alpha_i, what determines the normal weight vector w of the decision boundary?",
        "option_a": "w = sum(alpha_i * y_i * x_i) for all support vectors",
        "option_b": "w = max(alpha_i)",
        "option_c": "w = sum(x_i) / n",
        "option_d": "w = (X^T X)^(-1) y",
        "correct_option": "A",
        "explanation": "The primal weight vector w is a linear combination of support vector instances weighted by their dual variables alpha_i and class labels y_i."
    },
    {
        "id": 72,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "Why are SVMs generally robust against the curse of dimensionality?",
        "option_a": "They project data down to 2 dimensions before classification",
        "option_b": "Margin maximization is governed by geometric margin distance rather than the number of feature dimensions",
        "option_c": "They automatically discard 90% of features",
        "option_d": "They use decision tree ensembles internally",
        "correct_option": "B",
        "explanation": "The generalization error of an SVM depends on the margin width and support vector density, not directly on the dimensionality of the feature space."
    },
    {
        "id": 73,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What does an SVM prediction rule sign(w . x + b) output when w . x + b = 0?",
        "option_a": "Class +1",
        "option_b": "Class -1",
        "option_c": "The observation lies precisely on the decision boundary hyperplane",
        "option_d": "The point is classified as an outlier",
        "correct_option": "C",
        "explanation": "w . x + b = 0 defines the decision boundary hyperplane itself; points on this surface have equal affinity for both classes."
    },
    {
        "id": 74,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "How does the One-vs-One (OvO) multi-class strategy work for K classes in an SVM?",
        "option_a": "It trains K * (K - 1) / 2 binary classifiers, one for every unique pair of classes, and uses majority voting",
        "option_b": "It trains K classifiers against the mean class vector",
        "option_c": "It solves a single K-dimensional convex optimization problem",
        "option_d": "It trains a decision tree on top of SVM margins",
        "correct_option": "A",
        "explanation": "OvO trains a separate binary SVM for each pair of classes (total K*(K-1)/2 models); test points are classified by majority voting across all models."
    },
    {
        "id": 75,
        "topic_id": 3,
        "topic_title": "Support Vector Machines",
        "question_text": "What type of boundary does a Linear SVM produce when applied to 2D data?",
        "option_a": "A straight 1D line",
        "option_b": "A parabolic curve",
        "option_c": "A closed circle",
        "option_d": "A piecewise step function",
        "correct_option": "A",
        "explanation": "In a 2-dimensional feature space, the separating hyperplane of a linear SVM is a straight 1-dimensional line: w_1*x_1 + w_2*x_2 + b = 0."
    },
    {
        "id": 76,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "Which tree traversal of a valid Binary Search Tree visits nodes in strictly ascending numerical order?",
        "option_a": "Pre-order traversal",
        "option_b": "In-order traversal",
        "option_c": "Post-order traversal",
        "option_d": "Level-order traversal",
        "correct_option": "B",
        "explanation": "An in-order traversal (Left subtree, Root node, Right subtree) processes keys in non-decreasing sorted order for any binary search tree."
    },
    {
        "id": 77,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the worst-case time complexity of searching an element in an unbalanced BST with n nodes?",
        "option_a": "O(1)",
        "option_b": "O(log n)",
        "option_c": "O(n)",
        "option_d": "O(n log n)",
        "correct_option": "C",
        "explanation": "In a degenerate skewed BST (where each node has only one child, resembling a linked list), searching requires traversing all n nodes in linear O(n) time."
    },
    {
        "id": 78,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the average-case time complexity for search, insertion, and deletion in a balanced BST?",
        "option_a": "O(1)",
        "option_b": "O(log n)",
        "option_c": "O(n)",
        "option_d": "O(n^2)",
        "correct_option": "B",
        "explanation": "When a BST is balanced, its height is h = O(log n), so search, insertion, and deletion all run in O(log n) time."
    },
    {
        "id": 79,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "In a valid Binary Search Tree, what property must hold for every node X?",
        "option_a": "All keys in the left subtree must be less than X, and all keys in the right subtree must be greater than X",
        "option_b": "The left child must equal the right child",
        "option_c": "Every node must have exactly two children",
        "option_d": "The root must be the median of all elements",
        "correct_option": "A",
        "explanation": "The core BST invariant requires that all descendants in a node's left subtree have keys strictly less than the node, and all right descendants have keys strictly greater."
    },
    {
        "id": 80,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "How is a node with two children deleted from a Binary Search Tree?",
        "option_a": "Replace the node with its in-order predecessor or in-order successor, then recursively delete that replacement node",
        "option_b": "Delete the node and all of its descendants",
        "option_c": "Promote the left child directly and discard the right subtree",
        "option_d": "Rotate the root of the tree to the right",
        "correct_option": "A",
        "explanation": "To maintain the BST property, a node with two children is replaced by either the minimum node in its right subtree (in-order successor) or the maximum in its left subtree."
    },
    {
        "id": 81,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the In-order Successor of a node in a Binary Search Tree?",
        "option_a": "The node with the smallest key strictly greater than the given node's key",
        "option_b": "The parent of the given node",
        "option_c": "The leftmost leaf in the entire tree",
        "option_d": "The right child of the given node",
        "correct_option": "A",
        "explanation": "The in-order successor is the next node visited in in-order sequence; if the node has a right subtree, it is the minimum node in that right subtree."
    },
    {
        "id": 82,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "Which traversal algorithm uses a First-In-First-Out (FIFO) queue data structure?",
        "option_a": "Pre-order traversal",
        "option_b": "In-order traversal",
        "option_c": "Post-order traversal",
        "option_d": "Level-order (Breadth-First) traversal",
        "correct_option": "D",
        "explanation": "Level-order traversal visits nodes level by level from top to bottom, which is naturally implemented using a FIFO queue."
    },
    {
        "id": 83,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the balance factor of a node in an AVL Tree?",
        "option_a": "Height of left subtree minus height of right subtree",
        "option_b": "Number of nodes in left subtree minus right subtree",
        "option_c": "Total depth of the node",
        "option_d": "The key value divided by two",
        "correct_option": "A",
        "explanation": "In an AVL tree, the balance factor is defined as Balance = Height(Left) - Height(Right), and must remain in {-1, 0, 1} for every node."
    },
    {
        "id": 84,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What tree rotation is performed to rebalance an AVL node with a balance factor of +2 whose left child has a balance factor of -1?",
        "option_a": "Single Left Rotation",
        "option_b": "Single Right Rotation",
        "option_c": "Left-Right Double Rotation",
        "option_d": "Right-Left Double Rotation",
        "correct_option": "C",
        "explanation": "A +2 balance factor on the node and -1 on its left child represents a Left-Right imbalance, resolved by rotating left on the child, then right on the node."
    },
    {
        "id": 85,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the maximum number of nodes in a binary tree of height h (where a root-only tree has height 0)?",
        "option_a": "2^h",
        "option_b": "2^(h+1) - 1",
        "option_c": "2 * h",
        "option_d": "h^2",
        "correct_option": "B",
        "explanation": "A complete binary tree of height h has 1 + 2 + 4 + ... + 2^h = 2^(h+1) - 1 total nodes."
    },
    {
        "id": 86,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the space complexity of an in-order traversal of a balanced BST with n nodes?",
        "option_a": "O(1)",
        "option_b": "O(log n) call stack space",
        "option_c": "O(n^2)",
        "option_d": "O(n log n)",
        "correct_option": "B",
        "explanation": "The recursion call stack depth equals the height of the tree, which is O(log n) for a balanced BST and O(n) in the worst-case skewed tree."
    },
    {
        "id": 87,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "How can you verify whether an arbitrary binary tree is a valid Binary Search Tree?",
        "option_a": "Check if each node is greater than its immediate left child and smaller than its immediate right child",
        "option_b": "Perform a top-down traversal passing valid min and max range constraints (lower_bound < node.val < upper_bound) to each subtree",
        "option_c": "Count the number of leaves in the tree",
        "option_d": "Verify that the root key is positive",
        "correct_option": "B",
        "explanation": "Checking only immediate children is insufficient; every node must satisfy universal bounds inherited from all ancestral decisions in the tree."
    },
    {
        "id": 88,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "How is the Lowest Common Ancestor (LCA) of two keys u and v found efficiently in a BST?",
        "option_a": "Traverse from root; the first node whose value lies between u and v (u <= curr <= v) is the LCA",
        "option_b": "Compute all leaf nodes and hash them",
        "option_c": "Sort all keys using quicksort",
        "option_d": "Delete both nodes and reconstruct the tree",
        "correct_option": "A",
        "explanation": "Because of the BST ordering property, starting from root, if both u and v are smaller, move left; if both greater, move right; otherwise the current node is the split point (LCA)."
    },
    {
        "id": 89,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the time complexity to construct a balanced BST from a sorted array of n elements?",
        "option_a": "O(1)",
        "option_b": "O(n)",
        "option_c": "O(n^2)",
        "option_d": "O(2^n)",
        "correct_option": "B",
        "explanation": "By recursively picking the middle element as root and dividing the array into halves, a balanced BST can be built in linear O(n) time."
    },
    {
        "id": 90,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "Which traversal order is most suitable for creating an exact copy or serialization of a BST?",
        "option_a": "Post-order traversal",
        "option_b": "Pre-order traversal",
        "option_c": "In-order traversal",
        "option_d": "Reverse in-order traversal",
        "correct_option": "B",
        "explanation": "Pre-order traversal (Root, Left, Right) stores parent nodes before their children, allowing deterministic reconstruction of the original tree structure."
    },
    {
        "id": 91,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "Which traversal order is commonly used to delete or free all nodes in a binary tree from memory in C/C++?",
        "option_a": "Pre-order traversal",
        "option_b": "In-order traversal",
        "option_c": "Post-order traversal",
        "option_d": "Level-order traversal",
        "correct_option": "C",
        "explanation": "Post-order traversal (Left, Right, Root) processes both children before the parent, ensuring subtrees are safely deallocated before their parent pointer is freed."
    },
    {
        "id": 92,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "How can you find the k-th smallest element in a BST in O(h + k) time?",
        "option_a": "Perform an iterative in-order traversal using a stack, stopping at the k-th visited node",
        "option_b": "Search for the root key k times",
        "option_c": "Sort the tree nodes using bubble sort",
        "option_d": "Perform a breadth-first search and return the k-th queue item",
        "correct_option": "A",
        "explanation": "Since in-order traversal visits nodes in ascending sorted order, the k-th node processed during an in-order traversal is the k-th smallest element."
    },
    {
        "id": 93,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "Where is the minimum key always located in a non-empty Binary Search Tree?",
        "option_a": "At the root node",
        "option_b": "At the leftmost node reachable by repeatedly following left child pointers",
        "option_c": "At the rightmost leaf node",
        "option_d": "At height h/2",
        "correct_option": "B",
        "explanation": "By the BST property, any smaller value is in the left subtree; therefore, following left pointers until no left child remains yields the minimum key."
    },
    {
        "id": 94,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What are the color properties of a Red-Black Tree?",
        "option_a": "Root is black, red nodes cannot have red children, and every path from root to leaf has the same number of black nodes",
        "option_b": "All nodes on even levels are red, odd levels are black",
        "option_c": "Leaves are always red and root is always red",
        "option_d": "Every node must have exactly two black children",
        "correct_option": "A",
        "explanation": "The Red-Black Tree invariants enforce that the root is black, no two consecutive red nodes appear along any path, and all root-to-null paths contain identical black counts."
    },
    {
        "id": 95,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the maximum height of a Red-Black tree with n nodes?",
        "option_a": "2 * log2(n + 1)",
        "option_b": "n",
        "option_c": "sqrt(n)",
        "option_d": "log2(n) / 2",
        "correct_option": "A",
        "explanation": "Because no path can have two consecutive red nodes and all paths share the same black-height, the longest path is at most twice the shortest, bounding height to 2*log2(n+1)."
    },
    {
        "id": 96,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is a Splay Tree?",
        "option_a": "A static read-only binary tree",
        "option_b": "A self-adjusting BST where recently accessed elements are rotated to the root using splaying operations",
        "option_c": "A tree with exactly 3 children per node",
        "option_d": "A tree where all leaves reside on level 1",
        "correct_option": "B",
        "explanation": "Splay trees perform tree rotations (zig, zig-zig, zig-zag) to move any accessed or inserted node to the root, achieving O(log n) amortized time per operation."
    },
    {
        "id": 97,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "In a full binary tree with L leaves, how many internal nodes (nodes with 2 children) are there?",
        "option_a": "L - 1",
        "option_b": "L + 1",
        "option_c": "2 * L",
        "option_d": "L / 2",
        "correct_option": "A",
        "explanation": "In any strictly binary (full) tree where every node has 0 or 2 children, the number of internal nodes is always exactly L - 1."
    },
    {
        "id": 98,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the difference between a complete binary tree and a full binary tree?",
        "option_a": "Complete fills all levels completely except possibly the last level (filled left to right); Full requires every node to have 0 or 2 children",
        "option_b": "Full trees must have height < 3",
        "option_c": "Complete trees have all red nodes",
        "option_d": "They are completely identical terms",
        "correct_option": "A",
        "explanation": "A complete binary tree has every level completely filled except possibly the last, which is filled from left to right; a full tree requires every node to have 0 or 2 children."
    },
    {
        "id": 99,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "If keys [1, 2, 3, 4, 5] are inserted into an empty standard BST in that exact order, what does the tree resemble?",
        "option_a": "A perfectly balanced AVL tree",
        "option_b": "A right-skewed linked list of height 4",
        "option_c": "A complete binary tree of height 2",
        "option_d": "An inverted heap",
        "correct_option": "B",
        "explanation": "Inserting strictly ascending keys into an unbalancing BST creates a degenerated right-skewed list where every node has only a right child and height equals n - 1."
    },
    {
        "id": 100,
        "topic_id": 4,
        "topic_title": "Binary Search Trees",
        "question_text": "What is the worst-case number of tree rotations needed during an insertion in an AVL tree?",
        "option_a": "O(n)",
        "option_b": "At most 2 rotations (one single or one double rotation)",
        "option_c": "O(log n) rotations",
        "option_d": "Zero rotations",
        "correct_option": "B",
        "explanation": "Rebalancing an AVL tree after an insertion requires rebalancing the lowest unbalanced ancestor, which takes at most one single or double rotation (O(1) rotations)."
    },
    {
        "id": 101,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is the time complexity of solving the 0/1 Knapsack problem with n items and capacity W using Dynamic Programming?",
        "option_a": "O(n log n)",
        "option_b": "O(2^n)",
        "option_c": "O(n * W) pseudo-polynomial",
        "option_d": "O(W^2)",
        "correct_option": "C",
        "explanation": "The DP table requires computing subproblems for n items and capacities 0..W, giving an O(n*W) pseudo-polynomial runtime."
    },
    {
        "id": 102,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "Why is the Fractional Knapsack problem solvable using a Greedy algorithm, whereas 0/1 Knapsack is not?",
        "option_a": "Items can be divided into fractions, so sorting by value-to-weight ratio guarantees optimal local choices lead to the global optimum",
        "option_b": "Fractional knapsack has no capacity limit",
        "option_c": "0/1 knapsack has negative values",
        "option_d": "Greedy algorithms cannot sort items",
        "correct_option": "A",
        "explanation": "Because items can be broken down, greedily choosing items with highest value-per-unit-weight until capacity fills is guaranteed to achieve maximum value."
    },
    {
        "id": 103,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "In the standard 2D DP formulation of 0/1 Knapsack, what does dp[i][w] represent?",
        "option_a": "The maximum value attainable using a subset of the first i items with a total weight capacity of w",
        "option_b": "The minimum weight needed to achieve profit i",
        "option_c": "The number of ways to pack exactly w items",
        "option_d": "The remaining capacity after packing item i",
        "correct_option": "A",
        "explanation": "dp[i][w] stores the optimal solution to the subproblem considering the first i items under maximum allowable weight w."
    },
    {
        "id": 104,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is the recurrence relation for the 0/1 Knapsack DP state when weight[i-1] <= w?",
        "option_a": "dp[i][w] = dp[i-1][w] + value[i-1]",
        "option_b": "dp[i][w] = max(dp[i-1][w], value[i-1] + dp[i-1][w - weight[i-1]])",
        "option_c": "dp[i][w] = min(dp[i-1][w], dp[i][w - weight[i-1]])",
        "option_d": "dp[i][w] = value[i-1] * dp[i-1][w]",
        "correct_option": "B",
        "explanation": "We either exclude item i (giving dp[i-1][w]) or include item i (gaining value[i-1] plus optimal value from remaining capacity dp[i-1][w - weight[i-1]])."
    },
    {
        "id": 105,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "When optimizing 0/1 Knapsack space complexity from O(n * W) to O(W) using a 1D array, in what direction must the capacity loop run?",
        "option_a": "Forward from 0 up to W",
        "option_b": "Backwards from W down to weight[i]",
        "option_c": "In random order",
        "option_d": "Only over even capacity values",
        "correct_option": "B",
        "explanation": "Iterating backwards from W down to weight[i] ensures each item is used at most once, as dp[w - weight[i]] still holds the value from the previous item iteration."
    },
    {
        "id": 106,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What happens if you iterate the capacity loop forwards from weight[i] to W in a 1D DP knapsack array?",
        "option_a": "It solves the 0/1 Knapsack problem faster",
        "option_b": "It solves the Unbounded Knapsack problem where items can be reused an unlimited number of times",
        "option_c": "The array will overflow its memory buffer",
        "option_d": "The result will always be zero",
        "correct_option": "B",
        "explanation": "Iterating forward allows the current item to be added repeatedly into already updated states of the same item, which correctly models the Unbounded Knapsack problem."
    },
    {
        "id": 107,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "Why is the time complexity O(n * W) classified as 'pseudo-polynomial' rather than strictly polynomial?",
        "option_a": "W is numeric; the length of the input representation of W is log2(W) bits, meaning runtime is exponential in input size",
        "option_b": "The algorithm uses nested while loops",
        "option_c": "It only works on integer inputs",
        "option_d": "The memory space is non-linear",
        "correct_option": "A",
        "explanation": "Polynomial time is measured against the bit length of inputs. Since representing integer W takes k = log2(W) bits, O(n * 2^k) is exponential in the input bit length."
    },
    {
        "id": 108,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "How are the specific items included in the optimal 0/1 knapsack solution recovered from a 2D DP table?",
        "option_a": "Backtracking from dp[n][W]: if dp[i][w] != dp[i-1][w], item i was included; subtract weight[i-1] from w and decrement i",
        "option_b": "Take the items with the largest values",
        "option_c": "Re-run the algorithm in reverse order",
        "option_d": "Sort items alphabetically",
        "correct_option": "A",
        "explanation": "By comparing dp[i][w] with dp[i-1][w], if the values differ, item i must have been selected, so we record item i and step back to capacity w - weight[i-1]."
    },
    {
        "id": 109,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "How can the Subset Sum problem be solved using the 0/1 Knapsack DP approach?",
        "option_a": "Set each item's value equal to its weight, with capacity equal to target sum S; check if max value equals S",
        "option_b": "Use depth-first search on a directed graph",
        "option_c": "Multiply all weights by -1",
        "option_d": "Divide target sum by the median item weight",
        "correct_option": "A",
        "explanation": "Subset Sum is a direct reduction of 0/1 Knapsack where item value equals item weight; if max value for capacity S equals S, a subset summing to S exists."
    },
    {
        "id": 110,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "In the Partition Equal Subset Sum problem, what is the target knapsack capacity for an array with total sum S?",
        "option_a": "S",
        "option_b": "S / 2 (only if S is even)",
        "option_c": "S * 2",
        "option_d": "sqrt(S)",
        "correct_option": "B",
        "explanation": "To partition an array into two subsets with equal sums, the total sum S must be even, and each subset must sum to exactly S / 2."
    },
    {
        "id": 111,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What two key properties must an optimization problem exhibit to be solvable using Dynamic Programming?",
        "option_a": "Greedy choice property and polynomial bounds",
        "option_b": "Optimal Substructure and Overlapping Subproblems",
        "option_c": "Linear independence and convexity",
        "option_d": "Divide-and-conquer and divide-and-sort",
        "correct_option": "B",
        "explanation": "DP applies when an optimal solution to the problem contains optimal solutions to subproblems (optimal substructure) and subproblems recur repeatedly (overlapping subproblems)."
    },
    {
        "id": 112,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is the difference between Memoization (Top-Down) and Tabulation (Bottom-Up)?",
        "option_a": "Memoization uses recursion with a lookup cache; Tabulation iteratively fills a table starting from base cases",
        "option_b": "Tabulation is always O(1) space",
        "option_c": "Memoization cannot solve 0/1 Knapsack",
        "option_d": "Tabulation uses binary search trees",
        "correct_option": "A",
        "explanation": "Top-down memoization explores subproblems recursively on demand, caching results; bottom-up tabulation solves all subproblems in topological order without recursion overhead."
    },
    {
        "id": 113,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "In the Bounded Knapsack Problem, what additional constraint is placed on each item?",
        "option_a": "Each item has a specified maximum available quantity c_i",
        "option_b": "Items can only have prime weights",
        "option_c": "Capacity W must be a power of two",
        "option_d": "Values must be proportional to weights",
        "correct_option": "A",
        "explanation": "In Bounded Knapsack, each item type i has a fixed integer supply count c_i, lying between 0/1 (c_i=1) and Unbounded (c_i=infinity)."
    },
    {
        "id": 114,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "How can the Bounded Knapsack problem be optimized using binary splitting of item counts?",
        "option_a": "Split quantity c_i into powers of two (1, 2, 4, ..., remainder), transforming it into 0/1 Knapsack with O(log c_i) items per type",
        "option_b": "Convert item weights to floating point numbers",
        "option_c": "Use binary search trees to index items",
        "option_d": "Sort items using binary radix sort",
        "correct_option": "A",
        "explanation": "Binary splitting bundles item counts into chunks of size 1, 2, 4, 8... Any quantity up to c_i can be uniquely formed by a combination of these chunks in O(log c_i) items."
    },
    {
        "id": 115,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is the base case initialization for the 2D array dp[n+1][W+1] in 0/1 Knapsack?",
        "option_a": "dp[0][w] = 0 for all w, and dp[i][0] = 0 for all i",
        "option_b": "dp[i][w] = infinity for all cells",
        "option_c": "dp[0][0] = 1, all others 0",
        "option_d": "dp[i][w] = -1",
        "correct_option": "A",
        "explanation": "With 0 items available or with 0 capacity, the maximum attainable value is 0, initializing row 0 and column 0 to zero."
    },
    {
        "id": 116,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "When total capacity W is extremely large (e.g., W = 10^12) but n is small (n <= 40), what algorithm is preferred over DP?",
        "option_a": "Meet-in-the-Middle (divide into two subsets of size n/2 and use binary search) in O(2^(n/2) * n)",
        "option_b": "Greedy sorting by weight",
        "option_c": "Breadth-first search on a matrix",
        "option_d": "Standard 2D array tabulation",
        "correct_option": "A",
        "explanation": "When W is too large for an array, split n items into two halves of size n/2, generate all 2^(n/2) subset combinations, sort one half, and use binary search in O(n * 2^(n/2)) time."
    },
    {
        "id": 117,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What does the Target Sum problem ask, and how is it related to 0/1 Knapsack?",
        "option_a": "Assign + or - signs to elements to reach target S; reduces to finding a subset summing to (TotalSum + S) / 2",
        "option_b": "Find the maximum product of any pair of items",
        "option_c": "Find the target weight that minimizes wasted capacity",
        "option_d": "Sort numbers in ascending order",
        "correct_option": "A",
        "explanation": "Let P be positive elements and N be negative; P - N = S and P + N = TotalSum; adding equations yields 2P = TotalSum + S, reducing it to Subset Sum."
    },
    {
        "id": 118,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is the space complexity of solving 0/1 Knapsack using a 1D DP array of size W + 1?",
        "option_a": "O(1)",
        "option_b": "O(W)",
        "option_c": "O(n * W)",
        "option_d": "O(n)",
        "correct_option": "B",
        "explanation": "By updating a single array of size W + 1 in reverse order, auxiliary memory is reduced to O(W) space."
    },
    {
        "id": 119,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is an FPTAS (Fully Polynomial Time Approximation Scheme) for 0/1 Knapsack?",
        "option_a": "An algorithm that finds a solution within (1 - epsilon) of the optimal value in time polynomial in n and 1/epsilon",
        "option_b": "An exact algorithm running in O(n) time",
        "option_c": "A greedy heuristic with no worst-case guarantees",
        "option_d": "A randomized Monte Carlo method",
        "correct_option": "A",
        "explanation": "An FPTAS rescales and rounds item values by a factor related to epsilon, running a DP on values rather than weights in O(n^3 / epsilon) polynomial time."
    },
    {
        "id": 120,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "In 0/1 Knapsack, if an item's weight is strictly greater than the current capacity w, what is the state transition?",
        "option_a": "dp[i][w] = dp[i-1][w] (the item cannot be included)",
        "option_b": "dp[i][w] = dp[i][w-1]",
        "option_c": "dp[i][w] = 0",
        "option_d": "dp[i][w] = value[i-1]",
        "correct_option": "A",
        "explanation": "If item i is too heavy to fit into capacity w, our only choice is to exclude it, inheriting the optimal value from dp[i-1][w]."
    },
    {
        "id": 121,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "How is the Minimum Subset Sum Difference problem solved using 0/1 Knapsack?",
        "option_a": "Compute subset sum reachability up to TotalSum/2; find the largest reachable sum s <= TotalSum/2; answer is TotalSum - 2*s",
        "option_b": "Take the difference between the two largest elements",
        "option_c": "Sort the array and take adjacent differences",
        "option_d": "Multiply all elements together",
        "correct_option": "A",
        "explanation": "If we find the reachable subset sum s closest to TotalSum/2, the other subset will sum to TotalSum - s, minimizing their difference to (TotalSum - s) - s = TotalSum - 2*s."
    },
    {
        "id": 122,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What is the Coin Change 2 problem (number of ways to make amount A with infinite coins of given denominations)?",
        "option_a": "A variation of Unbounded Knapsack counting combinations using 1D DP iterating forward: dp[w] += dp[w - coin]",
        "option_b": "A Fractional Knapsack problem",
        "option_c": "A graph shortest path problem",
        "option_d": "A divide-and-conquer problem",
        "correct_option": "A",
        "explanation": "Coin Change 2 counts the total number of ways to make amount A with unlimited coin uses, solved by iterating coins on the outer loop and capacities forward."
    },
    {
        "id": 123,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "Can the 0/1 Knapsack problem be solved in polynomial time if all item weights and capacity W are rational numbers?",
        "option_a": "Yes, using simple floating-point indices",
        "option_b": "No, unless P = NP; the problem is NP-complete",
        "option_c": "Yes, using linear programming directly",
        "option_d": "Yes, by rounding all numbers to integers",
        "correct_option": "B",
        "explanation": "The 0/1 Knapsack problem is NP-complete; no known algorithm can solve all arbitrary instances in polynomial time unless P = NP."
    },
    {
        "id": 124,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "Why does the greedy choice of picking the highest-value item first fail for 0/1 Knapsack?",
        "option_a": "A high-value item may have disproportionately large weight, blocking combinations of smaller items that together yield higher total value",
        "option_b": "Greedy algorithms cannot compare values",
        "option_c": "Items with high values have negative weights",
        "option_d": "Sorting items is an NP-hard problem",
        "correct_option": "A",
        "explanation": "For example, with capacity 10, an item of value 60 and weight 10 blocks two items of value 50 and weight 5 each (total value 100)."
    },
    {
        "id": 125,
        "topic_id": 5,
        "topic_title": "Dynamic Programming: Knapsack",
        "question_text": "What data structure can be used to optimize the Bounded Knapsack problem to O(n * W) without binary splitting?",
        "option_a": "Monotonic Queue / Deque optimization over remainder equivalence classes (w mod weight[i])",
        "option_b": "Red-Black Tree",
        "option_c": "Disjoint Set Union (DSU)",
        "option_d": "Min-Heap",
        "correct_option": "A",
        "explanation": "By grouping capacities by their remainder modulo weight[i], the transition forms a sliding window maximum problem solvable in O(n*W) using a monotonic deque."
    },
    {
        "id": 126,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What fundamental data structure is used to manage the frontier of vertices in Breadth-First Search (BFS)?",
        "option_a": "First-In-First-Out (FIFO) Queue",
        "option_b": "Last-In-First-Out (LIFO) Stack",
        "option_c": "Priority Queue (Min-Heap)",
        "option_d": "Hash Set only",
        "correct_option": "A",
        "explanation": "BFS explores vertices level by level, requiring a FIFO queue to process vertices in the exact order they were discovered."
    },
    {
        "id": 127,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the time complexity of BFS on a graph represented with an Adjacency List (V vertices, E edges)?",
        "option_a": "O(V + E)",
        "option_b": "O(V * E)",
        "option_c": "O(V^2)",
        "option_d": "O(log V)",
        "correct_option": "A",
        "explanation": "Every vertex is enqueued at most once (O(V)), and every edge is examined at most twice in undirected graphs or once in directed graphs (O(E)), giving O(V + E)."
    },
    {
        "id": 128,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the time complexity of BFS if the graph is represented using an Adjacency Matrix?",
        "option_a": "O(V + E)",
        "option_b": "O(V^2)",
        "option_c": "O(E * log V)",
        "option_d": "O(V^3)",
        "correct_option": "B",
        "explanation": "For each dequeued vertex, checking for adjacent vertices requires scanning an entire row of length V in the adjacency matrix, resulting in O(V^2) total runtime."
    },
    {
        "id": 129,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "Why is BFS guaranteed to find the shortest path between two vertices in an unweighted graph?",
        "option_a": "It visits all vertices at distance d before any vertex at distance d + 1",
        "option_b": "It sorts edge weights in ascending order",
        "option_c": "It uses Dijkstra's greedy edge relaxation",
        "option_d": "It backtracks whenever a cycle is detected",
        "correct_option": "A",
        "explanation": "Because vertices are discovered in non-decreasing order of their distance from the source, the first time a target vertex is dequeued, its recorded distance is optimal."
    },
    {
        "id": 130,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the purpose of the 'visited' set or boolean array in BFS?",
        "option_a": "To count the total number of edges",
        "option_b": "To prevent infinite loops and redundant processing caused by cycles",
        "option_c": "To store the shortest path weights",
        "option_d": "To sort vertices in topological order",
        "correct_option": "B",
        "explanation": "In graphs with cycles, an unvisited check ensures vertices are not re-enqueued, avoiding infinite loops and maintaining O(V + E) complexity."
    },
    {
        "id": 131,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How can BFS be used to determine if an undirected graph is Bipartite (2-colorable)?",
        "option_a": "Color the source node Red; for every explored neighbor, assign the opposite color; if an adjacent neighbor already has the same color, it is not bipartite",
        "option_b": "Check if the number of edges is even",
        "option_c": "Verify that all vertices have degree >= 2",
        "option_d": "Check if the graph is a complete clique",
        "correct_option": "A",
        "explanation": "A graph is bipartite if and only if it contains no odd-length cycles; BFS 2-coloring detects odd cycles the moment two adjacent nodes share the same color."
    },
    {
        "id": 132,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How is cycle detection implemented in an undirected graph using BFS?",
        "option_a": "If a neighbor is already visited and is NOT the parent of the current node, a cycle exists",
        "option_b": "If the queue becomes empty before visiting all vertices",
        "option_c": "If all edge weights are positive",
        "option_d": "If the graph has more vertices than edges",
        "correct_option": "A",
        "explanation": "In an undirected graph, encountering an already visited neighbor that is not the immediate predecessor (parent) indicates an alternative path closing a cycle."
    },
    {
        "id": 133,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is Kahn's algorithm for Topological Sorting of a Directed Acyclic Graph (DAG)?",
        "option_a": "BFS starting from all vertices with in-degree 0, decrementing neighbors' in-degrees as vertices are removed",
        "option_b": "DFS with post-order reversal",
        "option_c": "Greedy edge deletion by weight",
        "option_d": "A priority queue over out-degrees",
        "correct_option": "A",
        "explanation": "Kahn's algorithm enqueues all vertices with in-degree 0; as each is processed, it removes outgoing edges and enqueues any neighbor whose in-degree drops to 0."
    },
    {
        "id": 134,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How can the number of connected components in an undirected graph be determined using BFS?",
        "option_a": "Iterate over all vertices 1..V; whenever an unvisited vertex is found, increment component count and launch a full BFS",
        "option_b": "Count the number of leaves in the BFS tree",
        "option_c": "Divide total edges by total vertices",
        "option_d": "Multiply the degrees of all vertices",
        "correct_option": "A",
        "explanation": "Each BFS traversal initiated from an unvisited vertex completely covers one connected component; repeating for all unvisited vertices counts all components."
    },
    {
        "id": 135,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is Multi-Source BFS, and what is a classic use case?",
        "option_a": "Enqueue multiple starting vertices simultaneously at distance 0; used to find the shortest distance from every cell in a grid to the nearest facility/source",
        "option_b": "Running BFS sequentially on multiple threads without sharing memory",
        "option_c": "A BFS that visits multiple edges in parallel",
        "option_d": "A method for sorting vertices with multiple keys",
        "correct_option": "A",
        "explanation": "By seeding the queue with all source nodes at t=0, multi-source BFS expands outward uniformly, finding the distance to the closest source for every node in O(V + E)."
    },
    {
        "id": 136,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How can the exact shortest path vertices from source s to destination t be reconstructed after running BFS?",
        "option_a": "Maintain a parent array: parent[neighbor] = current when discovering nodes; backtrack from t to s using parent pointers",
        "option_b": "Re-run BFS from all neighbors of t",
        "option_c": "Sort vertices by degree",
        "option_d": "Reverse the visited boolean array",
        "correct_option": "A",
        "explanation": "Recording the predecessor that discovered each node allows reconstructing the unique shortest path by following parent pointers backward from destination to source."
    },
    {
        "id": 137,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What algorithm finds the shortest path on graphs where edge weights are strictly 0 or 1?",
        "option_a": "Dijkstra's algorithm with a Fibonacci heap",
        "option_b": "0-1 BFS using a Double-Ended Queue (Deque): push 0-weight edges to front, 1-weight edges to back",
        "option_c": "Bellman-Ford algorithm",
        "option_d": "Floyd-Warshall algorithm",
        "correct_option": "B",
        "explanation": "0-1 BFS maintains distance monotonicity in O(V + E) by adding 0-weight transitions to the front of a deque and 1-weight transitions to the back."
    },
    {
        "id": 138,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the space complexity of BFS in the worst case?",
        "option_a": "O(1)",
        "option_b": "O(V)",
        "option_c": "O(E^2)",
        "option_d": "O(log V)",
        "correct_option": "B",
        "explanation": "In the worst case (e.g., a star graph where the root connects to all V - 1 nodes), the queue holds up to V - 1 vertices, requiring O(V) auxiliary memory."
    },
    {
        "id": 139,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "Why is Bidirectional BFS significantly faster than standard unidirectional BFS for point-to-point shortest paths?",
        "option_a": "It reduces search space from O(b^d) to O(b^(d/2) + b^(d/2)), where b is branching factor and d is distance",
        "option_b": "It eliminates the need for a queue",
        "option_c": "It works on negative edge weights",
        "option_d": "It computes all-pairs shortest paths in O(V)",
        "correct_option": "A",
        "explanation": "Running two simultaneous BFS searches\u2014one forward from start and one backward from target\u2014stops when frontiers meet, drastically reducing explored nodes."
    },
    {
        "id": 140,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How is the diameter of an unweighted tree found using two BFS runs?",
        "option_a": "Run BFS from arbitrary node u to find farthest node v; run second BFS from v to find farthest node w; distance(v, w) is the diameter",
        "option_b": "Run BFS from the root and count total leaves",
        "option_c": "Multiply the maximum depth by two",
        "option_d": "Find the node with the highest degree",
        "correct_option": "A",
        "explanation": "In any tree, the farthest node from any arbitrary starting node is guaranteed to be one endpoint of a diameter; a second BFS from that endpoint finds the other."
    },
    {
        "id": 141,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What type of edges exist in a BFS tree constructed from an undirected graph?",
        "option_a": "Tree edges and Cross edges only (no back edges to ancestors above the parent)",
        "option_b": "Tree edges and Forward edges only",
        "option_c": "Back edges only",
        "option_d": "Bidirectional cycle edges only",
        "correct_option": "A",
        "explanation": "In an undirected BFS tree, every non-tree edge connects vertices in the same level or adjacent levels (cross edges); it can never skip a level back to an ancestor."
    },
    {
        "id": 142,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How is the Flood Fill algorithm on a 2D grid (e.g., bucket fill in paint programs) implemented using BFS?",
        "option_a": "Enqueue starting coordinate (r, c); pop, recolor, and enqueue all 4-directionally adjacent cells matching the original color",
        "option_b": "Compute the eigenvalues of the pixel grid",
        "option_c": "Sort pixels by RGB intensity",
        "option_d": "Invert the image using matrix transposition",
        "correct_option": "A",
        "explanation": "Flood fill models the pixel grid as a graph where cells are vertices and adjacent matching-color cells share edges; BFS traverses and recolors the connected region."
    },
    {
        "id": 143,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "Why can standard BFS fail to find the shortest path in graphs with positive non-uniform edge weights (e.g., weights 2, 5, 10)?",
        "option_a": "A path with fewer edges may have a larger total weight than a path with more edges but smaller weights",
        "option_b": "BFS cannot traverse directed edges",
        "option_c": "BFS queues cannot store integers greater than 1",
        "option_d": "Cycles become impossible to detect",
        "correct_option": "A",
        "explanation": "BFS measures path length by the number of hops (edges). An edge with weight 10 counts as 1 hop, which BFS prioritizes over two edges of weight 1 (2 hops)."
    },
    {
        "id": 144,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "In a directed graph, what does it indicate if Kahn's algorithm terminates with fewer than V vertices in the topological order?",
        "option_a": "The graph is strongly connected",
        "option_b": "The graph contains at least one directed cycle (is not a DAG)",
        "option_c": "The graph has no sink vertices",
        "option_d": "The graph is bipartite",
        "correct_option": "B",
        "explanation": "Vertices belonging to a directed cycle never reach in-degree 0; if Kahn's algorithm processes fewer than V vertices, a cycle prevented completion."
    },
    {
        "id": 145,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the maximum branching factor b in a 2D grid graph with 4-directional movement (up, down, left, right)?",
        "option_a": "b = 2",
        "option_b": "b = 4",
        "option_c": "b = 8",
        "option_d": "b = 1",
        "correct_option": "B",
        "explanation": "From any internal cell on a 2D grid, a node can transition to at most 4 cardinal neighbors (North, South, East, West)."
    },
    {
        "id": 146,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "How can BFS be used to solve the Word Ladder problem (transform word A to word B changing one letter at a time through a valid dictionary)?",
        "option_a": "Treat words as vertices with edges between words differing by 1 letter; BFS finds the minimum number of transformations",
        "option_b": "Sort dictionary words alphabetically and binary search",
        "option_c": "Compute the Levenshtein distance matrix using dynamic programming",
        "option_d": "Use greedy longest common subsequence matching",
        "correct_option": "A",
        "explanation": "By treating single-character substitutions as unweighted edges in an implicit graph, BFS guarantees finding the transformation sequence with fewest steps."
    },
    {
        "id": 147,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "In a graph with V vertices, what is the maximum possible height of a BFS tree?",
        "option_a": "V - 1",
        "option_b": "log2(V)",
        "option_c": "V^2",
        "option_d": "V / 2",
        "correct_option": "A",
        "explanation": "In a simple path graph (a linear chain of V vertices: v1 - v2 - ... - vV), the BFS tree from v1 has height V - 1."
    },
    {
        "id": 148,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the difference between Breadth-First Search and Depth-First Search regarding memory consumption on deep, wide trees?",
        "option_a": "BFS memory is proportional to maximum width (frontier); DFS memory is proportional to maximum depth (call stack)",
        "option_b": "BFS uses O(1) memory; DFS uses O(V^2)",
        "option_c": "DFS always consumes more memory than BFS",
        "option_d": "There is no difference in memory usage",
        "correct_option": "A",
        "explanation": "BFS maintains all nodes at the current depth in a queue (O(branching_factor^depth)); DFS maintains only the active path from root to leaf in its call stack (O(depth))."
    },
    {
        "id": 149,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "When discovering vertex v from vertex u in BFS, when should v be marked as visited?",
        "option_a": "Immediately when v is enqueued into the queue",
        "option_b": "Only after v is dequeued from the queue",
        "option_c": "When all neighbors of v have been explored",
        "option_d": "After the BFS search completely finishes",
        "correct_option": "A",
        "explanation": "Marking v as visited immediately upon enqueuing prevents duplicate entries of v from being added to the queue by other neighbors in the same level."
    },
    {
        "id": 150,
        "topic_id": 6,
        "topic_title": "Graph Breadth-First Search",
        "question_text": "What is the relationship between Breadth-First Search and Dijkstra's Algorithm?",
        "option_a": "Dijkstra's algorithm is a generalization of BFS that uses a Priority Queue instead of a FIFO queue for arbitrary positive edge weights",
        "option_b": "They are completely unrelated algorithms",
        "option_c": "BFS works on negative weights while Dijkstra does not",
        "option_d": "Dijkstra visits nodes in random order",
        "correct_option": "A",
        "explanation": "When all edge weights are identical (e.g., 1), a min-priority queue behaves identically to a FIFO queue, making BFS a special case of Dijkstra's algorithm."
    },
    {
        "id": 151,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "For a square matrix A, what scalar lambda satisfies A*v = lambda*v for non-zero vector v?",
        "option_a": "Determinant",
        "option_b": "Trace",
        "option_c": "Eigenvalue",
        "option_d": "Singular Value",
        "correct_option": "C",
        "explanation": "Lambda is the eigenvalue corresponding to eigenvector v, scaling v without altering its directional span in vector space."
    },
    {
        "id": 152,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What polynomial equation is solved to find the eigenvalues of an n x n matrix A?",
        "option_a": "det(A - lambda * I) = 0",
        "option_b": "trace(A) * lambda = 0",
        "option_c": "A^T * A = lambda * I",
        "option_d": "det(A) + lambda = 0",
        "correct_option": "A",
        "explanation": "The characteristic equation det(A - lambda*I) = 0 yields the roots lambda that allow non-trivial nullspace solutions (A - lambda*I)v = 0."
    },
    {
        "id": 153,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is the relationship between the trace of a square matrix and its eigenvalues?",
        "option_a": "The trace equals the product of all eigenvalues",
        "option_b": "The trace equals the sum of all eigenvalues",
        "option_c": "The trace equals the largest eigenvalue",
        "option_d": "The trace equals the reciprocal of eigenvalues",
        "correct_option": "B",
        "explanation": "The trace (sum of main diagonal entries) of any square matrix is mathematically identical to the sum of all its eigenvalues counted with algebraic multiplicity."
    },
    {
        "id": 154,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is the relationship between the determinant of a square matrix and its eigenvalues?",
        "option_a": "The determinant equals the sum of all eigenvalues",
        "option_b": "The determinant equals the product of all eigenvalues",
        "option_c": "The determinant equals the square of the trace",
        "option_d": "The determinant is independent of eigenvalues",
        "correct_option": "B",
        "explanation": "The determinant of matrix A equals the product of all its eigenvalues: det(A) = lambda_1 * lambda_2 * ... * lambda_n."
    },
    {
        "id": 155,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What are the eigenvalues of an upper triangular or lower triangular matrix?",
        "option_a": "All zeros",
        "option_b": "The entries along the main diagonal",
        "option_c": "The sum of each column",
        "option_d": "The reciprocal of the diagonal entries",
        "correct_option": "B",
        "explanation": "Because the determinant of a triangular matrix (A - lambda*I) is the product of its diagonal elements (a_ii - lambda), the eigenvalues are precisely the diagonal entries."
    },
    {
        "id": 156,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "If matrix A has eigenvalue lambda with eigenvector v, what is the eigenvalue of A^k for integer k >= 1?",
        "option_a": "k * lambda",
        "option_b": "lambda^k",
        "option_c": "lambda + k",
        "option_d": "lambda / k",
        "correct_option": "B",
        "explanation": "Repeated application of A yields: A^k v = A^(k-1) (A v) = A^(k-1) (lambda v) = lambda^k v, meaning the eigenvalue is lambda^k."
    },
    {
        "id": 157,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "If A is an invertible matrix with eigenvalue lambda, what is an eigenvalue of A^(-1)?",
        "option_a": "-lambda",
        "option_b": "1 / lambda",
        "option_c": "lambda^2",
        "option_d": "1 - lambda",
        "correct_option": "B",
        "explanation": "Multiplying A v = lambda v by A^(-1) gives v = lambda A^(-1) v, which rearranges to A^(-1) v = (1/lambda) v."
    },
    {
        "id": 158,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is guaranteed about the eigenvalues of a real Symmetric matrix (A = A^T)?",
        "option_a": "All eigenvalues are purely imaginary",
        "option_b": "All eigenvalues are guaranteed to be real numbers",
        "option_c": "All eigenvalues must be positive",
        "option_d": "All eigenvalues equal zero",
        "correct_option": "B",
        "explanation": "By the Spectral Theorem, any real symmetric matrix has strictly real eigenvalues and possesses an orthonormal basis of eigenvectors."
    },
    {
        "id": 159,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is guaranteed about eigenvectors corresponding to distinct eigenvalues of a real Symmetric matrix?",
        "option_a": "They are linearly dependent",
        "option_b": "They are mutually orthogonal (dot product equals zero)",
        "option_c": "They have zero magnitude",
        "option_d": "They are parallel",
        "correct_option": "B",
        "explanation": "For symmetric matrices, if lambda_1 != lambda_2, their corresponding eigenvectors v_1 and v_2 satisfy <v_1, v_2> = 0, forming mutually perpendicular axes."
    },
    {
        "id": 160,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "When is an n x n matrix A diagonalizable (A = P D P^(-1))?",
        "option_a": "If and only if A has n linearly independent eigenvectors",
        "option_b": "Only if all diagonal entries are non-zero",
        "option_c": "Only if det(A) = 0",
        "option_d": "Only if A is skew-symmetric",
        "correct_option": "A",
        "explanation": "A matrix can be diagonalized into A = P D P^(-1) if and only if its eigenvectors span R^n, providing n linearly independent columns for matrix P."
    },
    {
        "id": 161,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is the difference between Algebraic Multiplicity and Geometric Multiplicity of an eigenvalue?",
        "option_a": "Algebraic is the multiplicity of the root in the characteristic polynomial; Geometric is the dimension of the eigenspace (nullity of A - lambda*I)",
        "option_b": "Algebraic is always smaller than geometric",
        "option_c": "Geometric multiplicity can exceed n",
        "option_d": "There is no mathematical difference",
        "correct_option": "A",
        "explanation": "Algebraic multiplicity counts how many times (lambda - c) divides the characteristic polynomial; geometric multiplicity is the number of linearly independent eigenvectors."
    },
    {
        "id": 162,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is a 'defective' matrix?",
        "option_a": "A matrix with determinant equal to zero",
        "option_b": "A matrix where the geometric multiplicity of at least one eigenvalue is strictly less than its algebraic multiplicity",
        "option_c": "A matrix with complex entries",
        "option_d": "A matrix with all negative eigenvalues",
        "correct_option": "B",
        "explanation": "A defective matrix lacks a complete set of n linearly independent eigenvectors and therefore cannot be diagonalized."
    },
    {
        "id": 163,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What defines a Positive Definite matrix?",
        "option_a": "A symmetric matrix where x^T A x > 0 for all non-zero vectors x, meaning all eigenvalues are strictly positive",
        "option_b": "A matrix where all entries are positive numbers",
        "option_c": "A matrix with positive trace and negative determinant",
        "option_d": "An orthogonal matrix with determinant +1",
        "correct_option": "A",
        "explanation": "A matrix is positive definite if and only if all its eigenvalues are strictly positive (> 0), ensuring the quadratic form x^T A x is strictly positive for all x != 0."
    },
    {
        "id": 164,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "In Principal Component Analysis (PCA), what do the eigenvectors of the data covariance matrix represent?",
        "option_a": "The principal axes of maximal variance in the dataset",
        "option_b": "The cluster centroids of the data",
        "option_c": "The residual errors of a linear regression",
        "option_d": "The classification labels of the points",
        "correct_option": "A",
        "explanation": "PCA diagonalizes the sample covariance matrix; the eigenvectors point in the orthogonal directions of maximum data variance, sorted by eigenvalue magnitude."
    },
    {
        "id": 165,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What are the eigenvalues of an Orthogonal matrix Q (where Q^T Q = I)?",
        "option_a": "All zeros",
        "option_b": "Complex numbers with absolute value (modulus) equal to 1",
        "option_c": "All strictly real numbers >= 1",
        "option_d": "Purely negative integers",
        "correct_option": "B",
        "explanation": "Because orthogonal transformations preserve vector lengths (||Q v|| = ||v||), any eigenvalue lambda must satisfy |lambda| * ||v|| = ||v||, so |lambda| = 1."
    },
    {
        "id": 166,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What algorithm iteratively computes the dominant (largest magnitude) eigenvalue and eigenvector of a matrix?",
        "option_a": "Power Iteration (Von Mises iteration)",
        "option_b": "Gaussian Elimination",
        "option_c": "Gradient Descent",
        "option_d": "Breadth-First Search",
        "correct_option": "A",
        "explanation": "Power iteration repeatedly multiplies an initial vector by A and normalizes (v_{k+1} = A v_k / ||A v_k||), converging to the eigenvector of the dominant eigenvalue."
    },
    {
        "id": 167,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is the relationship between the singular values sigma_i of matrix A and eigenvalues of A^T A?",
        "option_a": "sigma_i = sqrt(lambda_i(A^T A))",
        "option_b": "sigma_i = lambda_i(A^T A)^2",
        "option_c": "sigma_i = 1 / lambda_i(A^T A)",
        "option_d": "sigma_i = trace(A^T A)",
        "correct_option": "A",
        "explanation": "The singular values of any rectangular matrix A are defined as the non-negative square roots of the eigenvalues of the symmetric matrix A^T A."
    },
    {
        "id": 168,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What are the eigenvalues of a Nilpotent matrix (a matrix where A^k = 0 for some integer k)?",
        "option_a": "All eigenvalues are equal to 0",
        "option_b": "All eigenvalues are equal to 1",
        "option_c": "Eigenvalues are imaginary numbers",
        "option_d": "Eigenvalues cannot be determined",
        "correct_option": "A",
        "explanation": "If A^k = 0, then for any eigenvalue lambda, A^k v = lambda^k v = 0, forcing lambda^k = 0, which means lambda must equal 0."
    },
    {
        "id": 169,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is the Rayleigh Quotient of a symmetric matrix A with non-zero vector x?",
        "option_a": "R(A, x) = (x^T A x) / (x^T x)",
        "option_b": "R(A, x) = trace(A) / det(A)",
        "option_c": "R(A, x) = ||A x||",
        "option_d": "R(A, x) = x^T x",
        "correct_option": "A",
        "explanation": "The Rayleigh quotient R(A, x) = (x^T A x) / (x^T x) reaches its maximum at the largest eigenvalue and minimum at the smallest eigenvalue."
    },
    {
        "id": 170,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "If matrix A has eigenvalues lambda_i, what are the eigenvalues of A + c * I for scalar c?",
        "option_a": "lambda_i + c",
        "option_b": "c * lambda_i",
        "option_c": "lambda_i^c",
        "option_d": "lambda_i - c",
        "correct_option": "A",
        "explanation": "Since (A + c*I) v = A v + c v = lambda v + c v = (lambda + c) v, shifting a matrix by c*I shifts all its eigenvalues by c while preserving eigenvectors."
    },
    {
        "id": 171,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What does the Cayley-Hamilton theorem state about any square matrix A?",
        "option_a": "Every square matrix satisfies its own characteristic equation: p(A) = 0",
        "option_b": "det(A) is always equal to trace(A)",
        "option_c": "All square matrices are symmetric",
        "option_d": "Eigenvalues can be computed in O(1) time",
        "correct_option": "A",
        "explanation": "The Cayley-Hamilton theorem states that substituting matrix A into its own characteristic polynomial p(lambda) = det(A - lambda*I) yields the zero matrix: p(A) = 0."
    },
    {
        "id": 172,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What is the geometric multiplicity of an eigenvalue lambda?",
        "option_a": "The dimension of the nullspace of (A - lambda * I)",
        "option_b": "The power of (lambda - c) in the characteristic polynomial",
        "option_c": "The rank of matrix A",
        "option_d": "The trace of matrix A",
        "correct_option": "A",
        "explanation": "The geometric multiplicity is the maximum number of linearly independent eigenvectors associated with lambda, equal to the nullity of (A - lambda*I)."
    },
    {
        "id": 173,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What are the eigenvalues of a projection matrix P (where P^2 = P)?",
        "option_a": "0 and 1 only",
        "option_b": "-1 and 1 only",
        "option_c": "All real numbers",
        "option_d": "Pure imaginary numbers",
        "correct_option": "A",
        "explanation": "Since P^2 v = P v, we have lambda^2 v = lambda v, which implies lambda^2 = lambda. Hence, lambda must be either 0 or 1."
    },
    {
        "id": 174,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "What does a zero eigenvalue (lambda = 0) imply about matrix A?",
        "option_a": "Matrix A is non-invertible (singular) with determinant equal to 0",
        "option_b": "Matrix A is the identity matrix",
        "option_c": "Matrix A is symmetric",
        "option_d": "Matrix A has rank n",
        "correct_option": "A",
        "explanation": "Since det(A) equals the product of all eigenvalues, if lambda = 0 is an eigenvalue, det(A) = 0, meaning A has a non-trivial nullspace and is not invertible."
    },
    {
        "id": 175,
        "topic_id": 7,
        "topic_title": "Eigenvalues and Eigenvectors",
        "question_text": "How are Markov chain steady-state probability vectors related to eigenvalues?",
        "option_a": "The stationary distribution is the eigenvector corresponding to eigenvalue lambda = 1 of the transition matrix P^T",
        "option_b": "The stationary distribution has eigenvalue 0",
        "option_c": "Markov chains do not have eigenvalues",
        "option_d": "All eigenvalues of transition matrices are greater than 2",
        "correct_option": "A",
        "explanation": "By the Perron-Frobenius theorem, any stochastic transition matrix has a dominant eigenvalue lambda = 1; its corresponding eigenvector represents the stationary distribution."
    },
    {
        "id": 176,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "Under what condition can two matrices A and B be multiplied to form the product A * B?",
        "option_a": "The number of columns in A must equal the number of rows in B",
        "option_b": "Both matrices must have identical dimensions",
        "option_c": "Both matrices must be square",
        "option_d": "The determinant of A must equal the determinant of B",
        "correct_option": "A",
        "explanation": "Matrix multiplication A_{m x k} * B_{k x n} requires the inner dimensions to match (columns of A = rows of B), producing an m x n matrix."
    },
    {
        "id": 177,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the result of transposing the product of two matrices: (A * B)^T?",
        "option_a": "A^T * B^T",
        "option_b": "B^T * A^T",
        "option_c": "A * B",
        "option_d": "-(A * B)",
        "correct_option": "B",
        "explanation": "The transpose of a matrix product reverses the order of multiplication: (A * B)^T = B^T * A^T."
    },
    {
        "id": 178,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the inverse of the product of two invertible square matrices: (A * B)^(-1)?",
        "option_a": "A^(-1) * B^(-1)",
        "option_b": "B^(-1) * A^(-1)",
        "option_c": "A * B^(-1)",
        "option_d": "-(A * B)",
        "correct_option": "B",
        "explanation": "Multiplying (A * B) by (B^(-1) * A^(-1)) yields A * (B * B^(-1)) * A^(-1) = A * I * A^(-1) = I, confirming (AB)^(-1) = B^(-1) A^(-1)."
    },
    {
        "id": 179,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the formula for the inverse of a 2 x 2 matrix A = [[a, b], [c, d]] when det(A) != 0?",
        "option_a": "(1 / (ad - bc)) * [[d, -b], [-c, a]]",
        "option_b": "(1 / (ad - bc)) * [[a, c], [b, d]]",
        "option_c": "(ad - bc) * [[d, b], [c, a]]",
        "option_d": "[[d, -b], [-c, a]]",
        "correct_option": "A",
        "explanation": "The 2x2 inverse formula swaps diagonal elements, negates off-diagonal elements, and divides by the determinant ad - bc."
    },
    {
        "id": 180,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What necessary and sufficient condition must hold for a square matrix A to be invertible?",
        "option_a": "The determinant of A must be non-zero (det(A) != 0)",
        "option_b": "All entries in A must be positive",
        "option_c": "The trace of A must equal 0",
        "option_d": "A must be symmetric",
        "correct_option": "A",
        "explanation": "A square matrix is invertible if and only if its determinant is non-zero, which is equivalent to A having full rank and linearly independent rows/columns."
    },
    {
        "id": 181,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "Is matrix multiplication generally commutative (does A * B = B * A always hold)?",
        "option_a": "Yes, matrix multiplication is always commutative",
        "option_b": "No, matrix multiplication is generally non-commutative (AB != BA)",
        "option_c": "Only commutative for 3x3 matrices",
        "option_d": "Only commutative if det(A) = 1",
        "correct_option": "B",
        "explanation": "Even when both products AB and BA are well-defined and share the same dimensions, they are generally not equal, making matrix multiplication non-commutative."
    },
    {
        "id": 182,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "Is matrix multiplication associative: does (A * B) * C = A * (B * C)?",
        "option_a": "Yes, matrix multiplication is always associative provided dimensions are compatible",
        "option_b": "No, matrix multiplication is never associative",
        "option_c": "Only associative for diagonal matrices",
        "option_d": "Only associative if matrices are symmetric",
        "correct_option": "A",
        "explanation": "Matrix multiplication satisfies the associative property (AB)C = A(BC) for all dimensionally compatible matrices."
    },
    {
        "id": 183,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the standard arithmetic time complexity of multiplying two n x n matrices using the naive algorithm?",
        "option_a": "O(n)",
        "option_b": "O(n^2)",
        "option_c": "O(n^3)",
        "option_d": "O(2^n)",
        "correct_option": "C",
        "explanation": "The standard algorithm computes n^2 output entries, each requiring an inner dot product of length n, giving n^2 * n = O(n^3) operations."
    },
    {
        "id": 184,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What algorithm improves upon standard O(n^3) matrix multiplication using 7 recursive multiplications instead of 8?",
        "option_a": "Strassen's Algorithm with O(n^2.807) complexity",
        "option_b": "Karatsuba Algorithm",
        "option_c": "Fast Fourier Transform",
        "option_d": "Dijkstra's Algorithm",
        "correct_option": "A",
        "explanation": "Strassen's algorithm partitions matrices into 2x2 blocks and computes 7 sub-products, achieving an asymptotic complexity of O(n^(log2 7)) approx O(n^2.807)."
    },
    {
        "id": 185,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the inverse of an Orthogonal matrix Q (where Q^T Q = I)?",
        "option_a": "Q^(-1) = Q^T",
        "option_b": "Q^(-1) = -Q",
        "option_c": "Q^(-1) = det(Q) * Q",
        "option_d": "Q^(-1) = I - Q",
        "correct_option": "A",
        "explanation": "By definition of an orthogonal matrix, Q^T * Q = I, which means that the transpose Q^T is precisely the matrix inverse Q^(-1)."
    },
    {
        "id": 186,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the determinant of the inverse of an invertible matrix: det(A^(-1))?",
        "option_a": "1 / det(A)",
        "option_b": "-det(A)",
        "option_c": "det(A)^2",
        "option_d": "1 - det(A)",
        "correct_option": "A",
        "explanation": "Since A * A^(-1) = I and det(AB) = det(A) * det(B), we have det(A) * det(A^(-1)) = det(I) = 1, so det(A^(-1)) = 1 / det(A)."
    },
    {
        "id": 187,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What method finds the inverse of matrix A by augmenting it with identity matrix [A | I] and row-reducing to [I | A^(-1)]?",
        "option_a": "Gauss-Jordan Elimination",
        "option_b": "Cramer's Rule",
        "option_c": "Gram-Schmidt Orthogonalization",
        "option_d": "Cholesky Decomposition",
        "correct_option": "A",
        "explanation": "Gauss-Jordan elimination applies elementary row operations to transform the augmented matrix [A | I] until the left side becomes I, transforming the right side into A^(-1)."
    },
    {
        "id": 188,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is a Singular matrix?",
        "option_a": "A square matrix that has no inverse (determinant equals zero)",
        "option_b": "A matrix with only 1 row",
        "option_c": "A matrix containing only 0 and 1",
        "option_d": "A matrix with all identical elements",
        "correct_option": "A",
        "explanation": "A singular matrix is a square matrix whose determinant is 0, meaning its columns are linearly dependent and it cannot be inverted."
    },
    {
        "id": 189,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the outer product of two column vectors u (m x 1) and v (n x 1)?",
        "option_a": "An m x n matrix of rank at most 1: u * v^T",
        "option_b": "A scalar dot product: u^T * v",
        "option_c": "A vector of length m + n",
        "option_d": "An identity matrix",
        "correct_option": "A",
        "explanation": "The outer product u v^T produces an m x n matrix where each column is a scalar multiple of vector u, resulting in a matrix of rank at most 1."
    },
    {
        "id": 190,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the Moore-Penrose Pseudoinverse A^+ used for in overdetermined linear systems (tall matrix with full column rank)?",
        "option_a": "A^+ = (A^T A)^(-1) A^T to find least-squares solutions",
        "option_b": "A^+ = A^T",
        "option_c": "A^+ = det(A) * I",
        "option_d": "A^+ = (A A^T)^(-1)",
        "correct_option": "A",
        "explanation": "For tall full-rank matrices, the Moore-Penrose pseudoinverse A^+ = (A^T A)^(-1) A^T computes the minimal Euclidean norm least-squares solution x = A^+ y."
    },
    {
        "id": 191,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What does the Condition Number kappa(A) = ||A|| * ||A^(-1)|| measure for an invertible matrix?",
        "option_a": "Sensitivity of the solution of a linear system Ax = b to perturbations in the input data",
        "option_b": "The number of non-zero entries in A",
        "option_c": "The execution time of matrix inversion",
        "option_d": "The number of eigenvalues greater than 1",
        "correct_option": "A",
        "explanation": "The condition number measures how much errors in input data b or matrix A are amplified in the solution x; large kappa indicates an ill-conditioned system."
    },
    {
        "id": 192,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "If A is an n x n symmetric matrix (A = A^T) and invertible, what can be said about its inverse A^(-1)?",
        "option_a": "A^(-1) is also symmetric: (A^(-1))^T = A^(-1)",
        "option_b": "A^(-1) is skew-symmetric",
        "option_c": "A^(-1) is diagonal",
        "option_d": "A^(-1) has determinant 0",
        "correct_option": "A",
        "explanation": "Taking the transpose of the inverse: (A^(-1))^T = (A^T)^(-1) = A^(-1), proving the inverse of a symmetric matrix is always symmetric."
    },
    {
        "id": 193,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the product of any square matrix A with the Identity matrix I of compatible dimension?",
        "option_a": "A * I = I * A = A",
        "option_b": "Zero matrix",
        "option_c": "Identity matrix",
        "option_d": "A^T",
        "correct_option": "A",
        "explanation": "The identity matrix is the multiplicative identity element in matrix algebra, satisfying A * I = I * A = A for all matrices."
    },
    {
        "id": 194,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is an Idempotent matrix?",
        "option_a": "A matrix that equals its own square: A^2 = A",
        "option_b": "A matrix with inverse equal to itself",
        "option_c": "A matrix with all elements equal to 1",
        "option_d": "A matrix with trace equal to 0",
        "correct_option": "A",
        "explanation": "An idempotent matrix satisfies A * A = A, representing projection operators in linear algebra."
    },
    {
        "id": 195,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is an Involutory matrix?",
        "option_a": "A matrix that is its own inverse: A^2 = I",
        "option_b": "A matrix whose determinant is 0",
        "option_c": "A matrix with all negative elements",
        "option_d": "A matrix that cannot be multiplied",
        "correct_option": "A",
        "explanation": "An involutory matrix satisfies A * A = I, which means A^(-1) = A (e.g., reflection matrices)."
    },
    {
        "id": 196,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "How is the determinant of a 3x3 matrix related to matrix invertibility?",
        "option_a": "If det(A) != 0, the volume of the parallelpiped spanned by its column vectors is non-zero, making A invertible",
        "option_b": "If det(A) > 10, A is non-invertible",
        "option_c": "det(A) has no relation to invertibility",
        "option_d": "det(A) must be negative for A to be invertible",
        "correct_option": "A",
        "explanation": "The determinant represents the signed volume scaling factor of the linear transformation; non-zero determinant means columns span R^3 and A is invertible."
    },
    {
        "id": 197,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What are Elementary Matrices, and how do they relate to row operations?",
        "option_a": "Matrices obtained by performing a single elementary row operation on an identity matrix; multiplying E * A performs that row operation on A",
        "option_b": "Matrices that only contain prime numbers",
        "option_c": "Matrices used exclusively in quantum physics",
        "option_d": "Matrices that have no inverse",
        "correct_option": "A",
        "explanation": "Multiplying matrix A on the left by an elementary matrix E applies the corresponding row operation (row swapping, scaling, or row addition) to A."
    },
    {
        "id": 198,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the trace of the product of two square matrices: trace(A * B)?",
        "option_a": "trace(A * B) = trace(B * A)",
        "option_b": "trace(A * B) = trace(A) * trace(B)",
        "option_c": "trace(A * B) = 0",
        "option_d": "trace(A * B) = det(A * B)",
        "correct_option": "A",
        "explanation": "The cyclic property of trace guarantees trace(AB) = trace(BA), even though AB and BA are generally not identical matrices."
    },
    {
        "id": 199,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What does it mean for a square matrix to be 'ill-conditioned'?",
        "option_a": "Its determinant is close to zero relative to the magnitude of its entries, causing numerical instability during inversion",
        "option_b": "Its rows are completely orthogonal",
        "option_c": "It has only integer entries",
        "option_d": "It cannot be stored in computer memory",
        "correct_option": "A",
        "explanation": "An ill-conditioned matrix has a very large condition number; tiny rounding or measurement errors in b cause massive changes in the computed solution x = A^(-1) b."
    },
    {
        "id": 200,
        "topic_id": 8,
        "topic_title": "Matrix Multiplication & Inverses",
        "question_text": "What is the rank of an n x n matrix that has a valid two-sided inverse?",
        "option_a": "Rank = n (full rank)",
        "option_b": "Rank = 0",
        "option_c": "Rank = n - 1",
        "option_d": "Rank = 1",
        "correct_option": "A",
        "explanation": "By the Invertible Matrix Theorem, an n x n matrix is invertible if and only if it has full column and row rank, meaning rank(A) = n."
    },
    {
        "id": 201,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "Where in a eukaryotic cell does the Citric Acid (Krebs) Cycle occur?",
        "option_a": "Cytoplasm",
        "option_b": "Mitochondrial matrix",
        "option_c": "Inner mitochondrial membrane",
        "option_d": "Ribosomes",
        "correct_option": "B",
        "explanation": "The enzymes of the citric acid cycle reside within the aqueous mitochondrial matrix enclosed by the inner mitochondrial membrane."
    },
    {
        "id": 202,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What is the overall balanced chemical formula for aerobic cellular respiration?",
        "option_a": "C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ATP",
        "option_b": "6 CO2 + 6 H2O + light -> C6H12O6 + 6 O2",
        "option_c": "C6H12O6 -> 2 C2H5OH + 2 CO2",
        "option_d": "C6H12O6 + 2 NAD+ -> 2 Pyruvate",
        "correct_option": "A",
        "explanation": "Aerobic respiration oxidizes one molecule of glucose using 6 oxygen molecules to produce 6 carbon dioxide, 6 water, and chemical energy as ATP."
    },
    {
        "id": 203,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "Where does Glycolysis take place in both prokaryotic and eukaryotic cells?",
        "option_a": "Mitochondrial matrix",
        "option_b": "Cytoplasm (Cytosol)",
        "option_c": "Endoplasmic reticulum",
        "option_d": "Nucleus",
        "correct_option": "B",
        "explanation": "Glycolysis is an ancient metabolic pathway that takes place entirely in the cytosol and does not require oxygen or membrane-bound organelles."
    },
    {
        "id": 204,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What is the net gain of ATP and NADH per glucose molecule from Glycolysis alone?",
        "option_a": "4 ATP and 2 NADH",
        "option_b": "2 ATP (net) and 2 NADH",
        "option_c": "32 ATP and 6 NADH",
        "option_d": "1 ATP and 1 FADH2",
        "correct_option": "B",
        "explanation": "Glycolysis consumes 2 ATP during the investment phase and generates 4 ATP in the payoff phase, yielding a net profit of 2 ATP and 2 NADH."
    },
    {
        "id": 205,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What reaction links Glycolysis to the Krebs Cycle (the Transition Step)?",
        "option_a": "Pyruvate is converted to lactic acid",
        "option_b": "Pyruvate undergoes oxidative decarboxylation to form Acetyl-CoA, producing NADH and releasing CO2",
        "option_c": "Glucose is phosphorylated to glucose-6-phosphate",
        "option_d": "Citrate is converted to isocitrate",
        "correct_option": "B",
        "explanation": "The pyruvate dehydrogenase complex in the mitochondrial matrix oxidizes pyruvate (3C) into acetyl-CoA (2C), generating 1 NADH and 1 CO2 per pyruvate."
    },
    {
        "id": 206,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "In the first step of the Krebs cycle, Acetyl-CoA (2 carbons) combines with what 4-carbon molecule to form Citrate (6 carbons)?",
        "option_a": "Oxaloacetate",
        "option_b": "Malate",
        "option_c": "alpha-Ketoglutarate",
        "option_d": "Succinate",
        "correct_option": "A",
        "explanation": "Citrate synthase catalyzes the condensation of acetyl-CoA (2C) with oxaloacetate (4C) to regenerate the 6-carbon molecule citrate."
    },
    {
        "id": 207,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What are the energy products generated from ONE complete turn of the Krebs cycle (per acetyl-CoA)?",
        "option_a": "3 NADH, 1 FADH2, 1 ATP (or GTP), and 2 CO2",
        "option_b": "6 NADH, 2 FADH2, and 2 ATP",
        "option_c": "1 NADH and 1 FADH2",
        "option_d": "32 ATP and 6 H2O",
        "correct_option": "A",
        "explanation": "Each turn of the Krebs cycle oxidizes one acetyl group, generating 3 NADH, 1 FADH2, 1 ATP/GTP by substrate-level phosphorylation, and releases 2 CO2."
    },
    {
        "id": 208,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "How many total turns of the Krebs cycle occur per single molecule of glucose oxidized?",
        "option_a": "1 turn",
        "option_b": "2 turns (since glucose splits into two pyruvate molecules)",
        "option_c": "4 turns",
        "option_d": "6 turns",
        "correct_option": "B",
        "explanation": "One glucose molecule (6C) splits during glycolysis into two pyruvate molecules (3C each), generating two acetyl-CoA molecules and two Krebs cycle turns."
    },
    {
        "id": 209,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "Which enzyme in the Krebs cycle is physically embedded in the inner mitochondrial membrane and functions as Complex II of the Electron Transport Chain?",
        "option_a": "Citrate Synthase",
        "option_b": "Succinate Dehydrogenase",
        "option_c": "Malate Dehydrogenase",
        "option_d": "Isocitrate Dehydrogenase",
        "correct_option": "B",
        "explanation": "Succinate dehydrogenase catalyzes the oxidation of succinate to fumarate while reducing FAD to FADH2; it is integral to the inner membrane as Complex II of the ETC."
    },
    {
        "id": 210,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What is the final electron acceptor at the end of the Electron Transport Chain in aerobic respiration?",
        "option_a": "NAD+",
        "option_b": "Molecular Oxygen (O2), which is reduced to form Water (H2O)",
        "option_c": "Pyruvate",
        "option_d": "Carbon Dioxide (CO2)",
        "correct_option": "B",
        "explanation": "Oxygen acts as the terminal electron acceptor at Complex IV, combining with electrons and protons to form metabolic water: (1/2) O2 + 2 e- + 2 H+ -> H2O."
    },
    {
        "id": 211,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "How does the Electron Transport Chain generate the proton gradient needed to drive ATP synthesis?",
        "option_a": "By actively pumping H+ ions from the mitochondrial matrix into the intermembrane space as electrons flow through complexes I, III, and IV",
        "option_b": "By pumping ATP into the cytoplasm",
        "option_c": "By decomposing glucose molecules in the matrix",
        "option_d": "By transporting electrons into the nucleus",
        "correct_option": "A",
        "explanation": "The free energy released as electrons pass through complexes I, III, and IV drives active proton pumping into the intermembrane space, creating an electrochemical gradient."
    },
    {
        "id": 212,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What molecular rotary machine synthesizes ATP using the electrochemical proton gradient (chemiosmosis)?",
        "option_a": "ATP Synthase (Complex V)",
        "option_b": "Pyruvate Kinase",
        "option_c": "Phosphofructokinase",
        "option_d": "Cytochrome c",
        "correct_option": "A",
        "explanation": "Protons flow down their electrochemical gradient back into the matrix through ATP Synthase, driving rotary catalysis that phosphorylates ADP + Pi into ATP."
    },
    {
        "id": 213,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "Approximately how many ATP molecules are generated per molecule of NADH oxidized in the Electron Transport Chain?",
        "option_a": "~1.0 ATP",
        "option_b": "~2.5 ATP",
        "option_c": "~5.0 ATP",
        "option_d": "~10.0 ATP",
        "correct_option": "B",
        "explanation": "Under current chemiosmotic stoichiometry, oxidation of 1 NADH pumps 10 protons across complexes I, III, and IV, yielding approximately 2.5 ATP molecules."
    },
    {
        "id": 214,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "Why does FADH2 yield fewer ATP molecules (~1.5 ATP) than NADH (~2.5 ATP) in oxidative phosphorylation?",
        "option_a": "FADH2 electrons enter the ETC at Complex II, bypassing the proton pumping of Complex I",
        "option_b": "FADH2 is destroyed before reaching the membrane",
        "option_c": "FADH2 cannot donate electrons",
        "option_d": "FADH2 is only produced in anaerobic fermentation",
        "correct_option": "A",
        "explanation": "Electrons from FADH2 enter at Complex II rather than Complex I; because Complex II does not pump protons, fewer protons are translocated per electron pair."
    },
    {
        "id": 215,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What is the total estimated theoretical ATP yield from the complete aerobic oxidation of one glucose molecule?",
        "option_a": "2 ATP",
        "option_b": "~30 to 32 ATP",
        "option_c": "100 ATP",
        "option_d": "12 ATP",
        "correct_option": "B",
        "explanation": "Accounting for glycolysis (2 ATP, 2 NADH), transition (2 NADH), and Krebs cycle + ETC (~26-28 ATP), full oxidation yields approximately 30 to 32 ATP per glucose."
    },
    {
        "id": 216,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What is the primary physiological purpose of Lactic Acid Fermentation in muscle cells during intense anaerobic exercise?",
        "option_a": "To generate large amounts of additional ATP directly",
        "option_b": "To regenerate NAD+ from NADH so that Glycolysis can continue generating 2 ATP in the absence of oxygen",
        "option_c": "To break down carbon dioxide",
        "option_d": "To synthesize glucose from pyruvate",
        "correct_option": "B",
        "explanation": "Without oxygen, the ETC halts and NADH accumulates; lactate dehydrogenase reduces pyruvate to lactate, oxidizing NADH back to NAD+ to keep glycolysis operational."
    },
    {
        "id": 217,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "How does Cyanide poison cellular respiration?",
        "option_a": "It binds to and inhibits Cytochrome c Oxidase (Complex IV), blocking electron transfer to oxygen and halting ATP synthesis",
        "option_b": "It destroys glucose in the cytoplasm",
        "option_c": "It prevents pyruvate from entering glycolysis",
        "option_d": "It enhances ATP Synthase activity to toxic levels",
        "correct_option": "A",
        "explanation": "Cyanide binds tightly to the heme iron in Complex IV, preventing electron transfer to O2, which backs up the entire ETC and stops proton pumping and ATP production."
    },
    {
        "id": 218,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What effect do chemical uncouplers (such as 2,4-Dinitrophenol or thermogenin) have on oxidative phosphorylation?",
        "option_a": "They dissipate the proton gradient across the inner membrane as heat without producing ATP",
        "option_b": "They accelerate ATP synthesis tenfold",
        "option_c": "They block the entry of electrons at Complex I",
        "option_d": "They prevent glycolysis from converting glucose to pyruvate",
        "correct_option": "A",
        "explanation": "Uncouplers allow protons to leak back into the matrix across the lipid bilayer, collapsing the proton gradient and converting oxidation energy to heat instead of ATP."
    },
    {
        "id": 219,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What key regulatory enzyme in Glycolysis is allosterically inhibited by high levels of ATP and Citrate?",
        "option_a": "Hexokinase",
        "option_b": "Phosphofructokinase-1 (PFK-1)",
        "option_c": "Pyruvate Kinase",
        "option_d": "Aldolase",
        "correct_option": "B",
        "explanation": "PFK-1 is the primary committed pacemaker of glycolysis; high energy charge (ATP) and abundant downstream intermediates (Citrate) allosterically inhibit PFK-1."
    },
    {
        "id": 220,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "At which steps in the Krebs cycle are carbon dioxide (CO2) molecules released?",
        "option_a": "During the oxidative decarboxylations of Isocitrate (to alpha-ketoglutarate) and alpha-Ketoglutarate (to succinyl-CoA)",
        "option_b": "During the condensation of acetyl-CoA with oxaloacetate",
        "option_c": "During the oxidation of malate to oxaloacetate",
        "option_d": "During the hydration of fumarate to malate",
        "correct_option": "A",
        "explanation": "Two successive oxidative decarboxylations catalyzed by isocitrate dehydrogenase and alpha-ketoglutarate dehydrogenase release two CO2 molecules per turn."
    },
    {
        "id": 221,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What small soluble protein transfers electrons from Complex III to Complex IV on the outer surface of the inner mitochondrial membrane?",
        "option_a": "Ubiquinone (Coenzyme Q)",
        "option_b": "Cytochrome c",
        "option_c": "Plastocyanin",
        "option_d": "Ferritin",
        "correct_option": "B",
        "explanation": "Cytochrome c is a mobile peripheral hemeprotein that shuttles single electrons through the intermembrane space from Complex III to Complex IV."
    },
    {
        "id": 222,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What lipid-soluble mobile carrier shuttles electrons within the inner mitochondrial membrane from Complexes I and II to Complex III?",
        "option_a": "Cytochrome c",
        "option_b": "Coenzyme Q (Ubiquinone)",
        "option_c": "ATP Synthase",
        "option_d": "Carnitine",
        "correct_option": "B",
        "explanation": "Ubiquinone (Coenzyme Q) is a hydrophobic electron carrier that diffuses freely within the core of the lipid bilayer, accepting electrons from Complexes I and II."
    },
    {
        "id": 223,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What is the difference between Substrate-Level Phosphorylation and Oxidative Phosphorylation?",
        "option_a": "Substrate-level transfers a phosphate group directly from a substrate to ADP by an enzyme; Oxidative uses the proton gradient generated by the ETC",
        "option_b": "Substrate-level requires oxygen; oxidative does not",
        "option_c": "Substrate-level produces 90% of a cell's ATP",
        "option_d": "Oxidative phosphorylation occurs exclusively in the cytoplasm",
        "correct_option": "A",
        "explanation": "Substrate-level phosphorylation directly transfers a high-energy phosphate from a metabolic intermediate to ADP (e.g., in glycolysis and Krebs); oxidative relies on chemiosmosis."
    },
    {
        "id": 224,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What happens to Pyruvate under anaerobic conditions in yeast cells (Alcoholic Fermentation)?",
        "option_a": "It is decarboxylated to acetaldehyde and then reduced to Ethanol, regenerating NAD+",
        "option_b": "It is converted to lactic acid",
        "option_c": "It enters the mitochondrial matrix",
        "option_d": "It combines with oxaloacetate to form citrate",
        "correct_option": "A",
        "explanation": "In yeast, pyruvate decarboxylase removes CO2 to form acetaldehyde, which alcohol dehydrogenase reduces to ethanol while oxidizing NADH back to NAD+."
    },
    {
        "id": 225,
        "topic_id": 9,
        "topic_title": "Cellular Respiration & Krebs Cycle",
        "question_text": "What role does Coenzyme A (CoA-SH) play in cellular metabolism?",
        "option_a": "It acts as an acyl group carrier, forming high-energy thioester bonds (e.g., in Acetyl-CoA and Succinyl-CoA)",
        "option_b": "It is a terminal electron acceptor in the ETC",
        "option_c": "It phosphorylates ADP into ATP directly",
        "option_d": "It acts as a structural component of ribosomes",
        "correct_option": "A",
        "explanation": "Coenzyme A contains a reactive thiol (-SH) group that binds acyl groups via high-energy thioester bonds, facilitating transfer of acetyl groups into the Krebs cycle."
    }
];

// Local Client-Side Mock Database for GitHub Pages / Static Hosting
const LocalDB = {
    init() {
        if (!localStorage.getItem("adm_students")) {
            const defaultStudents = [
                {
                    id: 1,
                    name: "Alex Chen",
                    email: "alex.student@example.com",
                    password: "password123",
                    subjects_interest: "Machine Learning, Data Structures, Mathematics",
                    study_goals: "Prepare for Final Exams & Machine Learning Certifications",
                    daily_target_minutes: 90
                }
            ];
            // Migrate legacy student if exists
            const legacy = localStorage.getItem("adm_student");
            if (legacy) {
                try {
                    const parsed = JSON.parse(legacy);
                    if (parsed && parsed.email && parsed.email !== "alex.student@example.com") {
                        defaultStudents.push({ ...parsed, password: parsed.password || "password123" });
                    }
                } catch(e) {}
            }
            localStorage.setItem("adm_students", JSON.stringify(defaultStudents));
        }

        if (!localStorage.getItem("adm_current_student_id")) {
            localStorage.setItem("adm_current_student_id", "1");
        }

        if (!localStorage.getItem("adm_subjects")) {
            localStorage.setItem("adm_subjects", JSON.stringify([
                { id: 1, student_id: 1, name: "Machine Learning", code: "CS401", color: "#4f46e5", description: "Supervised & deep learning" },
                { id: 2, student_id: 1, name: "Data Structures & Algorithms", code: "CS201", color: "#2563eb", description: "Trees, graphs, and dynamic programming" },
                { id: 3, student_id: 1, name: "Linear Algebra", code: "MATH210", color: "#7c3aed", description: "Vectors, matrices, and eigenvalues" },
                { id: 4, student_id: 1, name: "Cellular Biology", code: "BIO101", color: "#059669", description: "Cellular respiration & metabolic pathways" }
            ]));
        }
        const defaultTopics = [
            { 
                id: 1, student_id: 1, subject_id: 1, title: "Linear Regression", difficulty: "Medium", 
                notes: "Ordinary least squares derivation: beta = (X^T X)^(-1) X^T y. Gradient descent update rule with learning rate eta. Bias-variance tradeoff and Gauss-Markov theorem assumptions.",
                attachments: [
                    {
                        id: "att_1_1",
                        name: "Linear_Regression_CheatSheet.txt",
                        size: 1420,
                        type: "text/plain",
                        data: "data:text/plain;base64,TElORUFSIFJFR1JFU1NJT04gQ0hFQVQgU0hFRVQKPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CjEuIE1vZGVsIEVxdWF0aW9uOiB5ID0gYmV0YV8wICsgYmV0YV8xICogeCArIGVwc2lsb24KMi4gT2xkZXN0IEVzdGltYXRvcjogT0xTIEZvcm11bGE6IGJldGEgPSAoWF5UIFgpXigtMSkgWF5UIHkKMy4gR3JhZGllbnQgRGVzY2VudCBVcGRhdGU6IHRoZXRhX2ogOj0gdGhldGFfaiAtIGFscGhhICogKDEvbSkgKiBzdW0oKGhfdGhldGEoeF5pKSAtIHleaSkgKiB4X2peaSkKNC4gQ29zdCBGdW5jdGlvbjogSkJlKFBhcmFtcykgPSAoMSAvIDJtKSAqIHN1bSgoeF9pICogYmV0YSAtIHlfaSkpXjIKNS4gUmVndWxhcml6YXRpb246CiAgIC0gUmlkZ2UgKEwyKTogcGVuYWx0eSA9IGxhbWJkYSAqIHN1bShiZXRhX2peMikKICAgLSBMYXNzbyAoTDEpOiBwZW5hbHR5ID0gbGFtYmRhICogc3VtKGFicyhiZXRhX2opKSBbZmVhdHVyZSBzZWxlY3Rpb25d",
                        uploaded_at: "2026-10-25T10:00:00.000Z"
                    }
                ]
            },
            { 
                id: 2, student_id: 1, subject_id: 1, title: "Neural Network Backpropagation", difficulty: "Hard", 
                notes: "Chain rule backpropagation: delta_l = (W_{l+1}^T delta_{l+1}) * sigma'(z_l). Sigmoid derivative sigma'(z) = sigma(z)(1 - sigma(z)). Vanishing gradient mitigation using ReLU and residual connections.",
                attachments: [
                    {
                        id: "att_2_1",
                        name: "Backpropagation_Derivations.md",
                        size: 1850,
                        type: "text/markdown",
                        data: "data:text/markdown;base64,IyBOZXVyYWwgTmV0d29yayBCYWNrcHJvcGFnYXRpb24gU3R1ZHkgTm90ZXMKCgojIyAxLiBDYWxjdWx1cyBDaGFpbiBSdWxlClBhcnRpYWwgZGVyaXZhdGl2ZSBvZiBsb3NzIEwgd2l0aCByZXNwZWN0IHRvIGFueSB3ZWlnaHQgV19pejoKJCQgcGFydGlhbCBMIC8gcGFydGlhbCBXID0gKHBhcnRpYWwgTCAvIHBhcnRpYWwgYSkgKiAocGFydGlhbCBhIC8gcGFydGlhbCB6KSAqIChwYXJ0aWFsIHogLyBwYXJ0aWFsIFcpICQkCgojIyAyLiBBY3RpdmF0aW9uIEZ1bmN0aW9uIERlcml2YXRpdmVzCi0gU2lnbW9pZDogYFwnKHonKSA9IHNoZ21hKHopICogKDEgLSBzaWdtYSh6KSlgCi0gVGFuaDogYFwnKHonKSA9IDEgLSB0YW5oXjIoengpYAotIFJlTFU6IGAnKHonKSA9IDEgXHRleHR7IGlmIHogPiAwIH0sIFx0ZXh0eyBlbHNlIH0gMGA=",
                        uploaded_at: "2026-10-25T11:30:00.000Z"
                    }
                ]
            },
            { 
                id: 3, student_id: 1, subject_id: 1, title: "Support Vector Machines", difficulty: "Medium", 
                notes: "Maximum margin hyperplane: min 0.5 * ||w||^2 s.t. y_i(w^T x_i + b) >= 1. Soft margin slack variables xi_i and penalty parameter C. Kernel trick mapping with RBF kernel.",
                attachments: [
                    {
                        id: "att_3_1",
                        name: "SVM_Formulation_Notes.txt",
                        size: 1200,
                        type: "text/plain",
                        data: "data:text/plain;base64,U1VQUE9SVCBWRUNUT1IgTUFDSElORVMgKE1BWEFNVU0gTUFSR0lOKQo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQoxLiBQcmltYWwgT3B0aW1pemF0aW9uIFByb2JsZW06CiAgIE1pbmltaXplOiAxLzIgKiB8fHdsfF4yICsgQyAqIFN1bSh4aV9pKQogICBTdWJqZWN0IHRvOiB5X2kgKiAod15UIHhfaSArIGIpID49IDEgLSB4aV9pCjIuIEtlcm5lbCBUcmljazogS194aSwgeGopID0gZXhwKC1nYW1tYSAqIHx8eGlfeGogfF4yKQ==",
                        uploaded_at: "2026-10-26T09:15:00.000Z"
                    }
                ]
            },
            { id: 4, student_id: 1, subject_id: 2, title: "Binary Search Trees", difficulty: "Easy", notes: "In-order traversal yields sorted order, average O(log n) lookup", attachments: [] },
            { id: 5, student_id: 1, subject_id: 2, title: "Dynamic Programming: Knapsack", difficulty: "Hard", notes: "Overlapping subproblems, 2D memoization table, time complexity", attachments: [] },
            { id: 6, student_id: 1, subject_id: 2, title: "Graph Breadth-First Search", difficulty: "Medium", notes: "Queue-based traversal, shortest path in unweighted graphs", attachments: [] },
            { id: 7, student_id: 1, subject_id: 3, title: "Eigenvalues and Eigenvectors", difficulty: "Hard", notes: "Characteristic equation det(A - lambda*I) = 0, diagonalizability", attachments: [] },
            { id: 8, student_id: 1, subject_id: 3, title: "Matrix Multiplication & Inverses", difficulty: "Easy", notes: "Row by column dot product, determinant checks for singularity", attachments: [] },
            { id: 9, student_id: 1, subject_id: 4, title: "Cellular Respiration & Krebs Cycle", difficulty: "Medium", notes: "Glycolysis, acetyl-CoA, citric acid cycle, ATP synthase yield", attachments: [] }
        ];

        let loadedTopics = [];
        try {
            loadedTopics = JSON.parse(localStorage.getItem("adm_topics") || "[]");
        } catch(e) { loadedTopics = []; }

        if (!loadedTopics.length || loadedTopics.length < 9 || !loadedTopics.some(t => t.title === "Support Vector Machines")) {
            localStorage.setItem("adm_topics", JSON.stringify(defaultTopics));
        }
        if (!localStorage.getItem("adm_sessions")) {
            const today = new Date();
            const daysAgo = (d) => {
                const dt = new Date(today);
                dt.setDate(dt.getDate() - d);
                return dt.toISOString().split("T")[0];
            };
            localStorage.setItem("adm_sessions", JSON.stringify([
                { id: 1, student_id: 1, topic_id: 1, study_date: daysAgo(7), duration_minutes: 50, difficulty: "Medium", quiz_score: 52, mistakes_count: 4, revisions_count: 1, notes: "Struggled with gradient descent formula.", outcome: "needs_revision" },
                { id: 2, student_id: 1, topic_id: 2, study_date: daysAgo(9), duration_minutes: 65, difficulty: "Hard", quiz_score: 48, mistakes_count: 5, revisions_count: 0, notes: "Confused on sigmoid derivative in backward pass.", outcome: "needs_revision" },
                { id: 3, student_id: 1, topic_id: 4, study_date: daysAgo(5), duration_minutes: 60, difficulty: "Hard", quiz_score: 65, mistakes_count: 2, revisions_count: 1, notes: "Need practice on 2D table drawing.", outcome: "needs_revision" },
                { id: 4, student_id: 1, topic_id: 6, study_date: daysAgo(4), duration_minutes: 45, difficulty: "Hard", quiz_score: 72, mistakes_count: 2, revisions_count: 1, notes: "Roots of 3x3 characteristic polynomial.", outcome: "retained" },
                { id: 5, student_id: 1, topic_id: 5, study_date: daysAgo(3), duration_minutes: 40, difficulty: "Medium", quiz_score: 84, mistakes_count: 1, revisions_count: 2, notes: "Queue logic solid.", outcome: "retained" },
                { id: 6, student_id: 1, topic_id: 8, study_date: daysAgo(2), duration_minutes: 55, difficulty: "Medium", quiz_score: 88, mistakes_count: 1, revisions_count: 2, notes: "Electron transport chain memorized.", outcome: "retained" },
                { id: 7, student_id: 1, topic_id: 3, study_date: daysAgo(1), duration_minutes: 35, difficulty: "Easy", quiz_score: 96, mistakes_count: 0, revisions_count: 3, notes: "Recursive insertions mastered.", outcome: "retained" },
                { id: 8, student_id: 1, topic_id: 7, study_date: daysAgo(0), duration_minutes: 30, difficulty: "Easy", quiz_score: 100, mistakes_count: 0, revisions_count: 2, notes: "Matrix inverse formula clear.", outcome: "retained" }
            ]));
        }
        // Comprehensive Question Bank (225 MCQs, exactly 25 per topic)
        let loadedQuestions = [];
        try {
            loadedQuestions = JSON.parse(localStorage.getItem("adm_questions") || "[]");
        } catch(e) { loadedQuestions = []; }

        if (!loadedQuestions.length || loadedQuestions.length < 200) {
            localStorage.setItem("adm_questions", JSON.stringify(MASTER_QUIZ_BANK));
        }
        if (!localStorage.getItem("adm_quiz_attempts")) {
            localStorage.setItem("adm_quiz_attempts", JSON.stringify([
                { id: 1, student_id: 1, topic_id: 1, score: 50.0, total_questions: 2, correct_count: 1, mistakes_count: 1, taken_at: "2026-10-25 14:20:00" },
                { id: 2, student_id: 1, topic_id: 3, score: 100.0, total_questions: 1, correct_count: 1, mistakes_count: 0, taken_at: "2026-10-26 16:45:00" }
            ]));
        }
    },

    mockRequest(endpoint, options = {}) {
        LocalDB.init();
        let students = JSON.parse(localStorage.getItem("adm_students") || "[]");
        let currentStudentId = parseInt(localStorage.getItem("adm_current_student_id")) || (students[0] ? students[0].id : 1);
        let student = students.find(s => s.id === currentStudentId) || students[0];

        let subjects = JSON.parse(localStorage.getItem("adm_subjects") || "[]");
        let topics = JSON.parse(localStorage.getItem("adm_topics") || "[]");
        let sessions = JSON.parse(localStorage.getItem("adm_sessions") || "[]");
        let questions = JSON.parse(localStorage.getItem("adm_questions") || "[]");
        let attempts = JSON.parse(localStorage.getItem("adm_quiz_attempts") || "[]");

        const url = endpoint.split("?")[0];
        const method = options.method || "GET";
        const body = options.body ? JSON.parse(options.body) : {};

        // 1. REGISTER NEW STUDENT
        if (url === "/auth/register" && method === "POST") {
            const email = (body.email || "").toLowerCase().trim();
            if (!email || !body.password) {
                throw new Error("Email and password are required.");
            }
            if (students.some(s => s.email.toLowerCase() === email)) {
                throw new Error("A student with this email address already exists.");
            }

            const newId = Date.now();
            const newStudent = {
                id: newId,
                name: (body.name || "Student").trim(),
                email: email,
                password: body.password,
                subjects_interest: body.subjects_interest || "General Studies",
                study_goals: body.study_goals || "Master core concepts and improve exam retention",
                daily_target_minutes: parseInt(body.daily_target_minutes) || 60
            };

            students.push(newStudent);
            localStorage.setItem("adm_students", JSON.stringify(students));
            localStorage.setItem("adm_current_student_id", newStudent.id.toString());
            localStorage.setItem("adm_current_student", JSON.stringify(newStudent));
            localStorage.setItem("adm_student", JSON.stringify(newStudent));

            // Create starter subjects for new student based on their interest
            const rawInterests = (newStudent.subjects_interest || "")
                .split(",")
                .map(s => s.trim())
                .filter(Boolean);
            const subNames = rawInterests.length ? rawInterests.slice(0, 3) : ["Computer Science", "Mathematics"];
            const colors = ["#2563eb", "#7c3aed", "#059669"];

            const userSubs = subNames.map((name, idx) => ({
                id: Date.now() + idx + 1,
                student_id: newStudent.id,
                name: name,
                code: (name.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "SUB") + "101",
                color: colors[idx % colors.length],
                description: `Core study module for ${name}`
            }));
            subjects.push(...userSubs);
            localStorage.setItem("adm_subjects", JSON.stringify(subjects));

            // Create 1 starter topic per subject
            const userTopics = userSubs.map((sub, idx) => ({
                id: Date.now() + 100 + idx,
                student_id: newStudent.id,
                subject_id: sub.id,
                title: `${sub.name} Fundamentals`,
                difficulty: "Medium",
                notes: "Introductory concepts and study notes."
            }));
            topics.push(...userTopics);
            localStorage.setItem("adm_topics", JSON.stringify(topics));

            // Seed 25 comprehensive quiz questions for each starter topic
            userTopics.forEach((ut, uIdx) => {
                const matches = MASTER_QUIZ_BANK.filter(q => q.topic_title.toLowerCase().includes(ut.title.toLowerCase()));
                const qSet = matches.length >= 20 ? matches.slice(0, 25) : MASTER_QUIZ_BANK.slice(0, 25);
                qSet.forEach((item, qIdx) => {
                    questions.push({
                        id: Date.now() + (uIdx * 100) + qIdx + 1,
                        topic_id: ut.id,
                        topic_title: ut.title,
                        question_text: item.question_text,
                        option_a: item.option_a,
                        option_b: item.option_b,
                        option_c: item.option_c,
                        option_d: item.option_d,
                        correct_option: item.correct_option,
                        explanation: item.explanation
                    });
                });
            });
            localStorage.setItem("adm_questions", JSON.stringify(questions));

            // Create 1 initial study session so revision planner has immediate data
            const todayStr = new Date().toISOString().split("T")[0];
            sessions.unshift({
                id: Date.now() + 200,
                student_id: newStudent.id,
                topic_id: userTopics[0].id,
                study_date: todayStr,
                duration_minutes: 45,
                difficulty: "Medium",
                quiz_score: 85,
                mistakes_count: 0,
                revisions_count: 1,
                notes: "First study session logged successfully.",
                outcome: "retained"
            });
            localStorage.setItem("adm_sessions", JSON.stringify(sessions));

            return {
                status: "success",
                message: "Student account registered successfully.",
                token: "token_" + newStudent.id,
                student: newStudent
            };
        }

        // 2. LOGIN
        if (url === "/auth/login" && method === "POST") {
            const email = (body.email || "").toLowerCase().trim();
            const found = students.find(s => s.email.toLowerCase() === email);
            if (!found) {
                throw new Error("Invalid email or password.");
            }
            if (found.password && body.password && found.password !== body.password) {
                throw new Error("Invalid email or password.");
            }
            localStorage.setItem("adm_current_student_id", found.id.toString());
            localStorage.setItem("adm_current_student", JSON.stringify(found));
            localStorage.setItem("adm_student", JSON.stringify(found));
            return {
                status: "success",
                message: "Logged in successfully.",
                token: "token_" + found.id,
                student: found
            };
        }

        // 3. DEMO LOGIN
        if (url === "/auth/demo-login") {
            let alex = students.find(s => s.email === "alex.student@example.com");
            if (!alex) {
                alex = {
                    id: 1,
                    name: "Alex Chen",
                    email: "alex.student@example.com",
                    password: "password123",
                    subjects_interest: "Machine Learning, Data Structures, Mathematics",
                    study_goals: "Prepare for Final Exams & Machine Learning Certifications",
                    daily_target_minutes: 90
                };
                students.push(alex);
                localStorage.setItem("adm_students", JSON.stringify(students));
            }
            localStorage.setItem("adm_current_student_id", "1");
            localStorage.setItem("adm_current_student", JSON.stringify(alex));
            localStorage.setItem("adm_student", JSON.stringify(alex));
            return {
                status: "success",
                message: "Logged in as Demo Student (Alex Chen).",
                token: "local_demo_token_123",
                student: alex
            };
        }

        // 4. ME
        if (url === "/auth/me") {
            if (!student) {
                throw new Error("Authentication required. Please log in.");
            }
            return { status: "success", student };
        }

        // 5. PROFILE UPDATE
        if (url === "/auth/profile" && method === "PUT") {
            if (!student) throw new Error("Authentication required.");
            Object.assign(student, body);
            const idx = students.findIndex(s => s.id === student.id);
            if (idx !== -1) students[idx] = student;
            localStorage.setItem("adm_students", JSON.stringify(students));
            localStorage.setItem("adm_current_student", JSON.stringify(student));
            localStorage.setItem("adm_student", JSON.stringify(student));
            return { status: "success", message: "Profile updated successfully.", student };
        }

        // Filter datasets by current student for privacy and isolation
        const currentStudentIdNum = student ? student.id : 1;
        const mySubjects = subjects.filter(s => (s.student_id ? s.student_id === currentStudentIdNum : currentStudentIdNum === 1));
        const mySubjectIds = new Set(mySubjects.map(s => s.id));
        const myTopics = topics.filter(t => (t.student_id ? t.student_id === currentStudentIdNum : mySubjectIds.has(t.subject_id)));
        const myTopicIds = new Set(myTopics.map(t => t.id));
        const mySessions = sessions.filter(s => (s.student_id ? s.student_id === currentStudentIdNum : myTopicIds.has(s.topic_id)));
        const myAttempts = attempts.filter(a => (a.student_id ? a.student_id === currentStudentIdNum : myTopicIds.has(a.topic_id)));

        // Subjects & Topics
        if (url === "/subjects") {
            if (method === "GET") {
                const subWithCounts = mySubjects.map(s => ({
                    ...s,
                    topic_count: myTopics.filter(t => t.subject_id === s.id).length
                }));
                return { status: "success", subjects: subWithCounts };
            }
            if (method === "POST") {
                const newSub = { id: Date.now(), student_id: currentStudentIdNum, ...body };
                subjects.push(newSub);
                localStorage.setItem("adm_subjects", JSON.stringify(subjects));
                return { status: "success", message: "Subject created.", id: newSub.id };
            }
        }
        if (url.startsWith("/subjects/") && method === "DELETE") {
            const id = parseInt(url.split("/")[2]);
            const filtered = subjects.filter(s => s.id !== id);
            localStorage.setItem("adm_subjects", JSON.stringify(filtered));
            return { status: "success", message: "Subject deleted." };
        }

        if (url === "/topics") {
            if (method === "GET") {
                const joined = myTopics.map(t => {
                    const sub = mySubjects.find(s => s.id === t.subject_id) || {};
                    let atts = t.attachments || [];
                    if (typeof atts === "string") {
                        try { atts = JSON.parse(atts); } catch(e) { atts = []; }
                    }
                    return { ...t, attachments: atts, subject_name: sub.name || "General", subject_color: sub.color || "#2563eb" };
                });
                return { status: "success", topics: joined };
            }
            if (method === "POST") {
                const newT = { 
                    id: Date.now(), 
                    student_id: currentStudentIdNum, 
                    ...body,
                    attachments: body.attachments || [] 
                };
                topics.push(newT);
                localStorage.setItem("adm_topics", JSON.stringify(topics));
                return { status: "success", message: "Topic created successfully with notes and files.", id: newT.id };
            }
        }

        if (url.startsWith("/topics/") && url.endsWith("/attachments") && method === "PUT") {
            const topicId = parseInt(url.split("/")[2]);
            const topic = topics.find(t => t.id === topicId);
            if (topic) {
                topic.attachments = body.attachments || [];
                localStorage.setItem("adm_topics", JSON.stringify(topics));
            }
            return { status: "success", message: "Attachments updated successfully." };
        }

        if (url.startsWith("/topics/") && url.endsWith("/notes") && method === "PUT") {
            const topicId = parseInt(url.split("/")[2]);
            const topic = topics.find(t => t.id === topicId);
            if (topic) {
                topic.notes = body.notes || "";
                localStorage.setItem("adm_topics", JSON.stringify(topics));
            }
            return { status: "success", message: "Notes updated successfully." };
        }

        // Sessions
        if (url === "/sessions") {
            if (method === "GET") {
                const joined = mySessions.map(s => {
                    const t = myTopics.find(tp => tp.id === s.topic_id) || {};
                    const sub = mySubjects.find(sb => sb.id === t.subject_id) || {};
                    return { ...s, topic_title: t.title || "Topic", subject_name: sub.name || "Subject", subject_color: sub.color || "#2563eb" };
                }).sort((a, b) => (b.study_date > a.study_date ? 1 : -1));
                return { status: "success", sessions: joined };
            }
            if (method === "POST") {
                const newS = { id: Date.now(), student_id: currentStudentIdNum, ...body };
                sessions.unshift(newS);
                localStorage.setItem("adm_sessions", JSON.stringify(sessions));
                return { status: "success", message: "Study session logged into Digital Memory.", id: newS.id };
            }
        }
        if (url.startsWith("/sessions/") && method === "DELETE") {
            const id = parseInt(url.split("/")[2]);
            const filtered = sessions.filter(s => s.id !== id);
            localStorage.setItem("adm_sessions", JSON.stringify(filtered));
            return { status: "success", message: "Study session deleted." };
        }

        // Recommendations / Planner
        if (url === "/planner/recommendations" || url === "/analytics/dashboard") {
            const today = new Date();
            const plan = myTopics.map(t => {
                const sub = mySubjects.find(s => s.id === t.subject_id) || {};
                const topSessions = mySessions.filter(s => s.topic_id === t.id).sort((a, b) => (b.study_date > a.study_date ? 1 : -1));
                const lastSess = topSessions[0] || {};
                const studyDate = lastSess.study_date ? new Date(lastSess.study_date) : new Date(today.getTime() - 14 * 86400000);
                const daysElapsed = Math.max(0.1, Math.round((today - studyDate) / 86400000));
                const score = lastSess.quiz_score !== undefined ? lastSess.quiz_score : 65;
                const mistakes = lastSess.mistakes_count || 0;
                const revisions = lastSess.revisions_count || 0;

                // Ebbinghaus rule calculation
                const scoreFactor = Math.max(0.3, score / 100);
                const stability = 2.5 * (1 + 0.7 * revisions) * scoreFactor * (t.difficulty === "Easy" ? 1.35 : t.difficulty === "Hard" ? 0.75 : 1.0);
                const retentionPct = Math.min(99, Math.max(5, Math.round(Math.exp(-daysElapsed / stability) * 100)));
                const priorityScore = 100 - retentionPct;
                const priority = priorityScore >= 55 || daysElapsed >= 7 ? "HIGH" : priorityScore >= 35 ? "MEDIUM" : "LOW";

                const expl = priority === "HIGH" 
                    ? `HIGH PRIORITY - Revise ${t.title} today because ${daysElapsed} days have elapsed since last study, latest quiz score was ${score}%, and ${mistakes} mistakes recorded.`
                    : priority === "MEDIUM"
                    ? `MEDIUM PRIORITY - Schedule revision for ${t.title} soon. ${daysElapsed} days have passed and retention is decaying.`
                    : `LOW PRIORITY - ${t.title} is well-retained. Studied recently with solid score.`;

                let atts = t.attachments || [];
                if (typeof atts === "string") {
                    try { atts = JSON.parse(atts); } catch(e) { atts = []; }
                }

                return {
                    topic_id: t.id,
                    title: t.title,
                    subject_name: sub.name || "General",
                    subject_color: sub.color || "#2563eb",
                    difficulty: t.difficulty,
                    notes: t.notes || "",
                    attachments: atts,
                    days_elapsed: daysElapsed,
                    last_studied: lastSess.study_date || "Never",
                    quiz_score: lastSess.quiz_score !== undefined ? lastSess.quiz_score : null,
                    mistakes_count: mistakes,
                    revisions_count: revisions,
                    retention_health_pct: retentionPct,
                    priority_score: priorityScore,
                    priority,
                    priority_badge: `${priority.charAt(0) + priority.slice(1).toLowerCase()} Priority`,
                    explanation: expl
                };
            }).sort((a, b) => b.priority_score - a.priority_score);

            if (url === "/planner/recommendations") {
                return {
                    status: "success",
                    summary: {
                        total_topics: plan.length,
                        high_priority_count: plan.filter(p => p.priority === "HIGH").length,
                        medium_priority_count: plan.filter(p => p.priority === "MEDIUM").length,
                        low_priority_count: plan.filter(p => p.priority === "LOW").length
                    },
                    study_today: plan[0] || null,
                    recommendations: plan
                };
            }

            // Dashboard payload
            const avgScore = mySessions.length ? Math.round(mySessions.reduce((acc, s) => acc + (s.quiz_score || 0), 0) / mySessions.length) : 0;
            const avgRetention = plan.length ? Math.round(plan.reduce((acc, p) => acc + p.retention_health_pct, 0) / plan.length) : 0;
            const recentAct = mySessions.slice(0, 6).map(s => {
                const t = myTopics.find(tp => tp.id === s.topic_id) || {};
                const sub = mySubjects.find(sb => sb.id === t.subject_id) || {};
                return { ...s, topic_title: t.title, subject_name: sub.name, subject_color: sub.color };
            });

            return {
                status: "success",
                kpis: {
                    total_topics: myTopics.length,
                    total_sessions: mySessions.length,
                    total_study_minutes: mySessions.reduce((acc, s) => acc + s.duration_minutes, 0),
                    average_quiz_score: avgScore,
                    topics_needing_revision: plan.filter(p => p.priority !== "LOW").length,
                    overall_retention_health: avgRetention
                },
                study_today: plan[0] || null,
                charts: {
                    score_trends: myAttempts.map(a => {
                        const t = myTopics.find(tp => tp.id === a.topic_id) || {};
                        return { date: a.taken_at.split(" ")[0], score: a.score, topic: t.title };
                    }),
                    weekly_study: [
                        { day_label: "Mon", minutes: 45 }, { day_label: "Tue", minutes: 60 },
                        { day_label: "Wed", minutes: 30 }, { day_label: "Thu", minutes: 75 },
                        { day_label: "Fri", minutes: 40 }, { day_label: "Sat", minutes: 90 },
                        { day_label: "Sun", minutes: 55 }
                    ],
                    priority_distribution: {
                        High: plan.filter(p => p.priority === "HIGH").length,
                        Medium: plan.filter(p => p.priority === "MEDIUM").length,
                        Low: plan.filter(p => p.priority === "LOW").length
                    }
                },
                recent_activity: recentAct
            };
        }

        if (url.startsWith("/planner/topics/") && url.endsWith("/pdf") && method === "POST") {
            const topicId = parseInt(url.split("/")[3]);
            const topic = topics.find(t => t.id === topicId);
            if (!topic) throw new Error("Topic not found.");
            if (!topic.attachments) topic.attachments = [];
            let atts = topic.attachments;
            if (typeof atts === "string") {
                try { atts = JSON.parse(atts); } catch(e) { atts = []; }
            }
            const newPdf = {
                id: "pdf_" + Date.now(),
                name: body.name || "Topic_Revision_Material.pdf",
                size: body.size || 1024,
                type: body.type || "application/pdf",
                data: body.data,
                uploaded_at: new Date().toISOString()
            };
            atts.push(newPdf);
            topic.attachments = atts;
            localStorage.setItem("adm_topics", JSON.stringify(topics));
            return {
                status: "success",
                message: `Topic PDF '${newPdf.name}' attached successfully to '${topic.title}'.`,
                attachment: newPdf
            };
        }

        if (url.startsWith("/planner/revise/")) {
            const topicId = parseInt(url.split("/")[3]);
            const todayStr = new Date().toISOString().split("T")[0];
            const sess = sessions.find(s => s.topic_id === topicId);
            if (sess) {
                sess.study_date = todayStr;
                sess.revisions_count = (sess.revisions_count || 0) + 1;
                sess.outcome = "retained";
            } else {
                sessions.unshift({ id: Date.now(), student_id: currentStudentIdNum, topic_id: topicId, study_date: todayStr, duration_minutes: 30, difficulty: "Medium", quiz_score: 85, mistakes_count: 0, revisions_count: 1, notes: "Revised today", outcome: "retained" });
            }
            localStorage.setItem("adm_sessions", JSON.stringify(sessions));
            return { status: "success", message: "Topic marked as revised today. Memory stability updated!" };
        }

        // Quizzes
        if (url === "/quizzes/topics") {
            const qTopics = myTopics.map(t => {
                const sub = mySubjects.find(s => s.id === t.subject_id) || {};
                const tQuestions = questions.filter(q => q.topic_id === t.id || (t.title && q.topic_title === t.title));
                const tAttempts = myAttempts.filter(a => a.topic_id === t.id);
                const latest = tAttempts.length ? tAttempts[tAttempts.length - 1].score : null;
                return {
                    id: t.id,
                    title: t.title,
                    difficulty: t.difficulty,
                    subject_name: sub.name || "General",
                    subject_color: sub.color || "#2563eb",
                    question_count: tQuestions.length,
                    latest_score: latest
                };
            });
            return { status: "success", topics: qTopics };
        }

        if (url.startsWith("/quizzes/") && url.endsWith("/questions")) {
            const topicId = parseInt(url.split("/")[2]);
            const topic = topics.find(t => t.id === topicId) || {};
            if (method === "POST") {
                const newQ = {
                    id: Date.now(),
                    topic_id: topicId,
                    topic_title: topic.title || "",
                    question_text: body.question_text,
                    option_a: body.option_a,
                    option_b: body.option_b,
                    option_c: body.option_c,
                    option_d: body.option_d,
                    correct_option: (body.correct_option || "A").toUpperCase(),
                    explanation: body.explanation || ""
                };
                questions.push(newQ);
                localStorage.setItem("adm_questions", JSON.stringify(questions));
                return { status: "success", message: "Question added to quiz bank.", id: newQ.id };
            }
            const topicQuestions = questions.filter(q => q.topic_id === topicId || (topic.title && q.topic_title === topic.title)).map(q => ({
                id: q.id,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d
            }));
            return { status: "success", topic, questions: topicQuestions };
        }

        if (url.startsWith("/quizzes/") && url.endsWith("/attempt")) {
            const topicId = parseInt(url.split("/")[2]);
            const topic = topics.find(t => t.id === topicId) || {};
            const topicQuestions = questions.filter(q => q.topic_id === topicId || (topic.title && q.topic_title === topic.title));
            const userAnswers = body.answers || {};
            let correct = 0;
            let mistakes = 0;
            const detailed = topicQuestions.map(q => {
                const ans = (userAnswers[q.id] || "").toUpperCase();
                const isCorr = ans === q.correct_option;
                if (isCorr) correct++; else mistakes++;
                return {
                    question_id: q.id,
                    question_text: q.question_text,
                    options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
                    student_answer: ans,
                    correct_answer: q.correct_option,
                    is_correct: isCorr,
                    explanation: q.explanation
                };
            });
            const scorePct = topicQuestions.length ? Math.round((correct / topicQuestions.length) * 100) : 0;
            attempts.unshift({ 
                id: Date.now(), 
                student_id: currentStudentIdNum, 
                topic_id: topicId, 
                score: scorePct, 
                total_questions: topicQuestions.length, 
                correct_count: correct, 
                mistakes_count: mistakes, 
                taken_at: new Date().toISOString().replace("T", " ").substring(0, 19) 
            });
            localStorage.setItem("adm_quiz_attempts", JSON.stringify(attempts));

            // update session
            const s = sessions.find(sn => sn.topic_id === topicId);
            if (s) {
                s.quiz_score = scorePct;
                s.mistakes_count = mistakes;
            }
            localStorage.setItem("adm_sessions", JSON.stringify(sessions));

            return {
                status: "success",
                score: scorePct,
                total_questions: topicQuestions.length,
                correct_count: correct,
                mistakes_count: mistakes,
                detailed_results: detailed
            };
        }

        if (url === "/quizzes/history") {
            const joined = myAttempts.map(a => {
                const t = myTopics.find(tp => tp.id === a.topic_id) || {};
                const sub = mySubjects.find(sb => sb.id === t.subject_id) || {};
                return { ...a, topic_title: t.title, subject_name: sub.name, subject_color: sub.color };
            });
            return { status: "success", attempts: joined };
        }

        // ML Status & Sandbox
        if (url === "/ml/status") {
            return {
                status: "success",
                is_trained: true,
                last_trained_at: "Active Model",
                training_sample_count: 120,
                model_comparison: {
                    logistic_regression: { accuracy: 0.90, precision: 0.90, recall: 0.947, f1_score: 0.923, test_samples: 30 },
                    random_forest: { accuracy: 0.90, precision: 0.90, recall: 0.947, f1_score: 0.923, test_samples: 30 },
                    gradient_boosting: { accuracy: 0.90, precision: 0.90, recall: 0.947, f1_score: 0.923, test_samples: 30 }
                },
                feature_importance: {
                    random_forest: {
                        days_since_last_study: 0.38,
                        latest_quiz_score: 0.26,
                        mistakes_count: 0.17,
                        difficulty_level: 0.09,
                        revisions_count: 0.06,
                        study_duration_minutes: 0.04
                    }
                }
            };
        }

        if (url === "/ml/predict") {
            const { days_since_last_study, latest_quiz_score, mistakes_count, revisions_count, difficulty_level } = body;
            const decay = (days_since_last_study * 1.8) + (mistakes_count * 2.5) + (difficulty_level * 3.5) - (latest_quiz_score * 0.25) - (revisions_count * 4.0);
            const proba = Math.min(0.99, Math.max(0.05, 1 / (1 + Math.exp(-decay / 5))));
            const needsRev = proba >= 0.5;

            const risks = [];
            if (days_since_last_study >= 5) risks.push(`Significant decay: ${days_since_last_study} days elapsed`);
            if (latest_quiz_score < 65) risks.push(`Low quiz score: ${latest_quiz_score}%`);
            if (mistakes_count >= 2) risks.push(`${mistakes_count} recorded mistakes`);

            return {
                status: "success",
                result: {
                    predicted_needs_revision: needsRev,
                    consensus_forgetting_probability: Math.round(proba * 100) / 100,
                    model_breakdown: {
                        logistic_regression: { probability: Math.round(proba * 100) / 100, prediction: needsRev ? "Needs Revision" : "Retained" },
                        random_forest: { probability: Math.round(proba * 100) / 100, prediction: needsRev ? "Needs Revision" : "Retained" },
                        gradient_boosting: { probability: Math.round(proba * 100) / 100, prediction: needsRev ? "Needs Revision" : "Retained" }
                    },
                    risk_factors: risks
                }
            };
        }

        if (url === "/ml/train") {
            return { status: "success", message: "ML models evaluated and refreshed." };
        }

        return { status: "success" };
    }
};

// API Fetch Helper with Auto-Fallback for GitHub Pages
async function apiRequest(endpoint, options = {}) {
    // If running statically on GitHub Pages, use LocalDB directly
    if (IS_STATIC_HOST) {
        return LocalDB.mockRequest(endpoint, options);
    }

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            logout();
            throw new Error("Session expired. Please log in again.");
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "An error occurred.");
        }
        return data;
    } catch (err) {
        // Graceful fallback to client-side database if server is unreachable
        console.warn("Backend API unreachable, using client-side memory store:", err.message);
        return LocalDB.mockRequest(endpoint, options);
    }
}

// Toast Notifications
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColors = {
        success: "bg-emerald-600 text-white",
        error: "bg-rose-600 text-white",
        warning: "bg-amber-600 text-white",
        info: "bg-blue-600 text-white"
    };
    const icons = {
        success: "fa-check-circle",
        error: "fa-exclamation-circle",
        warning: "fa-exclamation-triangle",
        info: "fa-info-circle"
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// App Initialization
document.addEventListener("DOMContentLoaded", async () => {
    setupEventListeners();
    if (state.token) {
        try {
            const res = await apiRequest("/auth/me");
            state.student = res.student;
            renderAuthenticatedApp();
            switchTab("dashboard");
        } catch (e) {
            renderLandingPage();
        }
    } else {
        renderLandingPage();
    }
});

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById("sidebar-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
            const sidebar = document.getElementById("sidebar");
            const mainContent = document.getElementById("main-content");
            if (state.sidebarCollapsed) {
                sidebar.classList.add("-translate-x-full", "md:w-20");
                sidebar.classList.remove("md:w-64");
                document.querySelectorAll(".sidebar-text").forEach(el => el.classList.add("hidden"));
                if (mainContent) mainContent.classList.remove("md:ml-64");
                if (mainContent) mainContent.classList.add("md:ml-20");
            } else {
                sidebar.classList.remove("-translate-x-full", "md:w-20");
                sidebar.classList.add("md:w-64");
                document.querySelectorAll(".sidebar-text").forEach(el => el.classList.remove("hidden"));
                if (mainContent) mainContent.classList.remove("md:ml-20");
                if (mainContent) mainContent.classList.add("md:ml-64");
            }
        });
    }
}

// Tab Switching
function switchTab(tabName) {
    state.currentTab = tabName;

    // Update nav links
    document.querySelectorAll(".nav-link").forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.className = "nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 transition";
        } else {
            btn.className = "nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition";
        }
    });

    // Hide all view containers
    document.querySelectorAll(".view-container").forEach(el => el.classList.add("hidden"));

    const activeView = document.getElementById(`${tabName}-view`);
    if (activeView) {
        activeView.classList.remove("hidden");
        activeView.classList.add("animate-fade-in");
    }

    // Trigger specific loaders
    switch (tabName) {
        case "dashboard":
            loadDashboard();
            break;
        case "planner":
            loadPlanner();
            break;
        case "memory":
            loadMemorySessions();
            break;
        case "subjects":
            loadSubjects();
            break;
        case "quizzes":
            loadQuizCenter();
            break;
        case "ml":
            loadMLLab();
            break;
        case "profile":
            loadProfile();
            break;
    }
}

// Render Unauthenticated Landing View
function renderLandingPage() {
    document.getElementById("auth-app").classList.add("hidden");
    document.getElementById("landing-app").classList.remove("hidden");
}

// Render Authenticated Shell
function renderAuthenticatedApp() {
    document.getElementById("landing-app").classList.add("hidden");
    document.getElementById("auth-app").classList.remove("hidden");

    if (state.student) {
        document.getElementById("student-name-display").textContent = state.student.name;
        document.getElementById("student-email-display").textContent = state.student.email;
        document.getElementById("student-avatar-initial").textContent = state.student.name.charAt(0).toUpperCase();
    }
}

// Authentication Actions
async function loginDemo() {
    try {
        const res = await apiRequest("/auth/demo-login", { method: "POST" });
        state.token = res.token;
        state.student = res.student;
        localStorage.setItem("adm_token", res.token);
        closeAuthModal();
        renderAuthenticatedApp();
        switchTab("dashboard");
        showToast("Welcome back, Alex! Demo student profile loaded.", "success");
    } catch (e) {
        showToast(e.message, "error");
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        state.token = res.token;
        state.student = res.student;
        localStorage.setItem("adm_token", res.token);
        closeAuthModal();
        renderAuthenticatedApp();
        switchTab("dashboard");
        showToast(`Welcome back, ${res.student.name}!`, "success");
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const subjects_interest = document.getElementById("reg-subjects").value;

    try {
        const res = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password, subjects_interest })
        });
        state.token = res.token;
        state.student = res.student;
        localStorage.setItem("adm_token", res.token);
        closeAuthModal();
        renderAuthenticatedApp();
        switchTab("dashboard");
        showToast("Registration successful! Welcome to AI Digital Memory.", "success");
    } catch (err) {
        showToast(err.message, "error");
    }
}

function logout() {
    state.token = null;
    state.student = null;
    localStorage.removeItem("adm_token");
    localStorage.removeItem("adm_current_student_id");
    localStorage.removeItem("adm_current_student");
    renderLandingPage();
    showToast("You have been signed out.", "info");
}

function openAuthModal(mode = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    if (mode === "register") {
        const n = document.getElementById("reg-name");
        const e = document.getElementById("reg-email");
        const p = document.getElementById("reg-password");
        const s = document.getElementById("reg-subjects");
        if (n) n.value = "";
        if (e) e.value = "";
        if (p) p.value = "";
        if (s) s.value = "";
    }
    switchAuthForm(mode);
}

function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.add("hidden");
}

function switchAuthForm(mode) {
    const loginForm = document.getElementById("login-form-container");
    const regForm = document.getElementById("reg-form-container");
    const tabLogin = document.getElementById("tab-auth-login");
    const tabReg = document.getElementById("tab-auth-register");

    if (mode === "login") {
        loginForm.classList.remove("hidden");
        regForm.classList.add("hidden");
        tabLogin.className = "w-1/2 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600";
        tabReg.className = "w-1/2 py-2 text-sm font-medium text-slate-500 border-b border-slate-200 hover:text-slate-700";
    } else {
        loginForm.classList.add("hidden");
        regForm.classList.remove("hidden");
        tabReg.className = "w-1/2 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600";
        tabLogin.className = "w-1/2 py-2 text-sm font-medium text-slate-500 border-b border-slate-200 hover:text-slate-700";
    }
}

// -------------------------------------------------------------------------
// 1. DASHBOARD
// -------------------------------------------------------------------------
async function loadDashboard() {
    try {
        const data = await apiRequest("/analytics/dashboard");
        const kpis = data.kpis;

        // KPI Cards
        document.getElementById("kpi-total-topics").textContent = kpis.total_topics;
        document.getElementById("kpi-total-sessions").textContent = kpis.total_sessions;
        document.getElementById("kpi-avg-score").textContent = `${kpis.average_quiz_score}%`;
        document.getElementById("kpi-topics-revision").textContent = kpis.topics_needing_revision;
        document.getElementById("kpi-retention-health").textContent = `${kpis.overall_retention_health}%`;

        // "What should I study today?"
        const studyCard = document.getElementById("study-today-card");
        if (data.study_today) {
            const st = data.study_today;
            studyCard.innerHTML = `
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold shrink-0">
                            <i class="fas fa-brain"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    st.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                                    st.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }">${st.priority_badge}</span>
                                <span class="text-xs font-medium px-2 py-0.5 rounded text-white" style="background-color: ${st.subject_color}">${st.subject_name}</span>
                                <span class="text-xs text-slate-500">Last studied ${st.days_elapsed} days ago</span>
                            </div>
                            <h3 class="text-lg font-bold text-slate-900">${st.title}</h3>
                            <p class="text-sm text-slate-600 mt-1 max-w-2xl">${st.explanation}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        <button onclick="markRevisedDirect(${st.topic_id})" class="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-check"></i> Mark Revised
                        </button>
                        <button onclick="startTopicQuiz(${st.topic_id})" class="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-play"></i> Take Quiz
                        </button>
                    </div>
                </div>
            `;
        } else {
            studyCard.innerHTML = `
                <div class="text-center py-6 text-slate-500">
                    <i class="fas fa-check-circle text-4xl text-emerald-500 mb-2"></i>
                    <h4 class="font-semibold text-slate-800">All caught up!</h4>
                    <p class="text-sm">No urgent topics need revision right now. Explore new topics or take a refresher quiz.</p>
                </div>
            `;
        }

        // Render Charts
        renderDashboardCharts(data.charts);

        // Recent Activity Feed
        renderRecentActivity(data.recent_activity);

    } catch (e) {
        showToast("Error loading dashboard data: " + e.message, "error");
    }
}

function renderDashboardCharts(chartsData) {
    // 1. Quiz Score Trends Line Chart
    const ctxTrend = document.getElementById("chart-score-trends");
    if (ctxTrend) {
        if (state.charts.scoreTrends) state.charts.scoreTrends.destroy();

        const labels = chartsData.score_trends.map(d => d.date);
        const scores = chartsData.score_trends.map(d => d.score);

        state.charts.scoreTrends = new Chart(ctxTrend, {
            type: "line",
            data: {
                labels: labels.length ? labels : ["No data"],
                datasets: [{
                    label: "Quiz Score (%)",
                    data: scores.length ? scores : [0],
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#2563eb",
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, ticks: { callback: v => `${v}%` } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 2. Weekly Study Minutes Bar Chart
    const ctxWeekly = document.getElementById("chart-weekly-study");
    if (ctxWeekly) {
        if (state.charts.weeklyStudy) state.charts.weeklyStudy.destroy();

        const labels = chartsData.weekly_study.map(d => d.day_label);
        const minutes = chartsData.weekly_study.map(d => d.minutes);

        state.charts.weeklyStudy = new Chart(ctxWeekly, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Study Time (min)",
                    data: minutes,
                    backgroundColor: "#7c3aed",
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 3. Priority Distribution Doughnut Chart
    const ctxPriority = document.getElementById("chart-priority-dist");
    if (ctxPriority) {
        if (state.charts.priorityDist) state.charts.priorityDist.destroy();

        const dist = chartsData.priority_distribution;
        state.charts.priorityDist = new Chart(ctxPriority, {
            type: "doughnut",
            data: {
                labels: ["High Priority", "Medium Priority", "Low Priority"],
                datasets: [{
                    data: [dist.High, dist.Medium, dist.Low],
                    backgroundColor: ["#f43f5e", "#f59e0b", "#10b981"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                },
                cutout: "70%"
            }
        });
    }
}

function renderRecentActivity(activities) {
    const tableBody = document.getElementById("recent-activity-tbody");
    if (!tableBody) return;

    if (!activities || !activities.length) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">No study sessions recorded yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = activities.map(act => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-3 px-4 font-medium text-slate-800">${act.topic_title}</td>
            <td class="py-3 px-4">
                <span class="inline-block px-2 py-0.5 rounded text-xs text-white" style="background-color: ${act.subject_color}">
                    ${act.subject_name}
                </span>
            </td>
            <td class="py-3 px-4 text-slate-600 text-sm">${act.study_date} (${act.duration_minutes}m)</td>
            <td class="py-3 px-4 font-semibold ${act.quiz_score >= 75 ? 'text-emerald-600' : 'text-rose-600'}">
                ${act.quiz_score !== null ? `${act.quiz_score}%` : '<span class="text-slate-400 font-normal">Not tested</span>'}
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
                    act.outcome === 'retained' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }">${act.outcome === 'retained' ? 'Retained' : 'Needs Revision'}</span>
            </td>
        </tr>
    `).join("");
}

// -------------------------------------------------------------------------
// 2. AI REVISION PLANNER (With Table View & Dedicated Topic PDF Column)
// -------------------------------------------------------------------------
function setPlannerViewMode(mode) {
    state.plannerViewMode = mode;
    const tableContainer = document.getElementById("planner-table-container");
    const cardsContainer = document.getElementById("planner-cards-container");
    const tableBtn = document.getElementById("planner-view-table-btn");
    const cardsBtn = document.getElementById("planner-view-cards-btn");

    if (mode === "table") {
        if (tableContainer) tableContainer.classList.remove("hidden");
        if (cardsContainer) cardsContainer.classList.add("hidden");
        if (tableBtn) {
            tableBtn.className = "px-2.5 py-1.5 rounded-md bg-white shadow-xs text-blue-700 font-bold flex items-center gap-1.5 transition";
        }
        if (cardsBtn) {
            cardsBtn.className = "px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition";
        }
    } else {
        if (tableContainer) tableContainer.classList.add("hidden");
        if (cardsContainer) cardsContainer.classList.remove("hidden");
        if (cardsBtn) {
            cardsBtn.className = "px-2.5 py-1.5 rounded-md bg-white shadow-xs text-blue-700 font-bold flex items-center gap-1.5 transition";
        }
        if (tableBtn) {
            tableBtn.className = "px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition";
        }
    }
}

async function loadPlanner(filterPriority = "ALL") {
    try {
        state.activePlannerFilter = filterPriority;
        const data = await apiRequest("/planner/recommendations");
        state.plannerRecommendations = data.recommendations || [];
        const list = state.plannerRecommendations;

        let filtered = list;
        if (filterPriority !== "ALL") {
            filtered = list.filter(item => item.priority === filterPriority);
        }

        // Summary counts
        const highEl = document.getElementById("planner-count-high");
        if (highEl) highEl.textContent = data.summary.high_priority_count;
        const medEl = document.getElementById("planner-count-med");
        if (medEl) medEl.textContent = data.summary.medium_priority_count;
        const lowEl = document.getElementById("planner-count-low");
        if (lowEl) lowEl.textContent = data.summary.low_priority_count;

        // Render both views
        renderPlannerTable(filtered);
        renderPlannerCards(filtered);

        // Apply active view mode
        setPlannerViewMode(state.plannerViewMode || "table");

    } catch (e) {
        showToast("Error loading revision planner: " + e.message, "error");
    }
}

function renderPlannerTable(items) {
    const tbody = document.getElementById("planner-table-tbody");
    if (!tbody) return;

    if (!items.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12 bg-white">
                    <i class="fas fa-check-double text-3xl text-emerald-500 mb-2"></i>
                    <h4 class="text-sm font-semibold text-slate-800">No topics in this priority tier</h4>
                    <p class="text-xs text-slate-400 mt-0.5">Keep studying and logging sessions to build your digital memory.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(item => {
        let atts = item.attachments || [];
        if (typeof atts === "string") {
            try { atts = JSON.parse(atts); } catch(e) { atts = []; }
        }

        // Filter or prioritize PDF attachments
        const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
        const primaryFile = pdfFiles[0] || atts[0] || null;

        return `
            <tr class="hover:bg-slate-50/80 transition border-b border-slate-100">
                <!-- 1. Priority -->
                <td class="py-3 px-3.5 whitespace-nowrap">
                    <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                        item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }">
                        <i class="fas ${item.priority === 'HIGH' ? 'fa-exclamation-circle' : item.priority === 'MEDIUM' ? 'fa-clock' : 'fa-check-circle'} text-[10px]"></i>
                        ${item.priority_badge}
                    </span>
                </td>

                <!-- 2. Topic & Subject -->
                <td class="py-3 px-3.5">
                    <div class="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-xs" onclick="openTopicDetailsModal(${item.topic_id})" title="Click to view full notes & files">
                        ${escapeHtml(item.title)}
                    </div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="text-[10px] font-semibold px-1.5 py-0.2 rounded text-white" style="background-color: ${item.subject_color}">
                            ${escapeHtml(item.subject_name)}
                        </span>
                        <span class="text-[10px] text-slate-400">• ${item.difficulty}</span>
                    </div>
                </td>

                <!-- 3. Memory Retention -->
                <td class="py-3 px-3.5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                        <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div class="h-1.5 rounded-full ${item.retention_health_pct >= 70 ? 'bg-emerald-500' : item.retention_health_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${item.retention_health_pct}%"></div>
                        </div>
                        <span class="font-bold text-xs ${item.retention_health_pct >= 70 ? 'text-emerald-600' : item.retention_health_pct >= 50 ? 'text-amber-600' : 'text-rose-600'}">
                            ${item.retention_health_pct}%
                        </span>
                    </div>
                </td>

                <!-- 4. Last Studied -->
                <td class="py-3 px-3.5 text-center whitespace-nowrap text-xs text-slate-600 font-medium">
                    ${item.days_elapsed}d ago
                </td>

                <!-- 5. Quiz Score / Mistakes -->
                <td class="py-3 px-3.5 text-center whitespace-nowrap text-xs">
                    <span class="font-bold ${item.quiz_score !== null && item.quiz_score < 60 ? 'text-rose-600' : 'text-slate-800'}">
                        ${item.quiz_score !== null ? `${item.quiz_score}%` : 'N/A'}
                    </span>
                    ${item.mistakes_count > 0 ? `<span class="text-[10px] text-amber-600 block">(${item.mistakes_count} mistake${item.mistakes_count > 1 ? 's' : ''})</span>` : ''}
                </td>

                <!-- 6. TOPIC PDF / STUDY DOCUMENT COLUMN -->
                <td class="py-3 px-3.5 bg-blue-50/30 border-x border-blue-100/70"
                    ondragover="handlePlannerDropzoneDragOver(event)"
                    ondragleave="handlePlannerDropzoneDragLeave(event)"
                    ondrop="handlePlannerDropzoneDrop(event, ${item.topic_id})">
                    
                    ${primaryFile ? `
                        <div class="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-blue-200/80 shadow-xs max-w-xs">
                            <div class="flex items-center gap-2 overflow-hidden truncate cursor-pointer" onclick="viewPlannerTopicPdf(${item.topic_id}, 0)" title="${escapeHtml(primaryFile.name)} (Click to view)">
                                <i class="${getFileIconClass(primaryFile.name, primaryFile.type)} text-sm flex-shrink-0"></i>
                                <div class="truncate">
                                    <div class="font-semibold text-slate-900 text-xs truncate">${escapeHtml(primaryFile.name)}</div>
                                    <div class="text-[9px] text-slate-400">${formatFileSize(primaryFile.size)}${atts.length > 1 ? ` • +${atts.length - 1} more` : ''}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-1 flex-shrink-0">
                                <button onclick="viewPlannerTopicPdf(${item.topic_id}, 0)" class="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Open & Preview PDF">
                                    <i class="fas fa-eye text-xs"></i>
                                </button>
                                <button onclick="downloadPlannerTopicPdf(${item.topic_id}, 0)" class="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Download PDF to device">
                                    <i class="fas fa-download text-xs"></i>
                                </button>
                                <button onclick="triggerPlannerPdfUpload(${item.topic_id})" class="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Attach another file or replace PDF">
                                    <i class="fas fa-plus text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="flex items-center gap-2">
                            <button onclick="triggerPlannerPdfUpload(${item.topic_id})" class="px-2.5 py-1.5 rounded-lg border border-dashed border-blue-300 bg-white hover:bg-blue-50/80 text-blue-700 font-semibold text-[11px] flex items-center gap-1.5 transition shadow-xs">
                                <i class="fas fa-file-upload text-blue-500"></i>
                                <span>+ Add Topic PDF</span>
                            </button>
                            <span class="text-[10px] text-slate-400 hidden xl:inline">or drag & drop here</span>
                        </div>
                    `}
                </td>

                <!-- 7. Actions -->
                <td class="py-3 px-3.5 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="markRevisedDirect(${item.topic_id})" class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition" title="Mark as revised today">
                            <i class="fas fa-check mr-1"></i>Revised
                        </button>
                        <button onclick="startTopicQuiz(${item.topic_id})" class="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition" title="Test with active retrieval quiz">
                            <i class="fas fa-play mr-1"></i>Quiz
                        </button>
                        <button onclick="openTopicDetailsModal(${item.topic_id})" class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition" title="View notes and all files">
                            <i class="fas fa-ellipsis-v text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function renderPlannerCards(items) {
    const container = document.getElementById("planner-cards-container");
    if (!container) return;

    if (!items.length) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
                <i class="fas fa-check-double text-4xl text-emerald-500 mb-3"></i>
                <h3 class="text-base font-semibold text-slate-800">No topics in this priority tier</h3>
                <p class="text-sm text-slate-500 mt-1">Keep studying and logging sessions to build your digital memory.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => {
        let atts = item.attachments || [];
        if (typeof atts === "string") {
            try { atts = JSON.parse(atts); } catch(e) { atts = []; }
        }
        const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
        const primaryFile = pdfFiles[0] || atts[0] || null;

        return `
            <div class="card-soft p-5 rounded-xl flex flex-col justify-between border-l-4 ${
                item.priority === 'HIGH' ? 'border-l-rose-500' :
                item.priority === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-emerald-500'
            }">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded text-white" style="background-color: ${item.subject_color}">
                            ${escapeHtml(item.subject_name)}
                        </span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                            item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }">${item.priority_badge}</span>
                    </div>

                    <h4 class="text-lg font-bold text-slate-900 mb-1 hover:text-blue-600 cursor-pointer" onclick="openTopicDetailsModal(${item.topic_id})">${escapeHtml(item.title)}</h4>

                    <!-- Retention Progress Bar -->
                    <div class="mt-3 mb-4">
                        <div class="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                            <span>Estimated Memory Retention</span>
                            <span class="font-bold ${item.retention_health_pct >= 70 ? 'text-emerald-600' : item.retention_health_pct >= 50 ? 'text-amber-600' : 'text-rose-600'}">
                                ${item.retention_health_pct}%
                            </span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div class="h-2 rounded-full ${item.retention_health_pct >= 70 ? 'bg-emerald-500' : item.retention_health_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${item.retention_health_pct}%"></div>
                        </div>
                    </div>

                    <!-- Key stats row -->
                    <div class="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center mb-3">
                        <div>
                            <div class="text-xs text-slate-500">Last Studied</div>
                            <div class="text-xs font-bold text-slate-800">${item.days_elapsed}d ago</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-500">Quiz Score</div>
                            <div class="text-xs font-bold ${item.quiz_score !== null && item.quiz_score < 60 ? 'text-rose-600' : 'text-slate-800'}">
                                ${item.quiz_score !== null ? `${item.quiz_score}%` : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-500">Mistakes</div>
                            <div class="text-xs font-bold ${item.mistakes_count > 0 ? 'text-amber-600' : 'text-slate-800'}">
                                ${item.mistakes_count}
                            </div>
                        </div>
                    </div>

                    <!-- TOPIC PDF / STUDY MATERIALS CARD SECTION -->
                    <div class="mb-3.5 p-2.5 rounded-xl bg-blue-50/40 border border-blue-100/80">
                        <div class="flex items-center justify-between text-xs mb-1.5">
                            <span class="font-bold text-slate-700 flex items-center gap-1.5">
                                <i class="fas fa-file-pdf text-rose-500"></i> Topic Study PDF
                            </span>
                            <button onclick="triggerPlannerPdfUpload(${item.topic_id})" class="text-[11px] font-semibold text-blue-600 hover:text-blue-800">
                                + Upload PDF
                            </button>
                        </div>
                        ${primaryFile ? `
                            <div class="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-blue-200 shadow-xs">
                                <div class="flex items-center gap-2 overflow-hidden truncate cursor-pointer" onclick="viewPlannerTopicPdf(${item.topic_id}, 0)">
                                    <i class="${getFileIconClass(primaryFile.name, primaryFile.type)} flex-shrink-0"></i>
                                    <span class="font-medium text-xs text-slate-800 truncate">${escapeHtml(primaryFile.name)}</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <button onclick="viewPlannerTopicPdf(${item.topic_id}, 0)" class="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold">
                                        View
                                    </button>
                                    <button onclick="downloadPlannerTopicPdf(${item.topic_id}, 0)" class="p-1 text-slate-500 hover:text-slate-800">
                                        <i class="fas fa-download text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <div onclick="triggerPlannerPdfUpload(${item.topic_id})" class="text-center py-2 bg-white rounded-lg border border-dashed border-blue-200 hover:border-blue-400 cursor-pointer transition">
                                <span class="text-xs font-semibold text-blue-600"><i class="fas fa-cloud-upload-alt mr-1"></i> Attach Topic PDF from device</span>
                            </div>
                        `}
                    </div>

                    <!-- AI Diagnostic Explanation -->
                    <div class="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 leading-relaxed mb-4">
                        <i class="fas fa-lightbulb text-amber-500 mr-1.5"></i>
                        ${item.explanation}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button onclick="markRevisedDirect(${item.topic_id})" class="flex-1 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-check"></i> Revised Today
                    </button>
                    <button onclick="startTopicQuiz(${item.topic_id})" class="flex-1 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-play"></i> Test Knowledge
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Planner PDF upload and viewing handlers
function triggerPlannerPdfUpload(topicId) {
    state.activePlannerUploadTopicId = topicId;
    const input = document.getElementById("planner-pdf-upload-input");
    if (input) {
        input.value = "";
        input.click();
    }
}

async function handlePlannerPdfUpload(e) {
    if (!e.target || !e.target.files || !e.target.files.length) return;
    const topicId = state.activePlannerUploadTopicId;
    if (!topicId) return;

    const file = e.target.files[0];
    await processAndUploadPlannerPdf(file, topicId);
    e.target.value = "";
}

async function processAndUploadPlannerPdf(file, topicId) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
        showToast("File is too large (maximum 25MB).", "error");
        return;
    }

    try {
        const dataUrl = await readFileAsDataURL(file);
        const newPdf = {
            id: "pdf_" + Date.now(),
            name: file.name,
            size: file.size,
            type: file.type || "application/pdf",
            data: dataUrl,
            uploaded_at: new Date().toISOString()
        };

        const res = await apiRequest(`/planner/topics/${topicId}/pdf`, {
            method: "POST",
            body: JSON.stringify(newPdf)
        });

        showToast(res.message || `PDF '${file.name}' added to planner!`, "success");
        await loadPlanner(state.activePlannerFilter || "ALL");
        loadSubjects();
    } catch (err) {
        showToast("Error uploading PDF: " + err.message, "error");
    }
}

function handlePlannerDropzoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("bg-blue-100/70", "border-blue-400");
}

function handlePlannerDropzoneDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-blue-100/70", "border-blue-400");
}

async function handlePlannerDropzoneDrop(e, topicId) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-blue-100/70", "border-blue-400");

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        state.activePlannerUploadTopicId = topicId;
        await processAndUploadPlannerPdf(file, topicId);
    }
}

function viewPlannerTopicPdf(topicId, attachmentIdx = 0) {
    const item = (state.plannerRecommendations || []).find(p => p.topic_id === topicId);
    if (!item) return;

    let atts = item.attachments || [];
    if (typeof atts === "string") {
        try { atts = JSON.parse(atts); } catch(e) { atts = []; }
    }
    const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
    const targetFile = pdfFiles[attachmentIdx] || atts[attachmentIdx];

    if (!targetFile) {
        openTopicDetailsModal(topicId);
        return;
    }

    state.activeTopicDetails = {
        id: item.topic_id,
        title: item.title,
        attachments: atts
    };

    const realIdx = atts.indexOf(targetFile);
    previewTopicFile(realIdx >= 0 ? realIdx : 0);
}

function downloadPlannerTopicPdf(topicId, attachmentIdx = 0) {
    const item = (state.plannerRecommendations || []).find(p => p.topic_id === topicId);
    if (!item) return;

    let atts = item.attachments || [];
    if (typeof atts === "string") {
        try { atts = JSON.parse(atts); } catch(e) { atts = []; }
    }
    const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
    const targetFile = pdfFiles[attachmentIdx] || atts[attachmentIdx];
    if (!targetFile) return;

    const a = document.createElement("a");
    a.href = targetFile.data;
    a.download = targetFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${targetFile.name}`, "info");
}

async function markRevisedDirect(topicId) {
    try {
        const res = await apiRequest(`/planner/revise/${topicId}`, {
            method: "POST",
            body: JSON.stringify({ notes: "Completed revision session" })
        });
        showToast(res.message, "success");
        if (state.currentTab === "dashboard") loadDashboard();
        if (state.currentTab === "planner") loadPlanner();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// -------------------------------------------------------------------------
// 3. DIGITAL MEMORY & STUDY HISTORY
// -------------------------------------------------------------------------
async function loadMemorySessions() {
    const search = document.getElementById("session-search")?.value || "";
    const subjectId = document.getElementById("session-filter-subject")?.value || "";
    const difficulty = document.getElementById("session-filter-difficulty")?.value || "";

    let endpoint = `/sessions?search=${encodeURIComponent(search)}`;
    if (subjectId) endpoint += `&subject_id=${subjectId}`;
    if (difficulty) endpoint += `&difficulty=${difficulty}`;

    try {
        const res = await apiRequest(endpoint);
        const sessions = res.sessions;
        const tbody = document.getElementById("memory-sessions-tbody");
        if (!tbody) return;

        // Also populate subjects dropdown filter if empty
        await populateSubjectDropdowns();

        if (!sessions.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No study sessions matching filters.</td></tr>`;
            return;
        }

        tbody.innerHTML = sessions.map(s => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                <td class="py-3 px-4 font-semibold text-slate-900">${s.topic_title}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-xs text-white" style="background-color: ${s.subject_color}">
                        ${s.subject_name}
                    </span>
                </td>
                <td class="py-3 px-4 text-slate-600">${s.study_date}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.difficulty === 'Easy' ? 'badge-diff-easy' :
                        s.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                    }">${s.difficulty}</span>
                </td>
                <td class="py-3 px-4 text-slate-600">${s.duration_minutes} min</td>
                <td class="py-3 px-4 font-bold ${s.quiz_score >= 70 ? 'text-emerald-600' : s.quiz_score !== null ? 'text-rose-600' : 'text-slate-400 font-normal'}">
                    ${s.quiz_score !== null ? `${s.quiz_score}%` : '—'}
                </td>
                <td class="py-3 px-4 text-slate-600">${s.mistakes_count}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="deleteSession(${s.id})" class="text-rose-500 hover:text-rose-700 p-1 transition" title="Delete record">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (e) {
        showToast("Error loading memory sessions: " + e.message, "error");
    }
}

async function populateSubjectDropdowns() {
    try {
        const res = await apiRequest("/subjects");
        state.subjects = res.subjects;

        const filterSubject = document.getElementById("session-filter-subject");
        if (filterSubject && filterSubject.options.length <= 1) {
            filterSubject.innerHTML = '<option value="">All Subjects</option>' + 
                state.subjects.map(sub => `<option value="${sub.id}">${sub.name}</option>`).join("");
        }

        const modalSubject = document.getElementById("new-topic-subject");
        if (modalSubject) {
            modalSubject.innerHTML = state.subjects.map(sub => `<option value="${sub.id}">${sub.name}</option>`).join("");
        }

        // Populate topics dropdown in log session modal
        const topicsRes = await apiRequest("/topics");
        state.topics = topicsRes.topics;
        const sessionTopicSelect = document.getElementById("new-session-topic");
        if (sessionTopicSelect) {
            sessionTopicSelect.innerHTML = state.topics.map(t => `<option value="${t.id}">${t.title} (${t.subject_name})</option>`).join("");
        }
    } catch (e) {
        console.error(e);
    }
}

async function handleAddSessionSubmit(e) {
    e.preventDefault();
    const topic_id = parseInt(document.getElementById("new-session-topic").value);
    const study_date = document.getElementById("new-session-date").value;
    const duration_minutes = parseInt(document.getElementById("new-session-duration").value);
    const difficulty = document.getElementById("new-session-diff").value;
    const quiz_score_val = document.getElementById("new-session-score").value;
    const mistakes_count = parseInt(document.getElementById("new-session-mistakes").value) || 0;
    const revisions_count = parseInt(document.getElementById("new-session-revisions").value) || 0;
    const notes = document.getElementById("new-session-notes").value;

    const payload = {
        topic_id,
        study_date,
        duration_minutes,
        difficulty,
        quiz_score: quiz_score_val ? parseFloat(quiz_score_val) : null,
        mistakes_count,
        revisions_count,
        notes
    };

    try {
        const res = await apiRequest("/sessions", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        showToast(res.message, "success");
        closeModal("add-session-modal");
        loadMemorySessions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteSession(id) {
    if (!confirm("Are you sure you want to remove this study session from your digital memory?")) return;
    try {
        const res = await apiRequest(`/sessions/${id}`, { method: "DELETE" });
        showToast(res.message, "success");
        loadMemorySessions();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// -------------------------------------------------------------------------
// 4. SUBJECTS & TOPICS
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// File Attachment Utilities & Handlers
// -------------------------------------------------------------------------
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIconClass(filename, type) {
    const fn = (filename || "").toLowerCase();
    const tp = (type || "").toLowerCase();
    if (fn.endsWith(".pdf") || tp.includes("pdf")) return "fas fa-file-pdf text-rose-500";
    if (fn.endsWith(".doc") || fn.endsWith(".docx") || tp.includes("word")) return "fas fa-file-word text-blue-600";
    if (fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg") || fn.endsWith(".gif") || fn.endsWith(".webp") || tp.includes("image")) return "fas fa-file-image text-emerald-500";
    if (fn.endsWith(".txt") || fn.endsWith(".md") || tp.includes("text")) return "fas fa-file-alt text-amber-500";
    if (fn.endsWith(".py") || fn.endsWith(".js") || fn.endsWith(".html") || fn.endsWith(".css") || fn.endsWith(".json")) return "fas fa-file-code text-indigo-500";
    if (fn.endsWith(".zip") || fn.endsWith(".rar") || fn.endsWith(".tar") || fn.endsWith(".gz")) return "fas fa-file-archive text-yellow-600";
    if (fn.endsWith(".xls") || fn.endsWith(".xlsx") || fn.endsWith(".csv")) return "fas fa-file-excel text-teal-600";
    return "fas fa-file text-slate-500";
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function processSelectedFiles(files, targetArray, renderCallback) {
    for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
            showToast(`File ${file.name} is too large (max 20MB)`, "error");
            continue;
        }
        try {
            const dataUrl = await readFileAsDataURL(file);
            targetArray.push({
                id: "att_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                data: dataUrl,
                uploaded_at: new Date().toISOString()
            });
        } catch (e) {
            showToast("Failed to read " + file.name, "error");
        }
    }
    if (typeof renderCallback === "function") renderCallback();
}

function handleTopicFileDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById("topic-file-dropzone");
    if (el) el.classList.add("border-blue-500", "bg-blue-50/80");
}

function handleTopicFileDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById("topic-file-dropzone");
    if (el) el.classList.remove("border-blue-500", "bg-blue-50/80");
}

function handleTopicFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById("topic-file-dropzone");
    if (el) el.classList.remove("border-blue-500", "bg-blue-50/80");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        processSelectedFiles(e.dataTransfer.files, state.newTopicFiles, renderNewTopicFilesPreview);
    }
}

function handleTopicFileSelect(e) {
    if (e.target && e.target.files && e.target.files.length) {
        processSelectedFiles(e.target.files, state.newTopicFiles, renderNewTopicFilesPreview);
        e.target.value = "";
    }
}

function renderNewTopicFilesPreview() {
    const list = document.getElementById("topic-files-preview-list");
    if (!list) return;
    if (!state.newTopicFiles || !state.newTopicFiles.length) {
        list.innerHTML = "";
        return;
    }
    list.innerHTML = state.newTopicFiles.map((f, idx) => `
        <div class="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
            <div class="flex items-center gap-2 overflow-hidden">
                <i class="${getFileIconClass(f.name, f.type)} text-sm flex-shrink-0"></i>
                <div class="truncate">
                    <span class="font-medium text-slate-800">${escapeHtml(f.name)}</span>
                    <span class="text-[10px] text-slate-400 ml-1">(${formatFileSize(f.size)})</span>
                </div>
            </div>
            <button type="button" onclick="removeNewTopicFile(${idx})" class="text-slate-400 hover:text-rose-500 p-1 transition" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join("");
}

function removeNewTopicFile(idx) {
    state.newTopicFiles.splice(idx, 1);
    renderNewTopicFilesPreview();
}

function setSubjectsViewMode(mode) {
    state.subjectsViewMode = mode;
    const cardsContainer = document.getElementById("subjects-container");
    const tableContainer = document.getElementById("subjects-table-container");
    const cardsBtn = document.getElementById("subjects-view-cards-btn");
    const tableBtn = document.getElementById("subjects-view-table-btn");

    if (mode === "table") {
        if (cardsContainer) cardsContainer.classList.add("hidden");
        if (tableContainer) tableContainer.classList.remove("hidden");
        if (tableBtn) {
            tableBtn.className = "px-2.5 py-1.5 rounded-md bg-white shadow-xs text-blue-700 font-bold flex items-center gap-1.5 transition";
        }
        if (cardsBtn) {
            cardsBtn.className = "px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition";
        }
    } else {
        if (cardsContainer) cardsContainer.classList.remove("hidden");
        if (tableContainer) tableContainer.classList.add("hidden");
        if (cardsBtn) {
            cardsBtn.className = "px-2.5 py-1.5 rounded-md bg-white shadow-xs text-blue-700 font-bold flex items-center gap-1.5 transition";
        }
        if (tableBtn) {
            tableBtn.className = "px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition";
        }
    }
}

async function loadSubjects() {
    try {
        const res = await apiRequest("/subjects");
        state.subjects = res.subjects;
        const container = document.getElementById("subjects-container");
        if (!container) return;

        const topicsRes = await apiRequest("/topics");
        const allTopics = topicsRes.topics;

        // Fetch revision planner recommendations for status indicators if available
        let planMap = {};
        try {
            const planRes = await apiRequest("/planner/recommendations");
            (planRes.recommendations || []).forEach(r => {
                planMap[r.topic_id] = r;
            });
        } catch(e) {}

        // 1. Render Subject Cards View (with dedicated Topic PDF column in each card)
        container.innerHTML = state.subjects.map(sub => {
            const subTopics = allTopics.filter(t => t.subject_id === sub.id);
            return `
                <div class="card-soft rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm" style="background-color: ${sub.color}">
                                    ${sub.code ? sub.code.substring(0, 4) : sub.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-900">${sub.name}</h3>
                                    <p class="text-xs text-slate-500">${sub.code ? `${sub.code} • ` : ''}${subTopics.length} topic${subTopics.length === 1 ? '' : 's'}</p>
                                </div>
                            </div>
                            <button onclick="deleteSubject(${sub.id})" class="text-slate-400 hover:text-rose-500 transition p-1" title="Delete subject">
                                <i class="fas fa-trash-alt text-xs"></i>
                            </button>
                        </div>

                        ${sub.description ? `<p class="text-xs text-slate-600 mb-4">${sub.description}</p>` : ''}

                        <!-- Topics List with dedicated Topic PDF column -->
                        <div class="space-y-2.5 mt-4 pt-3 border-t border-slate-100">
                            ${subTopics.map(t => {
                                let atts = t.attachments || [];
                                if (typeof atts === "string") {
                                    try { atts = JSON.parse(atts); } catch(e) { atts = []; }
                                }
                                const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
                                const primaryFile = pdfFiles[0] || atts[0] || null;
                                const planItem = planMap[t.id];

                                return `
                                    <div class="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 transition text-xs border border-slate-100 flex flex-col gap-2">
                                        <!-- Header Row: Topic & Difficulty & Actions -->
                                        <div class="flex items-center justify-between">
                                            <div class="font-bold text-slate-900 hover:text-blue-600 cursor-pointer flex items-center gap-1.5" onclick="openTopicDetailsModal(${t.id})" title="Click to view full notes & files">
                                                <span>${escapeHtml(t.title)}</span>
                                            </div>
                                            <div class="flex items-center gap-1.5">
                                                ${planItem ? `
                                                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                                        planItem.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                                                        planItem.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                    }">${planItem.priority_badge}</span>
                                                ` : ''}
                                                <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                    t.difficulty === 'Easy' ? 'badge-diff-easy' :
                                                    t.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                                                }">${t.difficulty}</span>
                                                <button onclick="startTopicQuiz(${t.id})" class="text-blue-600 hover:text-blue-800 p-1" title="Quiz this topic">
                                                    <i class="fas fa-play"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Dedicated TOPIC PDF ROW / COLUMN -->
                                        <div class="pt-1.5 border-t border-slate-200/50 flex items-center justify-between gap-2"
                                             ondragover="handlePlannerDropzoneDragOver(event)"
                                             ondragleave="handlePlannerDropzoneDragLeave(event)"
                                             ondrop="handleSubjectCellDrop(event, ${t.id})">
                                            
                                            ${primaryFile ? `
                                                <div class="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-2 py-1 max-w-[190px] overflow-hidden truncate">
                                                    <i class="${getFileIconClass(primaryFile.name, primaryFile.type)} text-xs flex-shrink-0"></i>
                                                    <span class="font-medium text-[11px] text-slate-800 truncate cursor-pointer hover:text-blue-600" onclick="viewSubjectTopicPdf(${t.id}, 0)" title="${escapeHtml(primaryFile.name)} (Click to view)">
                                                        ${escapeHtml(primaryFile.name)}
                                                    </span>
                                                </div>
                                                <div class="flex items-center gap-1 flex-shrink-0">
                                                    <button onclick="viewSubjectTopicPdf(${t.id}, 0)" class="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Preview PDF">
                                                        <i class="fas fa-eye text-xs"></i>
                                                    </button>
                                                    <button onclick="downloadSubjectTopicPdf(${t.id}, 0)" class="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Download PDF">
                                                        <i class="fas fa-download text-xs"></i>
                                                    </button>
                                                    <button onclick="triggerSubjectTopicPdfUpload(${t.id})" class="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Add another PDF / Replace">
                                                        <i class="fas fa-plus text-[10px]"></i>
                                                    </button>
                                                </div>
                                            ` : `
                                                <button onclick="triggerSubjectTopicPdfUpload(${t.id})" class="text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-dashed border-blue-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition">
                                                    <i class="fas fa-file-upload text-blue-500"></i>
                                                    <span>+ Add Topic PDF</span>
                                                </button>
                                                <button onclick="openTopicDetailsModal(${t.id})" class="text-[10px] text-slate-400 hover:text-slate-600">
                                                    <i class="fas fa-sticky-note mr-0.5"></i> Notes
                                                </button>
                                            `}
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>

                    <button onclick="openAddTopicModal(${sub.id})" class="w-full mt-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-plus"></i> Add Topic
                    </button>
                </div>
            `;
        }).join("");

        // 2. Render Full Curriculum Table View (with explicit Topic Revision PDF Column)
        const tableBody = document.getElementById("subjects-table-tbody");
        if (tableBody) {
            tableBody.innerHTML = allTopics.map(t => {
                const sub = state.subjects.find(s => s.id === t.subject_id) || {};
                let atts = t.attachments || [];
                if (typeof atts === "string") {
                    try { atts = JSON.parse(atts); } catch(e) { atts = []; }
                }
                const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
                const primaryFile = pdfFiles[0] || atts[0] || null;
                const planItem = planMap[t.id];

                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3 px-3.5 whitespace-nowrap">
                            <span class="text-xs font-semibold px-2 py-0.5 rounded text-white" style="background-color: ${sub.color || '#2563eb'}">
                                ${escapeHtml(sub.name || 'General')}
                            </span>
                        </td>
                        <td class="py-3 px-3.5">
                            <div class="font-bold text-slate-900 text-xs hover:text-blue-600 cursor-pointer" onclick="openTopicDetailsModal(${t.id})">
                                ${escapeHtml(t.title)}
                            </div>
                        </td>
                        <td class="py-3 px-3.5 whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                                t.difficulty === 'Easy' ? 'badge-diff-easy' :
                                t.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                            }">${t.difficulty}</span>
                        </td>
                        <td class="py-3 px-3.5 whitespace-nowrap">
                            ${planItem ? `
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    planItem.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                                    planItem.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }">${planItem.priority_badge} (${planItem.retention_health_pct}%)</span>
                            ` : `
                                <span class="text-[10px] text-slate-400">Normal</span>
                            `}
                        </td>
                        <td class="py-3 px-3.5 max-w-xs truncate text-xs text-slate-500">
                            ${t.notes ? escapeHtml(t.notes) : '<span class="text-slate-300 italic">No notes</span>'}
                        </td>
                        <!-- TOPIC REVISION PDF COLUMN -->
                        <td class="py-3 px-3.5 bg-blue-50/40 border-x border-blue-100"
                            ondragover="handlePlannerDropzoneDragOver(event)"
                            ondragleave="handlePlannerDropzoneDragLeave(event)"
                            ondrop="handleSubjectCellDrop(event, ${t.id})">
                            
                            ${primaryFile ? `
                                <div class="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-blue-200 shadow-xs max-w-xs">
                                    <div class="flex items-center gap-1.5 overflow-hidden truncate cursor-pointer" onclick="viewSubjectTopicPdf(${t.id}, 0)" title="${escapeHtml(primaryFile.name)} (Click to view)">
                                        <i class="${getFileIconClass(primaryFile.name, primaryFile.type)} text-xs flex-shrink-0"></i>
                                        <span class="font-medium text-xs text-slate-900 truncate">${escapeHtml(primaryFile.name)}</span>
                                    </div>
                                    <div class="flex items-center gap-1 flex-shrink-0">
                                        <button onclick="viewSubjectTopicPdf(${t.id}, 0)" class="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Preview PDF">
                                            <i class="fas fa-eye text-xs"></i>
                                        </button>
                                        <button onclick="downloadSubjectTopicPdf(${t.id}, 0)" class="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Download">
                                            <i class="fas fa-download text-xs"></i>
                                        </button>
                                        <button onclick="triggerSubjectTopicPdfUpload(${t.id})" class="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Add / Replace PDF">
                                            <i class="fas fa-plus text-[10px]"></i>
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <div class="flex items-center gap-2">
                                    <button onclick="triggerSubjectTopicPdfUpload(${t.id})" class="px-2.5 py-1.5 rounded-lg border border-dashed border-blue-300 bg-white hover:bg-blue-50/80 text-blue-700 font-semibold text-[11px] flex items-center gap-1.5 transition shadow-xs">
                                        <i class="fas fa-file-upload text-blue-500"></i>
                                        <span>+ Add Topic PDF</span>
                                    </button>
                                </div>
                            `}
                        </td>
                        <td class="py-3 px-3.5 text-right whitespace-nowrap">
                            <div class="flex items-center justify-end gap-1.5">
                                <button onclick="startTopicQuiz(${t.id})" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold" title="Quiz this topic">
                                    <i class="fas fa-play mr-1"></i>Quiz
                                </button>
                                <button onclick="openTopicDetailsModal(${t.id})" class="p-1 text-slate-400 hover:text-slate-600" title="Topic Details">
                                    <i class="fas fa-folder-open text-xs"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        setSubjectsViewMode(state.subjectsViewMode || "cards");

    } catch (e) {
        showToast("Error loading subjects: " + e.message, "error");
    }
}

// Handlers for Subject Topic PDF upload and viewing
function triggerSubjectTopicPdfUpload(topicId) {
    state.activeSubjectPdfUploadTopicId = topicId;
    const input = document.getElementById("subject-topic-pdf-input");
    if (input) {
        input.value = "";
        input.click();
    }
}

async function handleSubjectTopicPdfUpload(e) {
    if (!e.target || !e.target.files || !e.target.files.length) return;
    const topicId = state.activeSubjectPdfUploadTopicId;
    if (!topicId) return;

    const file = e.target.files[0];
    await processAndUploadSubjectTopicPdf(file, topicId);
    e.target.value = "";
}

async function processAndUploadSubjectTopicPdf(file, topicId) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
        showToast("File is too large (maximum 25MB).", "error");
        return;
    }

    try {
        const dataUrl = await readFileAsDataURL(file);
        const newPdf = {
            id: "pdf_" + Date.now(),
            name: file.name,
            size: file.size,
            type: file.type || "application/pdf",
            data: dataUrl,
            uploaded_at: new Date().toISOString()
        };

        const res = await apiRequest(`/planner/topics/${topicId}/pdf`, {
            method: "POST",
            body: JSON.stringify(newPdf)
        });

        showToast(res.message || `Topic PDF '${file.name}' attached successfully!`, "success");
        loadSubjects();
        loadPlanner(state.activePlannerFilter || "ALL");
    } catch (err) {
        showToast("Error uploading PDF: " + err.message, "error");
    }
}

async function handleSubjectCellDrop(e, topicId) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-blue-100/70", "border-blue-400");

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        await processAndUploadSubjectTopicPdf(file, topicId);
    }
}

function viewSubjectTopicPdf(topicId, attachmentIdx = 0) {
    openTopicDetailsModal(topicId).then(() => {
        const topic = state.activeTopicDetails;
        if (!topic) return;
        let atts = topic.attachments || [];
        if (typeof atts === "string") {
            try { atts = JSON.parse(atts); } catch(e) { atts = []; }
        }
        const pdfFiles = atts.filter(f => (f.name || "").toLowerCase().endsWith(".pdf") || (f.type || "").includes("pdf"));
        const targetFile = pdfFiles[attachmentIdx] || atts[attachmentIdx];
        const realIdx = atts.indexOf(targetFile);
        previewTopicFile(realIdx >= 0 ? realIdx : 0);
    });
}

function downloadSubjectTopicPdf(topicId, attachmentIdx = 0) {
    openTopicDetailsModal(topicId).then(() => {
        downloadTopicFile(attachmentIdx);
    });
}

async function handleAddSubjectSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("new-subject-name").value;
    const code = document.getElementById("new-subject-code").value;
    const color = document.getElementById("new-subject-color").value;
    const description = document.getElementById("new-subject-desc").value;

    try {
        const res = await apiRequest("/subjects", {
            method: "POST",
            body: JSON.stringify({ name, code, color, description })
        });
        showToast(res.message, "success");
        closeModal("add-subject-modal");
        loadSubjects();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleAddTopicSubmit(e) {
    e.preventDefault();
    const subject_id = parseInt(document.getElementById("new-topic-subject").value);
    const title = document.getElementById("new-topic-title").value;
    const difficulty = document.getElementById("new-topic-diff").value;
    const notes = document.getElementById("new-topic-notes").value;
    const attachments = state.newTopicFiles || [];

    try {
        const res = await apiRequest("/topics", {
            method: "POST",
            body: JSON.stringify({ subject_id, title, difficulty, notes, attachments })
        });
        showToast(res.message, "success");
        closeModal("add-topic-modal");
        state.newTopicFiles = [];
        renderNewTopicFilesPreview();
        const notesEl = document.getElementById("new-topic-notes");
        if (notesEl) notesEl.value = "";
        const titleEl = document.getElementById("new-topic-title");
        if (titleEl) titleEl.value = "";
        loadSubjects();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function openAddTopicModal(subjectId = null) {
    populateSubjectDropdowns();
    if (subjectId) {
        const select = document.getElementById("new-topic-subject");
        if (select) select.value = subjectId;
    }
    state.newTopicFiles = [];
    renderNewTopicFilesPreview();
    openModal("add-topic-modal");
}

async function deleteSubject(id) {
    if (!confirm("Are you sure? Deleting this subject will remove all its topics and associated records.")) return;
    try {
        const res = await apiRequest(`/subjects/${id}`, { method: "DELETE" });
        showToast(res.message, "success");
        loadSubjects();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// -------------------------------------------------------------------------
// Topic Details & Files Modal Management
// -------------------------------------------------------------------------
async function openTopicDetailsModal(topicId) {
    try {
        const topicsRes = await apiRequest("/topics");
        const topic = (topicsRes.topics || []).find(t => t.id === topicId);
        if (!topic) {
            showToast("Topic not found", "error");
            return;
        }
        state.activeTopicDetails = topic;

        const titleEl = document.getElementById("topic-details-title");
        if (titleEl) titleEl.textContent = topic.title;

        const subBadge = document.getElementById("topic-details-subject");
        if (subBadge) {
            subBadge.textContent = topic.subject_name || "General";
            subBadge.style.backgroundColor = topic.subject_color || "#2563eb";
        }

        const diffBadge = document.getElementById("topic-details-difficulty");
        if (diffBadge) {
            diffBadge.textContent = topic.difficulty;
            diffBadge.className = `text-[10px] font-semibold px-2 py-0.5 rounded ${
                topic.difficulty === 'Easy' ? 'badge-diff-easy' :
                topic.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
            }`;
        }

        const notesView = document.getElementById("topic-details-notes-view");
        if (notesView) {
            notesView.textContent = topic.notes || "No initial notes provided for this topic.";
        }
        cancelEditTopicNotes();

        renderTopicDetailsFiles();
        openModal("topic-details-modal");
    } catch (e) {
        showToast("Error opening topic details: " + e.message, "error");
    }
}

function renderTopicDetailsFiles() {
    const topic = state.activeTopicDetails;
    if (!topic) return;

    let atts = topic.attachments || [];
    if (typeof atts === "string") {
        try { atts = JSON.parse(atts); } catch(e) { atts = []; }
    }
    topic.attachments = atts;

    const countEl = document.getElementById("topic-details-files-count");
    if (countEl) countEl.textContent = atts.length;

    const list = document.getElementById("topic-details-files-list");
    if (!list) return;

    if (!atts.length) {
        list.innerHTML = `
            <div class="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <i class="fas fa-folder-open text-slate-300 text-2xl mb-1"></i>
                <p class="text-xs text-slate-500 font-medium">No study files attached to this topic yet.</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Use the button above or drag & drop files from your laptop to attach.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = atts.map((f, idx) => `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-xs transition">
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                    <i class="${getFileIconClass(f.name, f.type)}"></i>
                </div>
                <div class="truncate">
                    <div class="font-medium text-xs text-slate-900 truncate" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
                    <div class="text-[10px] text-slate-400">${formatFileSize(f.size)} • ${f.uploaded_at ? f.uploaded_at.split('T')[0] : 'Uploaded'}</div>
                </div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
                <button onclick="previewTopicFile(${idx})" class="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded text-xs transition" title="Preview file">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="downloadTopicFile(${idx})" class="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded text-xs transition" title="Download to laptop">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="deleteTopicFile(${idx})" class="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded text-xs transition" title="Remove attachment">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join("");
}

function handleTopicDetailsDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById("topic-details-dropzone");
    if (el) el.classList.add("border-blue-500", "bg-blue-50/80");
}

function handleTopicDetailsDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById("topic-details-dropzone");
    if (el) el.classList.remove("border-blue-500", "bg-blue-50/80");
}

async function handleTopicDetailsDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById("topic-details-dropzone");
    if (el) el.classList.remove("border-blue-500", "bg-blue-50/80");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        await addFilesToCurrentTopic(e.dataTransfer.files);
    }
}

async function handleTopicDetailsAddFiles(e) {
    if (e.target && e.target.files && e.target.files.length) {
        await addFilesToCurrentTopic(e.target.files);
        e.target.value = "";
    }
}

async function addFilesToCurrentTopic(files) {
    const topic = state.activeTopicDetails;
    if (!topic) return;

    const newFiles = [];
    await processSelectedFiles(files, newFiles, () => {});
    if (!newFiles.length) return;

    topic.attachments = (topic.attachments || []).concat(newFiles);

    try {
        await apiRequest(`/topics/${topic.id}/attachments`, {
            method: "PUT",
            body: JSON.stringify({ attachments: topic.attachments })
        });
        showToast(`Added ${newFiles.length} file(s) to ${topic.title}`, "success");
        renderTopicDetailsFiles();
        loadSubjects();
    } catch (err) {
        showToast("Error updating attachments: " + err.message, "error");
    }
}

async function deleteTopicFile(idx) {
    const topic = state.activeTopicDetails;
    if (!topic || !confirm("Are you sure you want to remove this attached file?")) return;

    topic.attachments.splice(idx, 1);
    try {
        await apiRequest(`/topics/${topic.id}/attachments`, {
            method: "PUT",
            body: JSON.stringify({ attachments: topic.attachments })
        });
        showToast("File removed", "info");
        renderTopicDetailsFiles();
        loadSubjects();
    } catch (err) {
        showToast("Error removing file: " + err.message, "error");
    }
}

function downloadTopicFile(idx) {
    const topic = state.activeTopicDetails;
    if (!topic || !topic.attachments || !topic.attachments[idx]) return;
    const f = topic.attachments[idx];

    const a = document.createElement("a");
    a.href = f.data;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${f.name}`, "info");
}

function previewTopicFile(idx) {
    const topic = state.activeTopicDetails;
    if (!topic || !topic.attachments || !topic.attachments[idx]) return;
    const f = topic.attachments[idx];

    const titleEl = document.getElementById("preview-file-title");
    if (titleEl) titleEl.textContent = f.name;

    const iconEl = document.getElementById("preview-file-icon");
    if (iconEl) iconEl.className = getFileIconClass(f.name, f.type) + " text-lg";

    const dlBtn = document.getElementById("preview-download-btn");
    if (dlBtn) {
        dlBtn.href = f.data;
        dlBtn.download = f.name;
    }

    const bodyEl = document.getElementById("preview-file-body");
    if (!bodyEl) return;

    const fn = (f.name || "").toLowerCase();
    const tp = (f.type || "").toLowerCase();

    if (tp.startsWith("image/") || fn.endsWith(".png") || fn.endsWith(".jpg") || fn.endsWith(".jpeg") || fn.endsWith(".webp") || fn.endsWith(".gif")) {
        bodyEl.innerHTML = `
            <div class="flex items-center justify-center p-4 bg-slate-50 rounded-xl min-h-[300px]">
                <img src="${f.data}" alt="${escapeHtml(f.name)}" class="max-h-[60vh] max-w-full rounded-lg shadow-sm object-contain">
            </div>
        `;
    } else if (tp.includes("pdf") || fn.endsWith(".pdf")) {
        bodyEl.innerHTML = `
            <div class="w-full h-[60vh] rounded-xl overflow-hidden border border-slate-200">
                <iframe src="${f.data}" class="w-full h-full" frameborder="0"></iframe>
            </div>
        `;
    } else if (tp.startsWith("text/") || fn.endsWith(".txt") || fn.endsWith(".md") || fn.endsWith(".py") || fn.endsWith(".js") || fn.endsWith(".json") || fn.endsWith(".html") || fn.endsWith(".css")) {
        let textContent = "";
        try {
            if (f.data && f.data.includes(",")) {
                const b64 = f.data.split(",")[1];
                textContent = decodeURIComponent(escape(atob(b64)));
            } else {
                textContent = f.data || "";
            }
        } catch(e) {
            textContent = "Unable to decode text preview. Please use the Download button to view file.";
        }
        bodyEl.innerHTML = `
            <div class="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs max-h-[60vh] overflow-auto whitespace-pre-wrap leading-relaxed">
                ${escapeHtml(textContent)}
            </div>
        `;
    } else {
        bodyEl.innerHTML = `
            <div class="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                <i class="${getFileIconClass(f.name, f.type)} text-4xl mb-3"></i>
                <h5 class="font-bold text-sm text-slate-800">${escapeHtml(f.name)}</h5>
                <p class="text-xs text-slate-500 mt-1">${formatFileSize(f.size)} • Document format</p>
                <div class="mt-4">
                    <button onclick="downloadTopicFile(${idx})" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5">
                        <i class="fas fa-download"></i> Download to View on Laptop
                    </button>
                </div>
            </div>
        `;
    }

    openModal("file-preview-modal");
}

function enableEditTopicNotes() {
    const topic = state.activeTopicDetails;
    if (!topic) return;
    const viewEl = document.getElementById("topic-details-notes-view");
    const editEl = document.getElementById("topic-details-notes-edit");
    const inputEl = document.getElementById("topic-edit-notes-input");
    const btn = document.getElementById("edit-notes-btn");
    if (viewEl && editEl && inputEl) {
        inputEl.value = topic.notes || "";
        viewEl.classList.add("hidden");
        editEl.classList.remove("hidden");
        if (btn) btn.classList.add("hidden");
    }
}

function cancelEditTopicNotes() {
    const viewEl = document.getElementById("topic-details-notes-view");
    const editEl = document.getElementById("topic-details-notes-edit");
    const btn = document.getElementById("edit-notes-btn");
    if (viewEl && editEl) {
        viewEl.classList.remove("hidden");
        editEl.classList.add("hidden");
        if (btn) btn.classList.remove("hidden");
    }
}

async function saveEditTopicNotes() {
    const topic = state.activeTopicDetails;
    if (!topic) return;
    const inputEl = document.getElementById("topic-edit-notes-input");
    const newNotes = inputEl ? inputEl.value.trim() : "";

    topic.notes = newNotes;
    try {
        await apiRequest(`/topics/${topic.id}/notes`, {
            method: "PUT",
            body: JSON.stringify({ notes: newNotes })
        });
        showToast("Topic notes updated.", "success");
        const viewEl = document.getElementById("topic-details-notes-view");
        if (viewEl) viewEl.textContent = newNotes || "No initial notes provided for this topic.";
        cancelEditTopicNotes();
        loadSubjects();
    } catch(err) {
        showToast("Error updating notes: " + err.message, "error");
    }
}

function startTopicQuizFromModal() {
    const topic = state.activeTopicDetails;
    if (!topic) return;
    closeModal("topic-details-modal");
    startTopicQuiz(topic.id);
}

// -------------------------------------------------------------------------
// 5. QUIZ SYSTEM
// -------------------------------------------------------------------------
async function loadQuizCenter() {
    try {
        const res = await apiRequest("/quizzes/topics");
        const topics = res.topics;
        const container = document.getElementById("quiz-topics-grid");
        if (!container) return;

        container.innerHTML = topics.map(t => `
            <div class="card-soft rounded-xl p-5 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded text-white" style="background-color: ${t.subject_color}">
                            ${t.subject_name}
                        </span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full ${
                            t.difficulty === 'Easy' ? 'badge-diff-easy' :
                            t.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                        }">${t.difficulty}</span>
                    </div>

                    <h4 class="text-base font-bold text-slate-900 mb-2">${t.title}</h4>
                    
                    <div class="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100">
                        <span><i class="fas fa-question-circle mr-1"></i> ${t.question_count} question${t.question_count === 1 ? '' : 's'}</span>
                        <span>Latest: <strong class="${t.latest_score >= 70 ? 'text-emerald-600' : 'text-slate-800'}">${t.latest_score !== null ? `${t.latest_score}%` : 'Not taken'}</strong></span>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button onclick="startTopicQuiz(${t.id})" class="flex-1 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm">
                        <i class="fas fa-play"></i> Start Quiz
                    </button>
                    <button onclick="openAddQuestionModal(${t.id})" class="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition" title="Add Question">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join("");

        // Load Quiz History table
        loadQuizHistory();

    } catch (e) {
        showToast("Error loading quiz topics: " + e.message, "error");
    }
}

async function loadQuizHistory() {
    try {
        const res = await apiRequest("/quizzes/history");
        const attempts = res.attempts;
        const tbody = document.getElementById("quiz-history-tbody");
        if (!tbody) return;

        if (!attempts.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">No quiz attempts recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = attempts.map(a => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                <td class="py-3 px-4 font-semibold text-slate-800">${a.topic_title}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-xs text-white" style="background-color: ${a.subject_color}">
                        ${a.subject_name}
                    </span>
                </td>
                <td class="py-3 px-4 font-bold ${a.score >= 75 ? 'text-emerald-600' : 'text-rose-600'}">
                    ${a.score}%
                </td>
                <td class="py-3 px-4 text-slate-600">${a.correct_count} / ${a.total_questions}</td>
                <td class="py-3 px-4 text-amber-600 font-medium">${a.mistakes_count}</td>
                <td class="py-3 px-4 text-slate-500 text-xs">${a.taken_at}</td>
            </tr>
        `).join("");
    } catch (e) {
        console.error(e);
    }
}

async function startTopicQuiz(topicId) {
    try {
        const res = await apiRequest(`/quizzes/${topicId}/questions`);
        state.activeQuiz = {
            topic: res.topic,
            questions: res.questions
        };
        state.quizAnswers = {};

        if (!res.questions.length) {
            showToast("No questions available for this topic yet. Add questions first!", "warning");
            return;
        }

        renderActiveQuizModal();
    } catch (e) {
        showToast("Failed to start quiz: " + e.message, "error");
    }
}

function renderActiveQuizModal() {
    const modal = document.getElementById("quiz-taking-modal");
    if (!modal) return;

    document.getElementById("quiz-modal-topic-title").textContent = state.activeQuiz.topic.title;
    document.getElementById("quiz-modal-q-count").textContent = `${state.activeQuiz.questions.length} Questions`;

    const container = document.getElementById("quiz-questions-list");
    container.innerHTML = state.activeQuiz.questions.map((q, idx) => `
        <div class="p-5 rounded-xl border border-slate-200 bg-white mb-4">
            <div class="flex items-start gap-3 mb-3">
                <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    ${idx + 1}
                </span>
                <p class="font-medium text-slate-900 text-sm leading-snug">${q.question_text}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 ml-10">
                ${['A', 'B', 'C', 'D'].map(opt => `
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition text-xs text-slate-700">
                        <input type="radio" name="question_${q.id}" value="${opt}" onchange="selectQuizOption(${q.id}, '${opt}')" class="text-blue-600 focus:ring-blue-500 h-4 w-4">
                        <span class="font-bold text-slate-900">${opt}.</span>
                        <span>${q[`option_${opt.toLowerCase()}`]}</span>
                    </label>
                `).join("")}
            </div>
        </div>
    `).join("");

    // Hide results pane, show quiz pane
    document.getElementById("quiz-modal-questions-pane").classList.remove("hidden");
    document.getElementById("quiz-modal-results-pane").classList.add("hidden");
    document.getElementById("btn-submit-quiz").classList.remove("hidden");

    openModal("quiz-taking-modal");
}

function selectQuizOption(questionId, option) {
    state.quizAnswers[questionId] = option;
}

async function submitActiveQuiz() {
    const qCount = state.activeQuiz.questions.length;
    const answeredCount = Object.keys(state.quizAnswers).length;

    if (answeredCount < qCount) {
        if (!confirm(`You have only answered ${answeredCount} of ${qCount} questions. Submit anyway?`)) {
            return;
        }
    }

    try {
        const res = await apiRequest(`/quizzes/${state.activeQuiz.topic.id}/attempt`, {
            method: "POST",
            body: JSON.stringify({ answers: state.quizAnswers })
        });

        // Show Results Pane inside the modal
        renderQuizResults(res);
        showToast(`Quiz completed! Score: ${res.score}%`, res.score >= 70 ? "success" : "info");
    } catch (e) {
        showToast("Error submitting quiz: " + e.message, "error");
    }
}

function renderQuizResults(result) {
    document.getElementById("quiz-modal-questions-pane").classList.add("hidden");
    document.getElementById("btn-submit-quiz").classList.add("hidden");
    
    const resultsPane = document.getElementById("quiz-modal-results-pane");
    resultsPane.classList.remove("hidden");

    // Score header
    document.getElementById("quiz-res-score").textContent = `${result.score}%`;
    document.getElementById("quiz-res-stats").textContent = `${result.correct_count} correct • ${result.mistakes_count} mistakes out of ${result.total_questions} questions`;
    
    const badge = document.getElementById("quiz-res-badge");
    if (result.score >= 70) {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800";
        badge.textContent = "Proficient / Well Retained";
    } else {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800";
        badge.textContent = "Revision Recommended";
    }

    // Detailed question-by-question review with explanations
    const reviewList = document.getElementById("quiz-res-review-list");
    reviewList.innerHTML = result.detailed_results.map((r, idx) => `
        <div class="p-4 rounded-xl border ${r.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'} mb-3">
            <div class="flex items-start justify-between gap-2 mb-2">
                <span class="font-bold text-xs ${r.is_correct ? 'text-emerald-700' : 'text-rose-700'}">
                    Question ${idx + 1} • ${r.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span class="text-xs text-slate-500">Your answer: <strong>${r.student_answer || 'None'}</strong> | Correct: <strong>${r.correct_answer}</strong></span>
            </div>
            <p class="text-sm font-medium text-slate-900 mb-2">${r.question_text}</p>
            <div class="text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                <strong class="text-slate-900"><i class="fas fa-info-circle text-blue-500 mr-1"></i> Explanation:</strong> ${r.explanation}
            </div>
        </div>
    `).join("");

    // Refresh underlying data
    if (state.currentTab === "quizzes") loadQuizHistory();
}

function openAddQuestionModal(topicId) {
    document.getElementById("custom-q-topic-id").value = topicId;
    openModal("add-question-modal");
}

async function handleAddQuestionSubmit(e) {
    e.preventDefault();
    const topic_id = parseInt(document.getElementById("custom-q-topic-id").value);
    const question_text = document.getElementById("custom-q-text").value;
    const option_a = document.getElementById("custom-q-a").value;
    const option_b = document.getElementById("custom-q-b").value;
    const option_c = document.getElementById("custom-q-c").value;
    const option_d = document.getElementById("custom-q-d").value;
    const correct_option = document.getElementById("custom-q-correct").value;
    const explanation = document.getElementById("custom-q-expl").value;

    try {
        const res = await apiRequest(`/quizzes/${topic_id}/questions`, {
            method: "POST",
            body: JSON.stringify({ question_text, option_a, option_b, option_c, option_d, correct_option, explanation })
        });
        showToast(res.message, "success");
        closeModal("add-question-modal");
        loadQuizCenter();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// -------------------------------------------------------------------------
// 6. MACHINE LEARNING MODEL LAB
// -------------------------------------------------------------------------
async function loadMLLab() {
    try {
        const res = await apiRequest("/ml/status");
        
        // Metadata
        document.getElementById("ml-sample-count").textContent = res.training_sample_count;
        document.getElementById("ml-last-trained").textContent = res.last_trained_at || "Just now";

        // Metrics Table
        const metrics = res.model_comparison;
        const tbody = document.getElementById("ml-metrics-tbody");
        if (tbody) {
            const models = [
                { id: "logistic_regression", name: "Logistic Regression (Baseline)" },
                { id: "random_forest", name: "Random Forest Classifier (Ensemble)" },
                { id: "gradient_boosting", name: "Gradient Boosting (XGBoost Equiv.)" }
            ];

            tbody.innerHTML = models.map(m => {
                const met = metrics[m.id] || {};
                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                        <td class="py-3 px-4 font-semibold text-slate-800">${m.name}</td>
                        <td class="py-3 px-4 font-bold text-blue-600">${met.accuracy !== undefined ? (met.accuracy * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 text-slate-700">${met.precision !== undefined ? (met.precision * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 text-slate-700">${met.recall !== undefined ? (met.recall * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 font-semibold text-emerald-600">${met.f1_score !== undefined ? (met.f1_score * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 text-slate-500 text-xs">${met.test_samples || 0} samples</td>
                    </tr>
                `;
            }).join("");
        }

        // Feature Importance Bars
        const featContainer = document.getElementById("ml-feature-importance-bars");
        if (featContainer && res.feature_importance.random_forest) {
            const rfImp = res.feature_importance.random_forest;
            const friendlyNames = {
                days_since_last_study: "Days Elapsed Since Study",
                latest_quiz_score: "Latest Quiz Score",
                mistakes_count: "Recorded Mistakes Count",
                revisions_count: "Prior Revisions Completed",
                study_duration_minutes: "Study Session Duration",
                difficulty_level: "Topic Difficulty Rating"
            };

            const sortedFeats = Object.entries(rfImp).sort((a, b) => b[1] - a[1]);
            const maxVal = sortedFeats[0][1] || 1;

            featContainer.innerHTML = sortedFeats.map(([fName, val]) => {
                const pct = Math.round((val / maxVal) * 100);
                return `
                    <div class="mb-3">
                        <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>${friendlyNames[fName] || fName}</span>
                            <span>${(val * 100).toFixed(1)}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join("");
        }

    } catch (e) {
        showToast("Error loading ML Lab: " + e.message, "error");
    }
}

async function retrainModels() {
    try {
        showToast("Retraining ML models on dataset...", "info");
        const res = await apiRequest("/ml/train", { method: "POST" });
        showToast(res.message, "success");
        loadMLLab();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// Live ML Sandbox Inference
async function runMLSandboxPrediction() {
    const days = parseFloat(document.getElementById("sb-days").value);
    const score = parseFloat(document.getElementById("sb-score").value);
    const mistakes = parseInt(document.getElementById("sb-mistakes").value);
    const revisions = parseInt(document.getElementById("sb-revisions").value);
    const duration = parseInt(document.getElementById("sb-duration").value);
    const difficulty = parseInt(document.getElementById("sb-difficulty").value);

    // Update label displays
    document.getElementById("sb-days-val").textContent = `${days} days`;
    document.getElementById("sb-score-val").textContent = `${score}%`;
    document.getElementById("sb-mistakes-val").textContent = mistakes;
    document.getElementById("sb-revisions-val").textContent = revisions;

    try {
        const res = await apiRequest("/ml/predict", {
            method: "POST",
            body: JSON.stringify({
                days_since_last_study: days,
                latest_quiz_score: score,
                mistakes_count: mistakes,
                revisions_count: revisions,
                study_duration_minutes: duration,
                difficulty_level: difficulty
            })
        });

        const r = res.result;
        const resultCard = document.getElementById("sb-result-card");
        resultCard.classList.remove("hidden");

        const probaPct = Math.round(r.consensus_forgetting_probability * 100);
        document.getElementById("sb-res-prob").textContent = `${probaPct}%`;
        
        const badge = document.getElementById("sb-res-badge");
        if (r.predicted_needs_revision) {
            badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800";
            badge.textContent = "Needs Revision (High Forgetting Risk)";
        } else {
            badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800";
            badge.textContent = "Retained in Memory";
        }

        // Breakdown table
        const b = r.model_breakdown;
        document.getElementById("sb-res-breakdown").innerHTML = `
            <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-600">Logistic Regression</span>
                <strong>${(b.logistic_regression.probability * 100).toFixed(1)}% (${b.logistic_regression.prediction})</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-600">Random Forest</span>
                <strong>${(b.random_forest.probability * 100).toFixed(1)}% (${b.random_forest.prediction})</strong>
            </div>
            <div class="flex justify-between py-1">
                <span class="text-slate-600">Gradient Boosting</span>
                <strong>${(b.gradient_boosting.probability * 100).toFixed(1)}% (${b.gradient_boosting.prediction})</strong>
            </div>
        `;

        // Risk factors
        const riskUl = document.getElementById("sb-res-risks");
        riskUl.innerHTML = r.risk_factors.map(rf => `<li class="flex items-center gap-1.5"><i class="fas fa-arrow-right text-rose-500 text-[10px]"></i> ${rf}</li>`).join("");

    } catch (e) {
        console.error(e);
    }
}

// -------------------------------------------------------------------------
// 7. PROFILE & SETTINGS
// -------------------------------------------------------------------------
async function loadProfile() {
    if (!state.student) return;
    document.getElementById("prof-name").value = state.student.name || "";
    document.getElementById("prof-email").value = state.student.email || "";
    document.getElementById("prof-goals").value = state.student.study_goals || "";
    document.getElementById("prof-target-min").value = state.student.daily_target_minutes || 60;
    document.getElementById("prof-subjects").value = state.student.subjects_interest || "";
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("prof-name").value;
    const study_goals = document.getElementById("prof-goals").value;
    const daily_target_minutes = parseInt(document.getElementById("prof-target-min").value);
    const subjects_interest = document.getElementById("prof-subjects").value;

    try {
        const res = await apiRequest("/auth/profile", {
            method: "PUT",
            body: JSON.stringify({ name, study_goals, daily_target_minutes, subjects_interest })
        });
        showToast(res.message, "success");
        state.student.name = name;
        state.student.study_goals = study_goals;
        state.student.daily_target_minutes = daily_target_minutes;
        state.student.subjects_interest = subjects_interest;
        renderAuthenticatedApp();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// -------------------------------------------------------------------------
// MODAL HELPERS
// -------------------------------------------------------------------------
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("hidden");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("hidden");
}

function openAddSessionModal() {
    populateSubjectDropdowns();
    document.getElementById("new-session-date").value = new Date().toISOString().split("T")[0];
    openModal("add-session-modal");
}
