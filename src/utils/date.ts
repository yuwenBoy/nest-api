/**
 * 时间戳转化为年 月 日 时 分 秒
 * number: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
 */
export const formatTime = (number: any) => {
  // 时间戳为10位需*1000，时间戳为13位不需乘1000
  var date = new Date(number * 1000);
  var Y = date.getFullYear() + '-';
  var M =
    (date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  var h = date.getHours() < 10 ? '0' + date.getHours() + ':':date.getHours()+':';
  var m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':': date.getMinutes() + ':';
  var s = date.getSeconds() <10 ? '0'+date.getSeconds():date.getSeconds();
  return Y + M + D + h + m + s;
};

/**
 * 日期转为时间戳
 * @param time 日期
 * @return 格式化后的时间
 */
export function timeStamp(time) {
  let date = new Date(time.replace(/-/g, '/')).getTime();
  date = date / 1000;
  return date;
}
