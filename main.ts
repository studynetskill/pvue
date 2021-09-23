import { createApp } from "./src/app";

createApp({
  list: [
    { id: 1, text: "bar" },
    { id: 2, text: "boo" },
    { id: 3, text: "baz" },
    { id: 4, text: "bazz" },
  ],
}).mount("#app");
