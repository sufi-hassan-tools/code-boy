export default {
  apps: [{
    name: "moohaar-backend",
    script: "./src/server.js",
    watch: true,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
};
