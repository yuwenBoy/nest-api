import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'varchar', name: 'title'})
  title: string;

  @Column({type:'varchar', name: 'context'})
  context: string;
}
