
import { defineStore } from "pinia";


export const useStore = defineStore("main", {
  state: () => ({
    snackbar: {
      show: false,
      message: "",
      color: "success",
      action: null,




    },
  }),
  actions: {
    showSnackbar({ message, color = "success", action=null }) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.action=action;
      this.snackbar.show = true;
    }
  },
  setSnackbarVisibility(value) {
    this.snackbar.show = value;
  },

})
