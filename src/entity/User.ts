import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsEmail, MinLength } from "class-validator";
import { Expose } from "class-transformer";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @Expose()
  name: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "Invalid email format" })
  @Expose()
  email: string;

  @Column({ unique: true })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Expose()
  password: string;
}
