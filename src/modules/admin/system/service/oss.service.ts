import { Injectable } from "@nestjs/common";
import { UserInfoDto } from "../dto/user/userInfo.dto";
import * as uuid from 'uuid';
// import mime from 'mime-types'
import * as fs from 'fs';
let path = require("path");
let mime = require('mime-types')
import { ConfigService } from "@nestjs/config";
import { instanceToInstance, plainToInstance } from "class-transformer";
import { UserEntity } from "src/entities/admin/t_user.entity";
import { getManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { url } from "inspector";
@Injectable()
export class OssService {
    private readonly productLocation = process.cwd()
    private isAbsPath = false;

    constructor(private readonly config:ConfigService,  
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,){
        this.isAbsPath = path.isAbsolute(this.config.get('admin.file.location'))
    }

    async updateAvatar(files:Express.Multer.File[],user:UserInfoDto):Promise<any> {
        const ossList = files.map(file => {   
            const newFileName = `${uuid.v4().replace(/-/g,'')}.${mime.extension(file.mimetype)}`;
            const fileLocation = path.normalize(this.isAbsPath ? `${this.config.get('admin.file.location')}/${newFileName}` : path.join(this.productLocation,`${this.config.get('admin.file.location')}`,newFileName));
            const writeFile = fs.createWriteStream(fileLocation);

            writeFile.write(file.buffer);
            writeFile.close();
            const ossFile = {
                url: `${this.config.get('admin.file.domain')}${this.config.get('admin.file.serveRoot') || ''}/${newFileName}`,
                size: file.size,
                type: file.mimetype,  
                location: fileLocation,
                id:user.id,
            }
            return ossFile
        });

        
        // return ossList;
        console.log(await this.userRepository.findOneById(user.id)) 
        let result = await this.userRepository.createQueryBuilder().update(UserEntity)
        .set({
            avatar:ossList[0].location,
            update_by: user.username,
          })
          .where('id = :id', { id: user.id })
          .execute();
        if(!result) {
            return '文件存储失败，请稍后重新上传';
        }
        return ossList
    }
}