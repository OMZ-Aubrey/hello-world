两个任务。
1、将意见反馈平台的管理端部分的function：initlist改为列表加载变成实时数据库监听形式触发

* 加载意见列表（调用云函数：init）
 */
function initlist(){
    const db = cloud.database()
    const _ = db.command
    db
        .collection('advice')
        .where({
            advice: _.neq("")
        })
        .which({
            onChange: res=>{
                console.log(res.docs);
                let list = res.docs.map(item =>{
                    item.adddue = new Date(item.adddue.$date)
                    return item;
                })
                refreshlist(list)
            },
            onError:err =>{
                console.error(err);
            }
    
        });
}

2、用户端列表加载云函数（function：init）适配超过100条的场景，采用promise all的形式进行改造，使其可以支持超过100条

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
