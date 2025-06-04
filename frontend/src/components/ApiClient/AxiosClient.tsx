/* eslint-disable react-refresh/only-export-components */
import axios from "axios";

export default axios.create({
    baseURL: "http://localhost:5001/blog",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});