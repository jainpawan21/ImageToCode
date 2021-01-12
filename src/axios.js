import axios from "axios";

const instance = axios.create({
  baseURL: "https://imagetocode.herokuapp.com/",
});

export default instance;
