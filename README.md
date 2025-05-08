...............................To run the proj:........................................
1. Clone the Repo
   git clone https://github.com/yourusername/powerpath.git
   cd powerpath
2. Install Dependencies
   split the terminal 1) cd server                     2)cd ..               3) cd..
                         npm i                           cd client              cd ml
                         node server.js                  npm i                  uvicorn api:app --reload
                        (start with port 5000)

   then go to 2nd terminal nd type npm start ....it will start with localhost 3000
                          
.............................................overview........................................

PowerPath is an intelligent system designed to optimize the routes and locate electric vehicle (EV) charging stations along the way. 
It helps EV owners navigate efficiently and find nearby charging stations, ensuring they can reach their destinations without running out of battery.

...............................................Features.......................................

a) Route Optimization: Computes the shortest and most efficient route between a start and end point, considering road conditions and EV battery range.
b) Charging Station Locator: Locates nearby charging stations along the route to ensure that you never run out of charge.
c) Battery Health Prediction: Uses machine learning models to predict the state of health (SOH) of the battery, offering insights into the battery's remaining life.
d) Real-Time Data: Fetches real-time data from EV charging station APIs and OpenRouteService to suggest optimal routes and available charging stations.

.......................................................Architecture..............................
PowerPath consists of three main components:
1) Frontend (Client):Built with React, it provides a user-friendly interface for users to interact with the system.
2) Backend (Server):Built with Node.js and Express, it handles API requests, user authentication, and data processing.
3) Machine Learning (ML):Built with FastAPI and TensorFlow/Keras, it predicts battery health and processes optimization data for the route.

...................................................Tech Stack......................................
1) Frontend: React.js
2) Backend: Node.js, Express.js, MongoDB
3) Machine Learning: FastAPI, TensorFlow, Keras
4) APIs: OpenRouteService, OpenChargeMap

