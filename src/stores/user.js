// stores/user.js
import {ref} from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import router from '@/router';
axios.defaults.withCredentials = true; // withCredentials 전역 설정

const REST_API_URL = `http://localhost:8080/api/users`

export const useUserStore = defineStore('user', () => {
  const isLogined = ref(false);

  const signup = function(user) {
    axios({
      url: REST_API_URL + "/signup",
      method: "POST",
      data: user
    })
    .then((response) => {
      console.log(response.data);
      const msg = response.data.msg;
      
      router.push("/");

      if (msg == "success") {
        alert("회원 가입에 성공했습니다. 로그인 창으로 이동해주세요");
      }

    })
    .catch((error) => {
    console.error(error.response?.data || error.message); // 에러 응답 데이터를 출력
    });
  }

  const login = function(user) {
    axios({
      url: REST_API_URL + "/login",
      method: "POST",
      data: user
    })
    .then((response) => {
      isLogined.value = true;
      console.log("isLogin: " , isLogined);
      router.push("/");
      sessionStorage.setItem("userId", response.data.userId);
      sessionStorage.setItem("nickname", response.data.nickname);

    })
    .catch((response) => {
      console.log(response);
    })
  }

  const logout = function() {
    axios({
      url: REST_API_URL + "/logout",
      method: 'GET'
    })
    .then(() => {
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('nickname');
      isLogined.value = false;
      router.push("/");
    })
    .catch(() => {
      console.log();
    })
  }

  return {signup, login,isLogined, logout};
});
