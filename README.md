# CoralResearch

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.1.

## Dev Environment

### Proxy Config
This project uses proxy configuration for enabling cookies security. The proxy configuration is updated in angular.json file and you don't need to run any additional command for proxy. You just run the project with ng serve. 

### Envionment Setup 
The environment.development.ts file have 2 entries for backend url. Both are already explained there for local and live backend use as needed you can switch to target backend and just run the project and it will automatically update the proxy configuration for cookies. For now it has port 5 mentioned for running so remember to serve the project over port 4200 in your local environment and if you are using any different port then you need to update the port in environment.development.ts file. 

### Backend Connection
Also for now the local backend getting connected is having IP for Pankaj Phour laptop so if you're connecting with any other developer's backend then you need to replace the target value inside the proxy.conf.json with the developer's system IP. 
