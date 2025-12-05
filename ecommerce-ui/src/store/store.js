import { configureStore } from "@reduxjs/toolkit";
import { userSlide } from "./user/userSlide.js";
import { userAddress } from "./address/addressSlide.js";

export const store = configureStore({
    reducer: {
        user: userSlide.reducer,
        userAddress: userAddress.reducer,
    },
});
