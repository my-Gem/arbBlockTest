\<template>
  <div id="app">
    <HelloWorld msg="Query blockchain transaction data" />
    <div :style="{ display: 'flex', justifyContent: 'center' }">
      <pre :style="{ textAlign: 'left' }">
        <code>{{ JSON.stringify(blocklet, null, 2) }}</code>
    </pre>
    </div>
    <div>
      <input type="text" v-model="addr" placeholder="please enter wallet address" /><button @click="searchAll">
        search
      </button>
    </div>
    <div :style="{ display: 'flex', justifyContent: 'center' }">
      <table>
        <tr>
          <td>交易哈希</td>
          <td>区块高度</td>
          <td>时间戳</td>
          <td>从</td>
          <td>自</td>
          <td>手续费</td>
        </tr>
        <tr v-for="(item, index) in currentPageData" :key="index">
          <td>{{ item.hash }}</td>
          <td>{{ item.blockNumber }}</td>
          <td>
            {{
              new Date(item.timeStamp * 1000).toLocaleDateString().replace(/\//g, '-') +
              ' ' +
              new Date(item.timeStamp * 1000).toTimeString().substr(0, 8)
            }}
          </td>
          <td>{{ item.from }}</td>
          <td>{{ item.hash }}</td>
          <td>
            {{ new bigNumber(item.gasPrice).multipliedBy(new bigNumber(item.gasUsed)).dividedBy(10 ** 18) }} Ether
          </td>
        </tr>
      </table>
    </div>
    <div>
      <button @click="firstPage">首页</button>
      <button @click="prevPage">上一页</button>
      <button @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import axios from 'axios';
import BigNumber from 'bignumber.js';
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
      currentPage: 1, //当前页数 ，默认为1
      currentPageData: [], //当前页显示内容
      headPage: 1,
      addr: null,
      bigNumber: BigNumber,
    };
  },
  methods: {
    //首页
    firstPage() {
      this.currentPage = this.headPage;
      this.search();
    },
    //上一页
    prevPage() {
      if (this.currentPage === 0) {
        return false;
      } else if (this.currentPage == 1) {
        this.search(this.currentPage);
      } else {
        this.currentPage--;
        this.search(this.currentPage);
      }
    },
    //下一页
    nextPage() {
      this.currentPage++;
      this.search(this.currentPage);
    },
    search(pageBegin = 1) {
      this.addr = this.addr.trim();
      var _this = this;
      if (this.addr.startsWith('0x')) {
        //此步骤放到后端做比较好,当然此步骤也可以省略
        const alchemyUrl = 'https://eth-mainnet.alchemyapi.io/v2/b72m4oD0j-ENnP87KiOyCsJPzWrbaBc-';
        const data = {
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [`${this.addr}`, 'latest'],
        };

        axios({
          url: alchemyUrl,
          data: JSON.stringify(data),
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
          .then((res) => {
            if (res.data.result == '0x' && this.addr.length == 42) {
              console.log('this.addr:   ', this.addr);
              axios
                .get(`http://192.168.124.5:39037/api/txs/${this.addr}/${pageBegin}`)
                .then((showData) => {
                  console.log(showData);
                  if (data == []) {
                    return;
                  } else {
                    this.currentPageData = showData.data.result;
                    console.log('this.currentPageData:  ', this.currentPageData);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  alert(err);
                });
            } else {
              alert('Please enter correct wallet address');
              _this.addr = '';
              return;
            }
          })
          .catch((err) => {
            alert('Please enter correct address');
            _this.addr = '';
            return;
          });
      } else {
        alert('Please enter correct address');
        this.addr = '';
        return;
      }
    },
    searchAll() {
      this.addr = this.addr.trim();
      if (this.addr.startsWith('0x') && this.addr.length == 42) {
        axios
          .get(`http://192.168.124.5:39037/api/txs/${this.addr}/10000/`)
          .then((data) => {
            if (data == []) {
                    return;
                  } else {
                    this.currentPageData = showData.data.result;
                    console.log('this.currentPageData:  ', this.currentPageData);
                  }
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
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
