import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import APIBase from "../../api/ApiBase";
import { notification } from "antd";
export const findAllByUserId = createAsyncThunk(
    'user/address/findAllByUserId',
    async (data, { rejectWithValue }) => {
        const response = await APIBase.get(`api/v1/user/${data.userId}/address`);
        return response.data;
    }
)
export const postNewUserAddress = createAsyncThunk(
    'user/address/postNewUserAddress',
    async (data, { rejectWithValue }) => {
        const response = await APIBase.post(`api/v1/user/address`, data)
        return response.data;
    }
)
export const deleteUserAddress = createAsyncThunk(
    'user/address/deleteAddress',
    async (data, { rejectWithValue }) => {
        const response = await APIBase.delete(`api/v1/user/${data.userId}/address/${data.addressId}`);
        return response.data;
    }
)
export const setDefaultUserAddress = createAsyncThunk(
    'user/address/default',
    async (data, { rejectWithValue }) => {
        const response = await APIBase.put(`api/v1/user/${data.userId}/address/${data.addressId}/default`);
        return response.data;
    }
)
export const userAddress = createSlice({
    name: "userAddress",
    initialState: [],
    reducers: {
        clear: (state, action) => {
            return [];
        }
    }
    ,
    extraReducers: (builder) => {
        builder
            .addCase(deleteUserAddress.fulfilled, (state, action) => state.filter(item => item.address.id !== action.payload.addressId))
            .addCase(findAllByUserId.fulfilled, (state, action) => action.payload)
            .addCase(postNewUserAddress.fulfilled, (state, action) => {
                notification.success({
                    message: "Success",
                    description: ""
                });
                return [...state, action.payload]
            })
            .addCase(postNewUserAddress.rejected, (state, action) => {
                notification.error({
                    message: "Error"
                });
            })
            .addCase(setDefaultUserAddress.fulfilled, (state, action) => {
                for (let i = 0; i < state.length; i++) {
                    if (state[i].id.addressId === action.payload.id.addressId) {
                        state[i].isDefault = true;
                    } else state[i].isDefault = false;
                }
                return state;
            })
    }
})