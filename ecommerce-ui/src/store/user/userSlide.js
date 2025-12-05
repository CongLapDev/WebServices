import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import APIBase from "../../api/ApiBase";

export const fetchUser = createAsyncThunk(
    "user/fetchUser",
    async (data, { rejectWithValue }) => {
        const response = await APIBase.get(`/api/v1/auth/user`);
        return response.data;
    }
);
export const logoutUser = createAsyncThunk(
    "user/logout",
    async (data, { rejectWithValue }) => {
        const response = await APIBase.get(`/logout`);
        return response.data;
    }
);
export const refreshToken = createAsyncThunk(
    "user/refresh",
    async (data, { rejectWithValue }) => {
        const response = await APIBase.get(`/refresh`);
        return response.data;
    }
)
export const userSlide = createSlice({
    initialState: null,
    name: "user",
    reducers: {
        clear: (state, action) => {
            return null;
        },
        create: (state, action) => {
            return action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {
                state = action.payload;
                return state;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                return state;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state = null;
                return state;
            });
    },
});
