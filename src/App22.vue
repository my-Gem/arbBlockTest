<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <div :style="{ display: 'flex', justifyContent: 'center' }">
      <pre :style="{ textAlign: 'left' }">
        <code>{{ JSON.stringify(blocklet, null, 2) }}</code>
    </pre>
    </div>
    <div>
      <input type="text" v-model="addr" @keyup.enter="search" placeholder="please enter wallet address" />
    </div>
    <div class="page">
      <button @click="firstPage">首页</button>
      <button @click="prevPage">上一页</button>
      <!-- <span>第{{ productList.current }}页/共{{ productList.pages }}页</span> -->
      <button @click="nextPage">下一页</button>
      <button @click="lastPage">尾页</button>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import axios from 'axios';
export default {
  name: 'App',
  components: {
    HelloWorld,
  },
  data() {
    return {
      blocklet: window?.blocklet,
      list: null,
      listLoading: true,
      totalPage: 1, // 统共页数，默认为1
      currentPage: 1, //当前页数 ，默认为1
      pageSize: 30, // 每页显示数量
      currentPageData: [], //当前页显示内容
      headPage: 1,
      account: null,
      chainId: null,
      addr: null,
      // productList: [], //所有数据
      // totalPage: 1, // 统共页数，默认为1
      // currentPage: 1, //当前页数，默认为1
      // pageSize: 30, // 每页显示数量
    };
  },
  methods: {
    getCurrentPageData() {
      let begin = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      this.currentPageData = this.list.slice(begin, end);
    },
    //首页
    firstPage() {
      this.currentPage = this.headPage;
      this.getCurrentPageData();
    },
    //上一页
    prevPage() {
      if (this.currentPage == 1) {
        return false;
      } else {
        this.currentPage--;
        this.getCurrentPageData();
      }
    },
    // 下一页
    nextPage() {
      if (this.currentPage == this.totalPage) {
        return false;
      } else {
        this.currentPage++;
        this.getCurrentPageData();
      }
    },
    //尾页
    lastPage() {
      if (this.currentPage == this.totalPage) {
        return false;
      } else {
        this.currentPage = this.totalPage;
        this.getCurrentPageData();
      }
    },
    search() {
      console.log('addr:  ', this.addr);
      if (this.addr.startsWith('0x') && this.addr.length == 42) {
        axios
          .get(`http://192.168.124.5:39037/api/txs/${this.addr}`)
          .then((data) => {
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
      } else {
        alert('Please enter correct address');
        this.addr = "";
        return;
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

