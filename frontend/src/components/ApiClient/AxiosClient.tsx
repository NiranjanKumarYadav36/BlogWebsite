/* eslint-disable react-refresh/only-export-components */
import axios from "axios";

export default axios.create({
    baseURL: "https://blogwebsitebackend-nn5u.onrender.com/blog",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});