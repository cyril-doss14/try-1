Jenkins Pipeline has been built. 

Any update done to the platform would be dockerized. 

And the updated docker image would be pushed to the dockerhub repository.
________________________________________________________________________________________________________________________________________________________________

Development Execution Guidance:

If nodemon not installed already then install it using the command :

 -  npm install -g nodemon 

To Run both backend and frontend concurrently run this command in the root folder (Startup-app):

 - npm install concurrently --save-dev

If required run this command inside the frontend folder (awt_cw/Startup-app/frontend):

 - npm install

Finally inside the Startup-app folder run the following command to start backend and frontend concurrently:

 - npm start
