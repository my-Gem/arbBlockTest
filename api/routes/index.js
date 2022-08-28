const router = require('express').Router();
const axios = require('axios');
const circularJSON = require('circular-json');
const Etherscan_API_KEY = "HH86KIY5KJYNCRBFGBNS3A6QP4BIMUI1N8";

const redis = require('redis');
// 创建客户端
const redisClient = redis.createClient();
// 监听错误信息
redisClient.on('error', err => {
    console.error(err) // 打印监听到的错误信息
})
// 创建连接
async function start() {
    await redisClient.connect(6379, "127.0.0.1");
}
start();

router.get('/txs/:address/:page', async function (req, res) {
    if(req.params.page == 10000 && req.params.address){
        axios.get(`https://api-cn.etherscan.com/api?module=account&action=txlist&address=${req.params.address}&startblock=10000000&endblock=999999999&page=1&offset=10000&sort=asc&apikey=${Etherscan_API_KEY}`)
        .then(async (response) => {
            if (parseInt(response.data.status) == 1) {
                res.send(circularJSON.stringify(response.data));
            } else {
                if (response.data == []) {
                    res.send(circularJSON.stringify(response.data));
                }
            }
        })
        .catch(error => {
            console.log("error:", error);
        });
    }else{
        try {
            const redisShowData = await redisClient.get("arrid" + `${req.params.page}`);
            if (redisShowData) {
                JSON.parse(redisShowData).result.forEach(item => {
                    if (item.from == req.params.address || item.to == req.params.address) {

                    } else {
                        process.exit();
                    }
                })
                res.send(circularJSON.stringify(JSON.parse(redisShowData)));
            } else {

                axios.get(`https://api-cn.etherscan.com/api?module=account&action=txlist&address=${req.params.address}&startblock=10000000&endblock=999999999&page=${req.params.page}&offset=10&sort=asc&apikey=${Etherscan_API_KEY}`)
                    .then(async (response) => {

                        if (parseInt(response.data.status) == 1) {
                            res.send(circularJSON.stringify(response.data));
                            try {
                                if (await redisClient.get("arrid" + `${req.params.page}`) && await redisClient.get("speid" + `${req.params.page}`) == req.params.address) {
                                    return;
                                } else {

                                    redisClient.set("arrid" + `${req.params.page}`, JSON.stringify(response.data), async function (err, obj) {
                                        await redisClient.set("speid" + `${req.params.page}`, req.params.address);
                                        await redisClient.expire("arrid" + `${req.params.page}`, 259200);
                                        await redisClient.expire("speid" + `${req.params.page}`, 259200);

                                    })

                                }

                            } catch (err) {
                                console.log("*********", err);
                            }


                        } else {
                            if (response.data == []) {
                                res.send(circularJSON.stringify(response.data));
                            }
                        }


                    })
                    .catch(err => {

                        console.log(err);

                    })

            }
        } catch (err) {
            process.exit();
            console.log("redis error:", err);
        }
    } 
})

module.exports = router;
