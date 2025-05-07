import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { MinLength, IsNotEmpty, IsNumber } from "class-validator";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @MinLength(2, { message: "Product name must be at least 2 characters long" })
  @IsNotEmpty({ message: "Product name is required" })
  title: string;

  @Column({ nullable: false })
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @Column("decimal", { nullable: false })
  @IsNumber()
  price: number;

  @Column({ nullable: false })
  @MinLength(2, { message: "Category must be at least 2 characters long" })
  @IsNotEmpty({ message: "Category is required" })
  category: string;

  @Column()
  @IsNotEmpty({ message: "Image is required" })
  image: string;

  @Column({ default: 1 })
  @IsNotEmpty({ message: "Stock quantity is required" })
  @IsNumber()
  quantity: number;
}
