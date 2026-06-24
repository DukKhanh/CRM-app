import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDarkMode: false, // Mặc định là nền sáng
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode; // Đảo ngược trạng thái
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;