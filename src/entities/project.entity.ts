import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ProjectStatus {
  Draft = 'draft',
  Active = 'active',
  Hibernating = 'hibernating',
  Complete = 'complete',
  Archived = 'archived',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  status!: ProjectStatus;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'created_at', type: 'integer' })
  createdAt!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
