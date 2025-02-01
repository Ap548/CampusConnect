import { defineStore } from "pinia";


export const useStore = defineStore("main", {
  state: () => ({
    snackbar: {
      show: false,
      message: "",
      color: "success",
    },
  }),
  actions: {
    showSnackbar({ message, color = "success" }) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  },
});
