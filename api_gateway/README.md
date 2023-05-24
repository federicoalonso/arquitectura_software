# Api Gateway

## Introduction

This is an API Gateway built with Node.js that provides a unified interface to multiple microservices. It acts as a reverse proxy that receives requests from clients and forwards them to the appropriate microservice. The API Gateway is responsible for handling authentication and authorization, rate limiting, logging, and other cross-cutting concerns.

## Installation

* Clone the repository

```bash
git clone https://github.com/your-username/api-gateway-node.git
```

* Navigate to the project directory

```bash
cd api-gateway-node
```

* Copy the example configuration file
```bash
cp config.ex.json config.json
```

* Install dependencies

```bash
npm install
```

* Create a configuration file config.json in the root directory of the project. The configuration file should define the microservices and their routes that the API Gateway will proxy to. An example configuration file has been provided in the project's root directory.

* Start the server

```bash
npm start
```

The API Gateway will now be running on port 5100. You can send HTTP requests to the API Gateway and it will forward them to the appropriate microservice based on the configuration file.

## Structure

The project is structured as follows:

root: The root directory of the project, contains the index and the configuration file.

|-- handlers: Contains the route handlers for the API Gateway.

|-- middleware: Contains the log middleware for the API Gateway.

* **config.json**: The configuration file that defines the microservices and their routes that the API Gateway will proxy to.
* **config.ex.json**: An example configuration file that defines the microservices and their routes that the API Gateway will proxy to.
* **index.js**: The entry point of the application. It defines the Express application and sets up the middleware.
* **routeHandler.js**: Defines the routes dynamically for the API Gateway.

## Explanation of the Code and Packages Used

The API Gateway is built with Node.js and Express. The following packages are used:

1. **express**: A popular Node.js web framework used to build web applications and APIs. It provides a simple, yet powerful set of features for building robust web applications and APIs.
1. **body-parser**: A middleware for parsing request bodies in the middleware stack. In this case, it's used to parse JSON bodies. It makes possible to receive a body object in Application/json, send it and receive it.
1. **helmet**: A security middleware for setting HTTP headers that protect against common security vulnerabilities. These headers can help protect the API from certain web vulnerabilities, such as cross-site scripting (XSS), clickjacking, and cross-site request forgery (CSRF).
The helmet module is a collection of middleware functions that set various HTTP headers to improve the security of the API. The app.use function adds the helmet middleware to the API's request pipeline, so that every incoming request will pass through it and the headers will be added to the response.
In summary, by adding the helmet middleware to an API, it can help improve its overall security posture by adding additional protection to the response headers.
1. **cors**: A middleware that enables Cross-Origin Resource Sharing (CORS) for the API, which is necessary when the API is consumed from different domains.
1. **passport**: A popular middleware for handling authentication in Node.js. It provides an easy-to-use and flexible authentication framework that can be used with various authentication strategies.
1. **express-rate-limit**: A middleware for rate limiting requests to an API. It limits the number of requests that can be made to the API by a single IP address during a specified time window.
1. **express-session**: A middleware for managing user sessions in Node.js. It enables the server to store session data for a user and associate it with a session ID.

The code defines an Express application, sets up the necessary middleware, and creates route handlers for each route defined in the configuration file. When a request comes in, the API Gateway checks if authentication is required for that route. If so, it sends a permission request to the authentication microservice to verify that the user has the necessary permissions. If the user is authenticated and authorized, the API Gateway forwards the request to the appropriate microservice and returns the response to the client. If an error occurs, the API Gateway returns an error response to the client.

In the index.js we have:

```js
// Add security headers with helmet
app.use(helmet());
```
The code app.use(helmet()); adds security headers to the HTTP response of your application by using the helmet middleware. Helmet is a collection of 14 smaller middleware functions that set HTTP headers to improve the security of your application. These headers can help to mitigate certain types of attacks such as cross-site scripting (XSS), clickjacking, and more.

Some of the headers that are set by helmet include:

- **X-Content-Type-Options**: prevents the browser from automatically detecting the content type of a response, which can help to mitigate certain types of attacks such as XSS.
- **X-XSS-Protection**: enables the Cross-Site Scripting (XSS) filter built into most modern web browsers.
- **Strict-Transport-Security**: tells the browser to always use HTTPS for all requests to the domain.
- **X-Frame-Options**: prevents clickjacking by restricting the domains that are allowed to embed the page.
- **Content-Security-Policy**: helps to prevent cross-site scripting (XSS) and other code injection attacks by specifying the allowed sources of content that the browser can load.

By adding the helmet middleware to your Express application, you can ensure that these security headers are set for every request, which can help to improve the overall security of your application.

```js
// Enable CORS
const corsOptions = config.cors[env].corsOptions;

app.use(cors(corsOptions));
```

The code you provided enables CORS (Cross-Origin Resource Sharing) by using the cors middleware. CORS is a security feature implemented by web browsers to prevent web pages from making requests to a different domain than the one that served the page. By default, web browsers block such requests to protect users from malicious activities such as cross-site scripting attacks.

The cors options are loaded from the config.json file:

```json
{
    "cors": {
      "development": {
        "corsOptions": {
          "origin": "*",
          "methods": "GET,PUT,POST,DELETE"
        }
      },
      "production": {
        "corsOptions": {
          "origin": ["https://dashboard.kapacite.com", "https://download.kapacite.com"],
          "methods": ["GET", "PUT", "POST", "DELETE"]
        }
      }
    },
}
```

The corsOptions object specifies the allowed origins and methods for CORS requests. In development, you have allowed all origins and the HTTP methods GET, PUT, POST, and DELETE. In production, you have specified two specific origins (https://dashboard.kapacite.com and https://download.kapacite.com) and the same HTTP methods.

Using cors(corsOptions) applies the CORS policy to all routes of the application. The corsOptions object is created based on the current environment variable env. In your case, it selects the configuration object for either development or production depending on the environment.

```js
// Add rate limiting
const limiter = rateLimit({
    windowMs: config.limiter.duration, 
    max: config.limiter.max,
    message: config.limiter.message
});
  
app.use(limiter);
```

This section adds rate limiting to the Express app using the rate-limit middleware. Rate limiting is a technique used to prevent abuse of an API or website by limiting the number of requests a user or IP address can make during a certain period of time.

The rateLimit() function takes an options object with three properties:

- **windowMs**: The time window in milliseconds during which the max number of requests can be made.
- **max**: The maximum number of requests that can be made during the windowMs time window.
- **message**: The message to return when a request exceeds the rate limit.

In this case, the windowMs and max options are read from the config file, which allows for easy configuration of the rate limit duration and maximum number of requests.

The limiter middleware created by rateLimit() is then added to the Express app using app.use(limiter). This ensures that every incoming request will be checked against the rate limit before being processed by other middleware or route handlers.

```js
// Add session support with express-session middleware
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
```
- **express-session**: This is a middleware that enables server-side sessions for your application. A session is a way to store information across multiple requests from the same client. This middleware takes an object with some configuration options:
    - **secret**: A string that is used to sign the session ID cookie. It should be a long, random, and complex string to prevent attackers from guessing or brute-forcing it.
    - **resave**: A boolean that controls whether to save the session even if it wasn't modified during the request. Setting it to false improves performance and reduces the risk of race conditions.
    - **saveUninitialized**: A boolean that controls whether to save a new and uninitialized session. Setting it to false prevents empty sessions from being saved.

- **passport.initialize() and passport.session()**: These are middleware that integrate Passport.js with Express. Passport is a popular library for handling user authentication and authorization in Node.js applications. The initialize() middleware sets up Passport and adds it to the req object as a property, while the session() middleware sets up Passport to use sessions for authentication persistence.

## Restrictions

It is important to note that the routes defined in the microservices should be different from the routes defined in the configuration file. This is because the API Gateway uses the upstream route to determine which microservice to forward the request to. If two microservices have the same upstream route, there will be a conflict and the API Gateway will not know which microservice to forward the request to. Therefore, it is recommended to use a unique upstream route for each microservice.