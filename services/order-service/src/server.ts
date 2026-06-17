import { createOrderApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const kitchenServiceUrl = process.env.KITCHEN_SERVICE_URL;
const app = createOrderApp({ kitchenServiceUrl });

app.listen(port, () => {
  console.log(`order-service running on port ${port}`);
});
