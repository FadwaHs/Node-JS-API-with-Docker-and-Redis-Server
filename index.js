const express = require('express')
const axios = require('axios')
const redis = require('redis')

// Creating an instance of the express application : Express is a popular web application framework for Node.js 
const app = express()

const PORT = process.env.PORT || 9000
const REDIS_PORT = process.env.REDIS_PORT || 6379

// // Creating a Redis client instance
const client = redis.createClient(REDIS_PORT)

client.on('connect', () => console.log(`Redis is connected on port ${REDIS_PORT}`))
client.on("error", (error) => console.error(error))

// // Creating a GET route for the API to fetch user data
app.get('/api/v1/users/:username', (req, res) => {
  try {

     // Extracting the username from the URL parameter
    const username = req.params.username

    client.get(username, async (err, cache_data) => {
      if (cache_data) { // if data is found in cache, return it directly

        return res.status(200).send({
          message: `Retrieved ${username}'s data from the cache`,
          users: JSON.parse(cache_data)
        })
      } else {
        // else fetch data from API, store it in Redis cache, and return
        const api = await axios.get(`https://jsonplaceholder.typicode.com/users/?username=${username}`)
        client.setex(username, 1440, JSON.stringify(api.data))
        return res.status(200).send({
          message: `Retrieved ${username}'s data from the server`,
          users: api.data
        })
      }
    })
  } catch (error) {
    console.log(error)
  }
})

// Starting the server and listening for requests on the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = app
