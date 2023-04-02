import * as svgCaptcha from 'svg-captcha';
/**
 * 生成随机验证码吗
 * @param size 验证码个数
 * @returns 对象
 */
export const Captcha = (size = 4) => {
  return svgCaptcha.create({
    size, //生成验证码个数
    fontSize: 50, // 文字大小
    width: 100, // 宽度
    height: 34, // 高度
    color: true,
    // background:'#cc9966', //背景颜色
    // ignoreChars:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxz',
  });
};
