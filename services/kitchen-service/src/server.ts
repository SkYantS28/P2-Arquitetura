import { createKitchenApp } from "./app.js";

const port = Number(process.env.PORT ?? 3002);
const app = createKitchenApp();

app.listen(port, () => {
  console.log(`kitchen-service running on port ${port}`);
});
