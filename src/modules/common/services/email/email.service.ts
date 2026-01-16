import * as nodemailer from 'nodemailer';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // QQ 邮箱的 SMTP 服务器
    port: 465, // QQ 邮箱的 SMTP 端口
    secure: true, // 使用 SSL
    auth: {
      user: '663104562@qq.com',//process.env.EMAIL_USER, // 邮箱账号
      pass: 'kcupvqfrgsnybffj',//process.env.EMAIL_PASSWORD, // 邮箱密码或应用专用密码
    },
  });

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: '663104562@qq.com',
      to,
      subject,
      text,
    });
  }
}
