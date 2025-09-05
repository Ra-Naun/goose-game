import http from "http";

const options = {
  host: "0.0.0.0",
  port: process.env.PORT || 3000,
  timeout: 5000,
};

const healthCheck = http.request(options, (res) => {
  const isOk = res.statusCode >= 200 && res.statusCode < 400;
  console.log(`HEALTHCHECK STATUS IS OK: ${isOk}`);
  if (isOk) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on("error", function (err) {
  console.error(`ERROR ${err}`);
  process.exit(1);
});

healthCheck.end();
