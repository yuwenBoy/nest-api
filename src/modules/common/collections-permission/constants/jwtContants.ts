/**
 * JWT key
 */
export const jwtContants = {
  secret: 'json_web_token_secret_key',
  expiresIn:'1h', // token过期时间 默认值1天  d天后过期 s秒后过期
};
      

// token 在多长时间内刷新不过期，超过多长时间后过期
export const refreshExpiresIn = '2h'