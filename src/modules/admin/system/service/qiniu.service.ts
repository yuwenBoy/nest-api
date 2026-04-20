import { Injectable } from '@nestjs/common';
import * as qiniu from 'qiniu';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QiniuService {
  private readonly mac: qiniu.auth.digest.Mac;
  private readonly bucket: string;
  private readonly cdnHost: string;

  constructor(private configService: ConfigService) {
    const accessKey = this.configService.get<string>('qiniu.accessKey');
    const secretKey = this.configService.get<string>('qiniu.secretKey');
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.bucket = this.configService.get<string>('qiniu.bucket');
    this.cdnHost = this.configService.get<string>('qiniu.cdnHost');
  }

  // 获取上传token
  private getUploadToken() {
    const options = {
      scope: this.bucket,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(this.mac);
  }

  // 核心：文件上传
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadToken = this.getUploadToken();
    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    // 生成唯一文件名，防止覆盖
    const suffix = file.originalname.split('.').pop();
    const key = `img/${uuidv4()}.${suffix}`;

    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        key,
        file.buffer,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            // 返回完整图片访问地址
            resolve(`${this.cdnHost}/${respBody.key}`);
          } else {
            reject(respBody);
          }
        },
      );
    });
  }

  // 删除七牛云文件
  async deleteFile(fileKey: string): Promise<void> {
    const bucketManager = new qiniu.rs.BucketManager(
      this.mac,
      new qiniu.conf.Config(),
    );
    const key = this.getKeyFromUrl(fileKey);
    return new Promise((resolve, reject) => {
      bucketManager.delete(this.bucket, key, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // 从图片URL中提取key
  getKeyFromUrl(url: string): string {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return parsed.pathname.substring(1); // 去掉前面的 /
    } catch (e) {
      return null;
    }
  }
}
