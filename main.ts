import { createApp } from "./src/app";

createApp({
  con(e: EventListener) {
    console.log(e);
  },
}).mount("#app");
