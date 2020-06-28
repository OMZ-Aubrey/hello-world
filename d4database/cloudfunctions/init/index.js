const tcb = require("@cloudbase/node-sdk");

const cloud = tcb.init({
  env: "env-ocqdance",
});
const db = cloud.database();
const _ = db.command;
const pages = 100;

exports.main = async(event, context) =>{
  let res = {};
  const auth = cloud.auth().getUserInfo();
  const uid = auth.uid;

  if (ids.length != 0) {
    console.log(ids[0]);
    const countResult = await db.collection('advice').count();
    const total = countResult.total;
    const batchTimes = Math.ceil(total / pages);
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = await db.collection('advice').skip(i * pages).limit(pages).orderBy('adddue', 'desc').get();
      tasks.push(promise);
    }
    res.list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    }).data;
    res.code = 0;
  }
  else {
    res.code = 1;
  }
  return res;
}